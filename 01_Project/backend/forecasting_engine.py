import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
import models

# Try imports, fallback gracefully if packages are still installing
try:
    from statsmodels.tsa.holtwinters import ExponentialSmoothing, SimpleExpSmoothing
except ImportError:
    ExponentialSmoothing = None
    SimpleExpSmoothing = None

try:
    from prophet import Prophet
    import logging
    logging.getLogger('prophet').setLevel(logging.WARNING)
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


def train_and_evaluate(df: pd.DataFrame, test_size=0.2):
    """
    Trains Random Forest, Prophet, Holt-Winters, and Simple Exponential Smoothing models.
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

    # --- 1. Random Forest Regressor (ML Feature Engineering) ---
    if RandomForestRegressor is not None:
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
    if GradientBoostingRegressor is not None:
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

    # --- 2. Simple Exponential Smoothing (SES) ---
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

    # --- 3. Holt-Winters ---
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

    # --- 4. Prophet ---
    if Prophet:
        try:
            p_model = Prophet(yearly_seasonality=False, daily_seasonality=False, weekly_seasonality=True)
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
        best_model_name = "Simple Exponential Smoothing"

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
    metrics, best_model, feature_importance = train_and_evaluate(df)

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
            model = Prophet(yearly_seasonality=False, daily_seasonality=False, weekly_seasonality=True)
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
