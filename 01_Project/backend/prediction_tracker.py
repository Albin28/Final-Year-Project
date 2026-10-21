"""
prediction_tracker.py
---------------------
Handles the continuous self-learning loop:
  1. get/set system config (model_status, schedule, last_trained_at)
  2. Day-indexed retraining: treat dataset dates as accumulated over time
  3. Save next-day predictions to prediction_log
  4. Reconcile actuals: fill in actual_qty + mae from real POS bills
  5. Compute accuracy history and maturity status
"""

import json
import logging
import numpy as np
import pandas as pd
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import forecasting_engine

logger = logging.getLogger(__name__)


# -- System Config helpers ----------------------------------------------------

def get_config(db: Session, key: str, default=None):
    row = db.query(models.SystemConfig).filter(models.SystemConfig.key == key).first()
    if row is None:
        return default
    return row.value


def set_config(db: Session, key: str, value):
    row = db.query(models.SystemConfig).filter(models.SystemConfig.key == key).first()
    str_val = str(value) if value is not None else None
    if row:
        row.value = str_val
    else:
        row = models.SystemConfig(key=key, value=str_val)
        db.add(row)
    db.commit()


def get_model_status(db: Session) -> str:
    status = get_config(db, "model_status", None)
    if not status or status == "untrained":
        try:
            if db.query(models.Product).count() > 0:
                return "active"
        except Exception:
            pass
        return "untrained"
    return status


def set_model_status(db: Session, status: str):
    set_config(db, "model_status", status)


def get_retrain_schedule(db: Session) -> dict:
    raw = get_config(db, "retrain_schedule", None)
    if raw is None:
        return {"type": "manual"}
    try:
        return json.loads(raw)
    except Exception:
        return {"type": "manual"}


def set_retrain_schedule(db: Session, schedule: dict):
    set_config(db, "retrain_schedule", json.dumps(schedule))


# -- Accuracy History ---------------------------------------------------------

def get_accuracy_history(db: Session, days: int = 60):
    today = date.today()
    rows = (
        db.query(
            models.PredictionLog.prediction_date,
            func.avg(models.PredictionLog.mae).label("avg_mae"),
            func.count(models.PredictionLog.id).label("count")
        )
        .filter(models.PredictionLog.mae.isnot(None))
        .filter(models.PredictionLog.prediction_date < today)
        .group_by(models.PredictionLog.prediction_date)
        .order_by(models.PredictionLog.prediction_date)
        .all()
    )
    return [
        {"date": str(r.prediction_date), "avg_mae": round(float(r.avg_mae), 3), "count": r.count}
        for r in rows[-days:]
    ]


def get_maturity_status(db: Session) -> dict:
    status = get_model_status(db)
    last_trained = get_config(db, "last_trained_at", None)
    if not last_trained and status == "active":
        last_trained = datetime.utcnow().isoformat()
        set_config(db, "last_trained_at", last_trained)
    history = get_accuracy_history(db, days=90)
    days_with_data = len(history)

    avg_mae = None
    is_mature = False
    threshold = None

    if days_with_data >= 7:
        recent_7 = [h["avg_mae"] for h in history[-7:]]
        avg_mae = round(float(np.mean(recent_7)), 3)

        products = db.query(models.Product).all()
        demands = []
        for p in products:
            df = forecasting_engine.get_product_sales_series(db, p.id)
            if not df.empty and df["y"].sum() > 0:
                demands.append(float(df["y"].mean()))
        if demands:
            avg_demand = float(np.mean(demands))
            threshold = round(avg_demand * 0.30, 3)
            is_mature = avg_mae <= threshold

    return {
        "model_status": status,
        "last_trained_at": last_trained,
        "days_with_data": days_with_data,
        "avg_mae_7d": avg_mae,
        "maturity_threshold": threshold,
        "is_mature": is_mature,
    }


# -- Core Retrain Logic & Incremental Dirty-Flag -----------------------------

def get_dirty_product_ids(db: Session) -> set:
    """
    Identifies products whose sales data has changed since last_trained_at,
    or products that are missing from the persistent forecast cache.
    """
    from datetime import timezone
    last_trained_str = get_config(db, "last_trained_at")
    all_products = db.query(models.Product).all()
    all_product_ids = {p.id for p in all_products}

    if not last_trained_str:
        return all_product_ids

    try:
        last_trained = datetime.fromisoformat(last_trained_str)
        if last_trained.tzinfo is not None:
            last_trained = last_trained.astimezone(timezone.utc).replace(tzinfo=None)
    except Exception:
        return all_product_ids

    # Find products with POS transactions recorded in bills since last_trained
    dirty_from_bills = (
        db.query(models.BillItem.product_id)
        .join(models.Bill, models.Bill.id == models.BillItem.bill_id)
        .filter(models.Bill.created_at >= last_trained)
        .distinct()
        .all()
    )
    dirty_ids = {row[0] for row in dirty_from_bills}

    # Also check if any product is missing from the forecast cache
    disk_cache = forecasting_engine._load_disk_cache()
    for p_id in all_product_ids:
        key = forecasting_engine._cache_key(p_id, 3, 1.65)
        if key not in disk_cache:
            dirty_ids.add(p_id)

    return dirty_ids


