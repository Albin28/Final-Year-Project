from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models
from database import get_db
import forecasting_engine

router = APIRouter(
    prefix="/api/forecasting",
    tags=["Forecasting"]
)


@router.get("/status")
def get_forecasting_status(db: Session = Depends(get_db)):
    """
    Lightweight status: returns product/bill counts without running ML.
    """
    total_products = db.query(models.Product).count()
    return {
        "total_products": total_products,
        "categories": {}  # populated lazily via /analytics/abc-xyz
    }


@router.get("/forecast/{product_id}")
def get_product_forecast(
    product_id: int,
    lead_time: int = 3,
    z_score: float = 1.65,
    db: Session = Depends(get_db)
):
    """
    Single merged endpoint: returns classification, metrics, best_model,
    feature_importance, predictions, and recommendation in one ML run.
    Uses TTL cache to avoid re-training within 5 minutes.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    plan = forecasting_engine.get_cached_forecast(db, product_id, lead_time, z_score)
    return {
        "product_name": product.name,
        "classification": plan["classification"],
        "metrics": plan["metrics"],
        "best_model": plan["best_model"],
        "feature_importance": plan.get("feature_importance", []),
        "predictions": plan["predictions"],
        "recommendation": plan["recommendation"]
    }


@router.get("/metrics/{product_id}")
def get_product_metrics(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    plan = forecasting_engine.get_cached_forecast(db, product_id)
    return {
        "product_name": product.name,
        "classification": plan["classification"],
        "metrics": plan["metrics"],
        "best_model": plan["best_model"],
        "feature_importance": plan.get("feature_importance", [])
    }


@router.get("/predictions/{product_id}")
def get_product_predictions(
    product_id: int,
    lead_time: int = 3,
    z_score: float = 1.65,
    db: Session = Depends(get_db)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    plan = forecasting_engine.get_cached_forecast(
        db, product_id, lead_time=lead_time, z_score=z_score
    )
    return {
        "product_name": product.name,
        "best_model": plan["best_model"],
        "feature_importance": plan.get("feature_importance", []),
        "predictions": plan["predictions"],
        "recommendation": plan["recommendation"]
    }


@router.get("/analytics/abc-xyz")
def get_abc_xyz_matrix(db: Session = Depends(get_db)):
    return forecasting_engine.get_abc_xyz_analysis(db)


@router.get("/analytics/anomalies/{product_id}")
def get_product_anomalies(product_id: int, db: Session = Depends(get_db)):
    return forecasting_engine.detect_sales_anomalies(db, product_id)


# -- NEW: System Status (LED polling) -----------------------------------------

@router.get("/system-status")
def get_system_status(db: Session = Depends(get_db)):
    """
    Returns model status (untrained/training/active), last trained time,
    and schedule. Frontend polls this to drive the LED indicator.
    """
    import prediction_tracker
    return prediction_tracker.get_maturity_status(db)


# -- NEW: Retrain Schedule ----------------------------------------------------

from pydantic import BaseModel
from typing import Optional

class ScheduleUpdate(BaseModel):
    type: str          # "manual" | "daily" | "weekly"
    time: Optional[str] = "23:59"   # "HH:MM"
    day: Optional[str] = "mon"      # for weekly: mon/tue/wed/thu/fri/sat/sun

@router.post("/retrain-schedule")
def update_retrain_schedule(body: ScheduleUpdate, db: Session = Depends(get_db)):
    """Update the auto-retrain schedule and immediately reschedule APScheduler."""
    import prediction_tracker
    import scheduler as sched_module
    schedule = {"type": body.type, "time": body.time, "day": body.day}
    prediction_tracker.set_retrain_schedule(db, schedule)
    sched_module.reschedule_from_db()
    return {"status": "ok", "schedule": schedule}

@router.get("/retrain-schedule")
def get_current_schedule(db: Session = Depends(get_db)):
    import prediction_tracker
    return prediction_tracker.get_retrain_schedule(db)


# -- NEW: Accuracy History (chart) --------------------------------------------

@router.get("/accuracy-history")
def get_accuracy_history(days: int = 60, db: Session = Depends(get_db)):
    """Returns daily portfolio-average MAE for the accuracy trend chart."""
    import prediction_tracker
    return prediction_tracker.get_accuracy_history(db, days=days)


# -- NEW: Reconcile actuals (manual trigger) ----------------------------------

@router.post("/reconcile")
def reconcile_actuals(db: Session = Depends(get_db)):
    """Manually trigger reconciliation of pending prediction log entries."""
    import prediction_tracker
    prediction_tracker.reconcile_actuals(db)
    return {"status": "ok"}


# -- NEW: Dashboard summary endpoints -----------------------------------------

@router.get("/dashboard/today")
def get_today_summary(db: Session = Depends(get_db)):
    """Returns today's revenue, transaction count, top-selling product."""
    import prediction_tracker
    summary = prediction_tracker.get_today_summary(db)
    pending_pos = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.status != "Delivered"
    ).count() if hasattr(models, "PurchaseOrder") else 0
    summary["pending_purchase_orders"] = pending_pos
    return summary


@router.get("/dashboard/recent-bills")
def get_recent_bills(db: Session = Depends(get_db)):
    """Returns last 5 bills for the recent sales feed."""
    import prediction_tracker
    return prediction_tracker.get_recent_bills(db, limit=5)


# -- Self-Train (runs in background thread, LED goes orange immediately) -------

import threading

@router.post("/train")
def self_train_model(reset_dataset: bool = False, force: bool = False, db: Session = Depends(get_db)):
    """
    Train AI forecasting models. If reset_dataset is True or DB is empty,
    reseeds from Master Top 30 Dataset. Otherwise runs incremental dirty-flag retrain.
    Set force=True to force retraining all products unconditionally.
    """
    try:
        import prediction_tracker

        if reset_dataset or db.query(models.Product).count() == 0:
            import unify_top30_dataset
            unify_top30_dataset.unify_datasets()
            prediction_tracker.run_full_retrain(db, force=True)
        else:
            prediction_tracker.run_full_retrain(db, force=force)

        products_count = db.query(models.Product).count()
        bills_count = db.query(models.Bill).count()
        items_count = db.query(models.BillItem).count()

        return {
            "status": "success",
            "message": "AI Forecasting Models successfully trained!",
            "products_imported": products_count,
            "bills_created": bills_count,
            "items_imported": items_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to execute self-training on Top 30 dataset: {str(e)}"
        )

