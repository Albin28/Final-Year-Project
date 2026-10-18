import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import time

# ---------------------------------------------------------------------------
# Persistent Disk + In-Memory Cache: avoids re-training ML models on repeated requests
# ---------------------------------------------------------------------------
import os
import json

_CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "forecast_cache.json")
_forecast_cache: dict = {}
_CACHE_TTL_SECONDS = 86400  # 24 hours in memory


def _load_disk_cache() -> dict:
    if os.path.exists(_CACHE_FILE):
        try:
            with open(_CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save_disk_cache(cache_dict: dict):
    try:
        with open(_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache_dict, f, indent=2)
    except Exception as e:
        print(f"Error saving disk cache: {e}")


def _cache_key(product_id: int, lead_time: int, z_score: float) -> str:
    return f"{product_id}:{lead_time}:{z_score}"


def clear_forecast_cache():
    """Invalidates all cached forecasts (called after self-train)."""
    _forecast_cache.clear()
    if os.path.exists(_CACHE_FILE):
        try:
            os.remove(_CACHE_FILE)
        except Exception:
            pass


def get_cached_forecast(db: Session, product_id: int, lead_time: int = 3, z_score: float = 1.65):
    """
    Returns a cached forecast plan from memory or persistent disk cache.
    Always updates recommendation with real-time inventory from the database.
    """
    key = _cache_key(product_id, lead_time, z_score)
    now = time.monotonic()
    plan = None

    if key in _forecast_cache:
        ts, plan = _forecast_cache[key]
    else:
        disk_data = _load_disk_cache()
        if key in disk_data:
            plan = disk_data[key]
            _forecast_cache[key] = (now, plan)

    if plan:
        # Refresh live stock recommendation from DB so changes appear immediately
        product = db.query(models.Product).filter(models.Product.id == product_id).first()
        current_stock = product.quantity_in_stock if product else 0
        product_reorder_level = product.reorder_level if product else 0

        rec = plan["recommendation"]
        target_inventory = rec["target_inventory"]
        reorder_point = rec["reorder_point"]

        restock_needed = (current_stock < target_inventory) and (current_stock <= max(reorder_point, product_reorder_level))
        restock_volume = max(0, target_inventory - current_stock) if restock_needed else 0

        fresh_plan = dict(plan)
        fresh_rec = dict(rec)
        fresh_rec["current_stock"] = current_stock
        fresh_rec["restock_needed"] = bool(restock_needed)
        fresh_rec["recommended_volume"] = int(np.ceil(restock_volume))
        fresh_plan["recommendation"] = fresh_rec
        return fresh_plan

    plan = generate_forecast_and_inventory_plan(db, product_id, lead_time, z_score)
    _forecast_cache[key] = (now, plan)
    disk_data = _load_disk_cache()
    disk_data[key] = plan
    _save_disk_cache(disk_data)
    return plan

# Try imports, fallback gracefully if packages are still installing
try:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing, SimpleExpSmoothing
except ImportError:
    ExponentialSmoothing = None
    SimpleExpSmoothing = None

try:
    import logging
    logging.getLogger('prophet').setLevel(logging.ERROR)
    logging.getLogger('prophet.plot').setLevel(logging.CRITICAL)
    logging.getLogger('cmdstanpy').setLevel(logging.ERROR)
    from prophet import Prophet
except ImportError:
    Prophet = None

try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, IsolationForest
    from sklearn.metrics import r2_score
    from sklearn.cluster import KMeans
except ImportError:
    RandomForestRegressor = None
    GradientBoostingRegressor = None
    IsolationForest = None
    r2_score = None
    KMeans = None


def get_product_sales_series(db: Session, product_id: int):
    """
    Fetch historical daily sales for a product, returning a pandas DataFrame
    with 'ds' (date) and 'y' (quantity sold).
    """
    items = db.query(models.BillItem).filter(models.BillItem.product_id == product_id).all()
    if not items:
        return pd.DataFrame(columns=['ds', 'y'])

    bill_ids = [item.bill_id for item in items]
    bills = db.query(models.Bill).filter(models.Bill.id.in_(bill_ids)).all()
    bill_date_map = {b.id: b.created_at for b in bills}

    data = []
    for item in items:
        date = bill_date_map.get(item.bill_id)
        if date:
            date_only = date.date() if isinstance(date, datetime) else date
            data.append({"ds": pd.to_datetime(date_only), "qty": item.quantity})

    df = pd.DataFrame(data)
    if df.empty:
        return pd.DataFrame(columns=['ds', 'y'])

    df = df.groupby('ds')['qty'].sum().reset_index()
    df = df.set_index('ds')
    all_dates = pd.date_range(start=df.index.min(), end=df.index.max(), freq='D')
    df = df.reindex(all_dates, fill_value=0).reset_index()
    df.columns = ['ds', 'y']
    return df


def classify_demand(df: pd.DataFrame):
    """
    Classify the demand pattern using Syntetos-Boylan Classification (SBC).
    """
    if df.empty or df['y'].sum() == 0:
        return {
            "adi": 0.0,
            "cv2": 0.0,
            "category": "Unknown",
            "description": "Insufficient sales data to classify."
        }

    positive_sales = df[df['y'] > 0]['y'].values
    total_periods = len(df)
    non_zero_periods = len(positive_sales)

    adi = total_periods / non_zero_periods if non_zero_periods > 0 else float('inf')

    mean_size = np.mean(positive_sales)
    std_size = np.std(positive_sales)
    cv2 = (std_size / mean_size) ** 2 if mean_size > 0 else 0.0

    if adi < 1.32 and cv2 < 0.49:
        category = "Regular"
        desc = "Smooth, high-frequency demand with low variability."
    elif adi < 1.32 and cv2 >= 0.49:
        category = "Erratic"
        desc = "Frequent demand but highly variable order sizes."
    elif adi >= 1.32 and cv2 < 0.49:
        category = "Intermittent"
        desc = "Sparsely occurring demand with consistent quantities."
    else:
        category = "Lumpy"
        desc = "Sparse and highly variable demand. Difficult to predict."

    return {
        "adi": round(float(adi), 3),
        "cv2": round(float(cv2), 3),
        "category": category,
        "description": desc
    }


def prepare_lag_features(df: pd.DataFrame):
    """
    Engineers time-series lag and rolling statistics features for ML regressors.
    """
    df_feat = df.copy()
    df_feat['lag_1'] = df_feat['y'].shift(1)
    df_feat['lag_7'] = df_feat['y'].shift(7)
    df_feat['rolling_mean_7'] = df_feat['y'].shift(1).rolling(window=7, min_periods=1).mean()
    df_feat['rolling_std_7'] = df_feat['y'].shift(1).rolling(window=7, min_periods=1).std().fillna(0)
    df_feat['day_of_week'] = df_feat['ds'].dt.dayofweek
    df_feat['is_weekend'] = df_feat['day_of_week'].isin([5, 6]).astype(int)
    df_feat['day_of_month'] = df_feat['ds'].dt.day
    df_feat = df_feat.dropna().reset_index(drop=True)
    feature_cols = ['lag_1', 'lag_7', 'rolling_mean_7', 'rolling_std_7', 'day_of_week', 'is_weekend', 'day_of_month']
    return df_feat, feature_cols


def calculate_error_metrics(y_true, y_pred):
    """
    Compute MAE, RMSE, MAPE, and R2 determination coefficient.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_pred = np.clip(y_pred, 0, None)

    mae = np.mean(np.abs(y_true - y_pred))
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
    
    mask = y_true > 0
    mape = np.mean(np.abs(y_true[mask] - y_pred[mask]) / y_true[mask]) * 100 if np.sum(mask) > 0 else 0.0

    r2 = 0.0
    if r2_score is not None and len(y_true) > 1:
        try:
            r2 = float(r2_score(y_true, y_pred))
            r2 = max(-1.0, min(1.0, r2))
        except Exception:
            r2 = 0.0

    return {
        "mae": round(float(mae), 3),
        "rmse": round(float(rmse), 3),
        "mape": round(float(mape), 3),
        "r2": round(float(r2), 3)
    }


def train_and_evaluate(df: pd.DataFrame, test_size=0.2, category: str = None):
    """
    Trains candidate models selectively based on Syntetos-Boylan Classification (SBC):
    - Regular demand: Gradient Boosting, Holt-Winters, Prophet (skips flat SES)
    - Intermittent / Lumpy demand: SES and Random Forest (skips heavy Prophet / Holt-Winters)
    - Erratic demand: Gradient Boosting, Random Forest, Prophet (skips flat SES)

    Returns error metrics, best model name, and feature importance for Explainable AI (XAI).
    """
    if len(df) < 15:
        return None, "Simple Exponential Smoothing", []

    split_idx = int(len(df) * (1 - test_size))
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()

    metrics = {}
    forecasts = {}
    feature_importances = []

    # Rule-Based MLOps: Smart Syntetos-Boylan Classification (SBC) Model Pruning
    if category is None:
        cls_info = classify_demand(df)
        category = cls_info.get("category", "Regular")

    if category in ["Intermittent", "Lumpy"]:
        candidates = {"Random Forest ML", "Simple Exponential Smoothing"}
    elif category == "Regular":
        candidates = {"Gradient Boosting ML", "Holt-Winters", "Prophet"}
    elif category == "Erratic":
        candidates = {"Gradient Boosting ML", "Random Forest ML", "Prophet"}
    else:
        candidates = {"Gradient Boosting ML", "Random Forest ML", "Holt-Winters", "Prophet", "Simple Exponential Smoothing"}

    # --- 1. Random Forest Regressor (ML Feature Engineering) ---
    if "Random Forest ML" in candidates and RandomForestRegressor is not None:
        try:
            df_feat, feature_cols = prepare_lag_features(df)
            train_feat = df_feat.iloc[:max(1, split_idx - 7)].copy()
            test_feat = df_feat.iloc[max(1, split_idx - 7):].copy()

            if len(train_feat) > 5 and len(test_feat) > 0:
                rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
                rf_model.fit(train_feat[feature_cols], train_feat['y'])
                rf_pred = rf_model.predict(test_feat[feature_cols])

                min_len = min(len(test_df), len(rf_pred))
                if min_len > 0:
                    metrics["Random Forest ML"] = calculate_error_metrics(test_df['y'].values[-min_len:], rf_pred[-min_len:])
                    forecasts["Random Forest ML"] = rf_pred[-min_len:]

                    raw_imp = list(zip(feature_cols, rf_model.feature_importances_))
                    feature_importances = [
                        {"feature": f.replace('_', ' ').title(), "importance": round(float(imp * 100), 2)}
                        for f, imp in sorted(raw_imp, key=lambda x: x[1], reverse=True)
                    ]
        except Exception as e:
            metrics["Random Forest ML"] = {"mae": float('inf'), "rmse": float('inf'), "mape": float('inf'), "r2": 0.0, "error": str(e)}

    # --- 2. Gradient Boosting Regressor (ML Feature Engineering) ---
    if "Gradient Boosting ML" in candidates and GradientBoostingRegressor is not None:
        try:
            df_feat, feature_cols = prepare_lag_features(df)
            train_feat = df_feat.iloc[:max(1, split_idx - 7)].copy()
            test_feat = df_feat.iloc[max(1, split_idx - 7):].copy()

            if len(train_feat) > 5 and len(test_feat) > 0:
                gb_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
                gb_model.fit(train_feat[feature_cols], train_feat['y'])
                gb_pred = gb_model.predict(test_feat[feature_cols])

                min_len = min(len(test_df), len(gb_pred))
                if min_len > 0:
                    metrics["Gradient Boosting ML"] = calculate_error_metrics(test_df['y'].values[-min_len:], gb_pred[-min_len:])
                    forecasts["Gradient Boosting ML"] = gb_pred[-min_len:]

                    if not feature_importances:
                        raw_imp = list(zip(feature_cols, gb_model.feature_importances_))
                        feature_importances = [
                            {"feature": f.replace('_', ' ').title(), "importance": round(float(imp * 100), 2)}
                            for f, imp in sorted(raw_imp, key=lambda x: x[1], reverse=True)
                        ]
        except Exception as e:
            metrics["Gradient Boosting ML"] = {"mae": float('inf'), "rmse": float('inf'), "mape": float('inf'), "r2": 0.0, "error": str(e)}

    # --- 3. Simple Exponential Smoothing (SES) ---
    if "Simple Exponential Smoothing" in candidates:
        if SimpleExpSmoothing:
            try:
                ses_model = SimpleExpSmoothing(train_df['y']).fit(optimized=True)
                ses_pred = ses_model.forecast(len(test_df))
                metrics["Simple Exponential Smoothing"] = calculate_error_metrics(test_df['y'], ses_pred)
                forecasts["Simple Exponential Smoothing"] = ses_pred
            except Exception as e:
                metrics["Simple Exponential Smoothing"] = {"mae": float('inf'), "rmse": float('inf'), "mape": float('inf'), "r2": 0.0, "error": str(e)}
        else:
            metrics["Simple Exponential Smoothing"] = {"error": "statsmodels missing"}

    # --- 4. Holt-Winters ---
    if "Holt-Winters" in candidates:
        if ExponentialSmoothing:
            try:
                hw_model = ExponentialSmoothing(train_df['y'], trend='add', seasonal='add', seasonal_periods=7).fit()
                hw_pred = hw_model.forecast(len(test_df))
                metrics["Holt-Winters"] = calculate_error_metrics(test_df['y'], hw_pred)
                forecasts["Holt-Winters"] = hw_pred
            except Exception:
                try:
                    hw_model = ExponentialSmoothing(train_df['y'], trend='add', seasonal=None).fit()
                    hw_pred = hw_model.forecast(len(test_df))
                    metrics["Holt-Winters"] = calculate_error_metrics(test_df['y'], hw_pred)
                    forecasts["Holt-Winters"] = hw_pred
                except Exception as e2:
                    metrics["Holt-Winters"] = {"mae": float('inf'), "rmse": float('inf'), "mape": float('inf'), "r2": 0.0, "error": str(e2)}
        else:
            metrics["Holt-Winters"] = {"error": "statsmodels missing"}

    # --- 5. Prophet (Optimized fast point estimation) ---
    if "Prophet" in candidates:
        if Prophet:
            try:
                p_model = Prophet(
                    yearly_seasonality=False,
                    daily_seasonality=False,
                    weekly_seasonality=True,
                    uncertainty_samples=0
                )
                p_model.fit(train_df)
                future = p_model.make_future_dataframe(periods=len(test_df), include_history=False)
                p_forecast = p_model.predict(future)
                p_pred = p_forecast['yhat'].values
                metrics["Prophet"] = calculate_error_metrics(test_df['y'], p_pred)
                forecasts["Prophet"] = p_pred
            except Exception as e:
                metrics["Prophet"] = {"mae": float('inf'), "rmse": float('inf'), "mape": float('inf'), "r2": 0.0, "error": str(e)}
        else:
            metrics["Prophet"] = {"error": "Prophet missing"}

    # Select best model (lowest MAE)
    best_model_name = None
    min_mae = float('inf')
    for m_name, score in metrics.items():
        if "error" not in score and score.get("mae", float('inf')) < min_mae:
            min_mae = score["mae"]
            best_model_name = m_name

    if not best_model_name:
        valid_keys = [k for k, v in metrics.items() if "error" not in v]
        best_model_name = valid_keys[0] if valid_keys else "Simple Exponential Smoothing"

    return metrics, best_model_name, feature_importances


def generate_forecast_and_inventory_plan(db: Session, product_id: int, lead_time: int = 3, z_score: float = 1.65):
    """
    Main entry point for demand classification, model competition, Explainable AI,
    30-day forecast generation, and restocking calculation.
    """
    df = get_product_sales_series(db, product_id)
    if df.empty or len(df) < 10:
        return {
            "product_id": product_id,
            "classification": {
                "category": "Insufficient Data",
                "adi": 0.0,
                "cv2": 0.0,
                "description": "Not enough sales data to generate forecast."
            },
            "metrics": {},
            "best_model": None,
            "feature_importance": [],
            "predictions": [],
            "recommendation": None
        }

    classification = classify_demand(df)
    metrics, best_model, feature_importance = train_and_evaluate(df, category=classification.get("category"))

    predictions = []

    # 1. Tree-based ML recursive forecasting (Random Forest / Gradient Boosting)
    if best_model in ["Random Forest ML", "Gradient Boosting ML"]:
        try:
            df_feat, feature_cols = prepare_lag_features(df)
            if best_model == "Gradient Boosting ML" and GradientBoostingRegressor is not None:
                ml_model = GradientBoostingRegressor(n_estimators=100, random_state=42)
            elif RandomForestRegressor is not None:
                ml_model = RandomForestRegressor(n_estimators=100, random_state=42)
            else:
                ml_model = None

            if ml_model is not None:
                ml_model.fit(df_feat[feature_cols], df_feat['y'])
                history_vals = df['y'].values.tolist()
                last_date = df['ds'].max()
                ml_preds = []

                for i in range(30):
                    next_date = last_date + timedelta(days=i+1)
                    lag_1 = history_vals[-1]
                    lag_7 = history_vals[-7] if len(history_vals) >= 7 else history_vals[0]
                    rolling_7 = float(np.mean(history_vals[-7:]))
                    rolling_std_7 = float(np.std(history_vals[-7:]))
                    dow = next_date.weekday()
                    is_wknd = 1 if dow in [5, 6] else 0
                    dom = next_date.day

                    row_df = pd.DataFrame([{
                        'lag_1': lag_1, 'lag_7': lag_7,
                        'rolling_mean_7': rolling_7, 'rolling_std_7': rolling_std_7,
                        'day_of_week': dow, 'is_weekend': is_wknd, 'day_of_month': dom
                    }])
                    pred_val = max(0.0, float(ml_model.predict(row_df)[0]))
                    ml_preds.append(pred_val)
                    history_vals.append(pred_val)

                predictions = ml_preds
        except Exception:
            best_model = "Prophet"

    # 2. Prophet forecasting
    if (best_model == "Prophet" or not predictions) and Prophet:
        try:
            model = Prophet(
                yearly_seasonality=False,
                daily_seasonality=False,
                weekly_seasonality=True,
                uncertainty_samples=0
            )
            model.fit(df)
            future = model.make_future_dataframe(periods=30, include_history=False)
            forecast = model.predict(future)
            predictions = np.clip(forecast['yhat'].values, 0, None).tolist()
        except Exception:
            best_model = "Holt-Winters"

    # 3. Holt-Winters forecasting
    if (best_model == "Holt-Winters" or not predictions) and ExponentialSmoothing:
        try:
            model = ExponentialSmoothing(df['y'], trend='add', seasonal='add', seasonal_periods=7).fit()
            predictions = np.clip(model.forecast(30).values, 0, None).tolist()
        except Exception:
            best_model = "Simple Exponential Smoothing"

    # 4. Fallback SES forecasting
    if not predictions:
        if SimpleExpSmoothing:
            try:
                model = SimpleExpSmoothing(df['y']).fit()
                predictions = np.clip(model.forecast(30).values, 0, None).tolist()
            except Exception:
                predictions = [float(df['y'].mean())] * 30
        else:
            predictions = [float(df['y'].mean())] * 30

    # Restocking inventory calculations
    restock_cycle_days = 7
    avg_daily_demand = np.mean(predictions)
    std_demand = np.std(df['y'].values)

    safety_stock = z_score * std_demand * np.sqrt(lead_time)
    # Reorder point: stock needed to cover lead time demand + safety buffer
    reorder_point = (avg_daily_demand * lead_time) + safety_stock
    # Target inventory: cover a full restock cycle + safety stock
    target_inventory = (avg_daily_demand * restock_cycle_days) + safety_stock

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    current_stock = product.quantity_in_stock if product else 0
    product_reorder_level = product.reorder_level if product else 0

    # Restock is needed if stock can't cover the next restock cycle
    # Also respect the product's manually set reorder_level as a lower bound check
    restock_needed = (current_stock < target_inventory) and (current_stock <= max(reorder_point, product_reorder_level))
    restock_volume = max(0, target_inventory - current_stock) if restock_needed else 0

    recommendation = {
        "current_stock": current_stock,
        "lead_time_days": lead_time,
        "z_score": z_score,
        "average_daily_forecast": round(float(avg_daily_demand), 2),
        "safety_stock": round(float(safety_stock), 2),
        "reorder_point": round(float(reorder_point), 2),
        "target_inventory": round(float(target_inventory), 2),
        "restock_needed": bool(restock_needed),
        "recommended_volume": int(np.ceil(restock_volume))
    }

    last_date = df['ds'].max()
    prediction_dates = [(last_date + timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(30)]
    prediction_list = [{"date": d, "quantity": round(q, 2)} for d, q in zip(prediction_dates, predictions)]

    return {
        "product_id": product_id,
        "classification": classification,
        "metrics": metrics,
        "best_model": best_model,
        "feature_importance": feature_importance,
        "predictions": prediction_list,
        "recommendation": recommendation
    }


def get_abc_xyz_analysis(db: Session):
    """
    Groups products into 3x3 ABC-XYZ Matrix based on revenue contribution (ABC)
    and demand predictability (XYZ).
    """
    products = db.query(models.Product).all()
    if not products:
        return {"matrix": {}, "products": []}

    analysis_data = []
    for p in products:
        df = get_product_sales_series(db, p.id)
        total_units = float(df['y'].sum()) if not df.empty else 0.0
        total_revenue = total_units * p.price
        cls = classify_demand(df)
        analysis_data.append({
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "stock": p.quantity_in_stock,
            "price": p.price,
            "units_sold": total_units,
            "revenue": total_revenue,
            "adi": cls["adi"],
            "cv2": cls["cv2"],
            "demand_pattern": cls["category"]
        })


    # ABC Classification by cumulative revenue
    analysis_data.sort(key=lambda x: x["revenue"], reverse=True)
    total_rev_all = sum(x["revenue"] for x in analysis_data) or 1.0

    cum_rev = 0.0
    for item in analysis_data:
        cum_rev += item["revenue"]
        rev_pct = (cum_rev / total_rev_all) * 100
        if rev_pct <= 70:
            item["abc"] = "A"
        elif rev_pct <= 90:
            item["abc"] = "B"
        else:
            item["abc"] = "C"

        # XYZ Classification by CV2
        if item["cv2"] < 0.25:
            item["xyz"] = "X" # High predictability
        elif item["cv2"] < 0.75:
            item["xyz"] = "Y" # Moderate predictability
        else:
            item["xyz"] = "Z" # Low predictability

        item["matrix_class"] = f"{item['abc']}-{item['xyz']}"

    # Build 3x3 grid matrix
    matrix = {f"{a}-{x}": [] for a in ["A", "B", "C"] for x in ["X", "Y", "Z"]}
    for item in analysis_data:
        matrix[item["matrix_class"]].append({
            "id": item["id"],
            "name": item["name"],
            "revenue": item["revenue"]
        })

    return {"matrix": matrix, "products": analysis_data}


def detect_sales_anomalies(db: Session, product_id: int):
    """
    Detects abnormal daily sales spikes using IsolationForest.
    """
    df = get_product_sales_series(db, product_id)
    if df.empty or len(df) < 15 or IsolationForest is None:
        return {"anomalies": [], "total_flagged": 0}

    model = IsolationForest(contamination=0.05, random_state=42)
    df['anomaly'] = model.fit_predict(df[['y']])
    
    anomalies = df[df['anomaly'] == -1]
    results = [
        {"date": row['ds'].strftime("%Y-%m-%d"), "quantity": float(row['y']), "score": "Abnormal Spike/Drop"}
        for _, row in anomalies.iterrows()
    ]

    return {"anomalies": results, "total_flagged": len(results)}


# ---------------------------------------------------------------------------
# Parallel Multi-Core Model Training & Inventory Planning
# ---------------------------------------------------------------------------
def train_single_product_worker(task):
    """
    Worker function executed in separate process for multi-core parallelism.
    task is a tuple: (product_id, product_name, lead_time, z_score)
    """
    product_id, product_name, lead_time, z_score = task
    t0 = time.time()
    db = None
    try:
        import database
        import logging
        logging.getLogger('prophet').setLevel(logging.ERROR)
        logging.getLogger('cmdstanpy').setLevel(logging.ERROR)
        db = database.SessionLocal()
        plan = generate_forecast_and_inventory_plan(db, product_id, lead_time=lead_time, z_score=z_score)
        elapsed = time.time() - t0
        best_model = plan.get("best_model", "N/A")
        cat = plan.get("classification", {}).get("category", "N/A")
        return {
            "product_id": product_id,
            "product_name": product_name,
            "lead_time": lead_time,
            "z_score": z_score,
            "plan": plan,
            "best_model": best_model,
            "category": cat,
            "elapsed": elapsed,
            "error": None
        }
    except Exception as e:
        elapsed = time.time() - t0
        return {
            "product_id": product_id,
            "product_name": product_name,
            "lead_time": lead_time,
            "z_score": z_score,
            "plan": None,
            "best_model": "Error",
            "category": "Error",
            "elapsed": elapsed,
            "error": str(e)
        }
    finally:
        if db is not None:
            try:
                db.close()
            except Exception:
                pass


def train_all_products_parallel(products, lead_time: int = 3, z_score: float = 1.65, max_workers: int = None, progress_callback=None):
    """
    Trains all products in parallel using ProcessPoolExecutor across multiple CPU cores.
    Returns dict mapping cache_key -> plan.
    """
    import concurrent.futures
    import os

    if not products:
        return {}

    if max_workers is None:
        cpu_cnt = os.cpu_count() or 4
        # Utilize available cores (up to 12 cores)
        max_workers = max(1, min(cpu_cnt, 12))

    tasks = [(p.id, getattr(p, 'name', f'Product {p.id}'), lead_time, z_score) for p in products]
    cache_data = {}
    total = len(tasks)
    completed_count = 0

    with concurrent.futures.ProcessPoolExecutor(max_workers=max_workers) as executor:
        future_to_task = {executor.submit(train_single_product_worker, t): t for t in tasks}
        for future in concurrent.futures.as_completed(future_to_task):
            completed_count += 1
            res = future.result()
            p_id = res["product_id"]
            if res["plan"]:
                key = _cache_key(p_id, res["lead_time"], res["z_score"])
                cache_data[key] = res["plan"]
                _forecast_cache[key] = (time.monotonic(), res["plan"])

            if progress_callback:
                progress_callback(completed_count, total, res)

    # Save all newly trained forecasts to disk cache
    disk_data = _load_disk_cache()
    disk_data.update(cache_data)
    _save_disk_cache(disk_data)

    return cache_data