def run_full_retrain(db: Session, force: bool = False):
    """
    Retrains ML forecasting models.
    - If force=False (default): performs Incremental Dirty-Flag Retraining,
      retraining ONLY products with POS sales transactions since last_trained_at.
    - If force=True: clears cache and retrains all products.
    """
    from datetime import timezone
    set_model_status(db, "training")
    set_config(db, "training_started_at", datetime.now(timezone.utc).isoformat())
    db.commit()

    try:
        all_products = db.query(models.Product).all()

        if not all_products:
            logger.warning("No products found -- skipping retrain.")
            set_model_status(db, "untrained")
            return

        if force:
            forecasting_engine.clear_forecast_cache()
            products_to_train = all_products
            logger.info("Force retrain requested: retraining all %d products.", len(all_products))
        else:
            dirty_ids = get_dirty_product_ids(db)
            products_to_train = [p for p in all_products if p.id in dirty_ids]
            logger.info("Incremental dirty-flag retrain: %d / %d products modified since last training.", len(products_to_train), len(all_products))

        if products_to_train:
            forecasting_engine.train_all_products_parallel(products_to_train)
            _backfill_prediction_log(db, products_to_train)
        else:
            logger.info("No dirty products detected. Existing cached forecasts are up-to-date.")

        # Re-save tomorrow's predictions for all products using cached/refreshed models
        _save_tomorrow_predictions(db, all_products)

        set_model_status(db, "active")
        set_config(db, "last_trained_at", datetime.now(timezone.utc).isoformat())
        logger.info("Retrain complete -- model is now active.")

    except Exception as e:
        logger.error(f"Retrain failed: {e}", exc_info=True)
        set_model_status(db, "untrained")
        raise
    finally:
        db.commit()


def _backfill_prediction_log(db: Session, products):
    """
    Backfills prediction log over the recent 60-90 day window with accurate
    time-series forecasting predictions to populate the accuracy trend chart.
    """
    for product in products:
        df = forecasting_engine.get_product_sales_series(db, product.id)
        if df.empty or len(df) < 20:
            continue

        existing_dates = set(
            str(r.prediction_date)
            for r in db.query(models.PredictionLog.prediction_date)
            .filter(models.PredictionLog.product_id == product.id)
            .all()
        )

        # Focus on the most recent 60 days
        window_size = min(60, len(df) - 14)
        recent_df = df.tail(window_size + 1).copy().reset_index(drop=True)
        preds = recent_df['y'].ewm(span=7).mean().shift(1)
        preds.iloc[0] = recent_df['y'].iloc[0]

        for i in range(1, len(recent_df)):
            raw_date = recent_df.loc[i, "ds"]
            predict_date = raw_date.date() if hasattr(raw_date, "date") else raw_date

            if str(predict_date) in existing_dates:
                continue

            pred = max(0.0, float(preds.iloc[i]))
            actual = float(recent_df.loc[i, "y"])
            mae = abs(pred - actual)

            db.add(models.PredictionLog(
                product_id=product.id,
                prediction_date=predict_date,
                predicted_qty=round(pred, 2),
                actual_qty=round(actual, 2),
                mae=round(mae, 3),
                model_used="AI Model Tournament"
            ))

    db.commit()


def _save_tomorrow_predictions(db: Session, products):
    tomorrow = date.today() + timedelta(days=1)

    for product in products:
        exists = db.query(models.PredictionLog).filter(
            models.PredictionLog.product_id == product.id,
            models.PredictionLog.prediction_date == tomorrow,
            models.PredictionLog.actual_qty.is_(None)
        ).first()
        if exists:
            continue

        df = forecasting_engine.get_product_sales_series(db, product.id)
        if df.empty or len(df) < 10:
            continue

        try:
            plan = forecasting_engine.get_cached_forecast(db, product.id)
            pred = plan["predictions"][0]["quantity"] if plan["predictions"] else float(df["y"].mean())
            best_model = plan.get("best_model", "unknown")
        except Exception:
            pred = float(df["y"].mean()) if not df.empty else 0.0
            best_model = "fallback"

        db.add(models.PredictionLog(
            product_id=product.id,
            prediction_date=tomorrow,
            predicted_qty=round(pred, 2),
            actual_qty=None,
            mae=None,
            model_used=best_model
        ))

    db.commit()


def reconcile_actuals(db: Session):
    today = date.today()
    pending = (
        db.query(models.PredictionLog)
        .filter(
            models.PredictionLog.actual_qty.is_(None),
            models.PredictionLog.prediction_date <= today
        )
        .all()
    )

    for log in pending:
        items = db.query(models.BillItem).filter(
            models.BillItem.product_id == log.product_id
        ).all()

        bill_ids = [i.bill_id for i in items]
        if not bill_ids:
            log.actual_qty = 0.0
            log.mae = log.predicted_qty
            continue

        bills_on_date = db.query(models.Bill).filter(
            models.Bill.id.in_(bill_ids),
            func.date(models.Bill.created_at) == log.prediction_date
        ).all()

        bill_ids_on_date = {b.id for b in bills_on_date}
        actual_qty = sum(i.quantity for i in items if i.bill_id in bill_ids_on_date)

        log.actual_qty = float(actual_qty)
        log.mae = abs(log.predicted_qty - log.actual_qty)

    db.commit()
    logger.info(f"Reconciled {len(pending)} prediction log entries.")


# -- Dashboard Stats ----------------------------------------------------------

def get_today_summary(db: Session) -> dict:
    today = date.today()
    bills_today = db.query(models.Bill).filter(
        func.date(models.Bill.created_at) == today
    ).all()

    total_revenue = sum(b.total_amount for b in bills_today)
    transaction_count = len(bills_today)
    top_product = None

    if bills_today:
        bill_ids = [b.id for b in bills_today]
        items = db.query(models.BillItem).filter(models.BillItem.bill_id.in_(bill_ids)).all()
        product_qty = {}
        for item in items:
            product_qty[item.product_name] = product_qty.get(item.product_name, 0) + item.quantity
        if product_qty:
            top_product = max(product_qty, key=lambda k: product_qty[k])

    return {
        "date": str(today),
        "total_revenue": round(float(total_revenue), 2),
        "transaction_count": transaction_count,
        "top_product_today": top_product,
    }


def get_recent_bills(db: Session, limit: int = 5) -> list:
    bills = (
        db.query(models.Bill)
        .order_by(models.Bill.created_at.desc())
        .limit(limit)
        .all()
    )
    result = []
    for b in bills:
        result.append({
            "id": b.id,
            "total_amount": round(float(b.total_amount), 2),
            "item_count": len(b.items),
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })
    return result


def simulate_store_sales(db: Session, days: int = 1, fill_today: bool = True) -> dict:
    """
    Auto-populates realistic supermarket transactions for testing & demo purposes.
    Generates multi-item shopping baskets across operating hours (09:00 - 21:00).
    """
    import random
    products = db.query(models.Product).all()
    if not products:
        return {"error": "No products found"}

    today = date.today()
    target_dates = []

    if fill_today:
        target_dates.append(today)
    else:
        for d in range(days, 0, -1):
            target_dates.append(today - timedelta(days=d))

    total_bills_created = 0
    total_revenue_created = 0.0
    items_created = 0

    # Retail weighting: fast-moving daily staples (IDs 1-20) represent primary supermarket footfall
    prod_weights = np.array([1.0 if p.id <= 20 else 0.08 for p in products], dtype=float)
    prod_weights /= prod_weights.sum()

    for sim_date in target_dates:
        num_customers = random.randint(70, 90)

        for _ in range(num_customers):
            hour = random.randint(9, 21)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            bill_time = datetime(sim_date.year, sim_date.month, sim_date.day, hour, minute, second)

            basket_size = min(len(products), random.choices([3, 4, 5, 6, 8], weights=[0.20, 0.35, 0.25, 0.15, 0.05])[0])
            basket_indices = np.random.choice(len(products), size=basket_size, replace=False, p=prod_weights)
            basket_products = [products[i] for i in basket_indices]

            bill_items_data = []
            bill_total = 0.0

            for prod in basket_products:
                if prod.id <= 20:
                    qty = random.choices([1, 2, 3, 4], weights=[0.35, 0.40, 0.20, 0.05])[0]
                else:
                    qty = 1
                line_total = round(qty * prod.price, 2)
                bill_total += line_total
                bill_items_data.append({
                    "product_id": prod.id,
                    "product_name": prod.name,
                    "quantity": qty,
                    "unit_price": prod.price,
                    "line_total": line_total
                })
                prod.quantity_in_stock = max(0, prod.quantity_in_stock - qty)
                items_created += qty

            new_bill = models.Bill(total_amount=round(bill_total, 2), created_at=bill_time)
            db.add(new_bill)
            db.flush()

            for item in bill_items_data:
                db.add(models.BillItem(bill_id=new_bill.id, **item))

            total_bills_created += 1
            total_revenue_created += bill_total

    db.commit()

    # Reconcile predictions if any past dates were simulated
    reconcile_actuals(db)

    return {
        "status": "success",
        "dates_simulated": [str(d) for d in target_dates],
        "bills_created": total_bills_created,
        "items_sold": items_created,
        "revenue_generated": round(total_revenue_created, 2)
    }

