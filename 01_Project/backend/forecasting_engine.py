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


def get_product_sales_series(db: Session, product_id: int):
    """
    Fetch historical daily sales for a product, returning a pandas DataFrame
    with 'ds' (date) and 'y' (quantity sold).
    """
    # Fetch all items for this product
    items = db.query(models.BillItem).filter(models.BillItem.product_id == product_id).all()
    if not items:
        return pd.DataFrame(columns=['ds', 'y'])

    # Fetch corresponding bills to get the dates
    bill_ids = [item.bill_id for item in items]
    bills = db.query(models.Bill).filter(models.Bill.id.in_(bill_ids)).all()
    bill_date_map = {b.id: b.created_at for b in bills}

    data = []
    for item in items:
        date = bill_date_map.get(item.bill_id)
        if date:
            # Normalize to date only
            date_only = date.date() if isinstance(date, datetime) else date
            data.append({"ds": pd.to_datetime(date_only), "qty": item.quantity})

    df = pd.DataFrame(data)
    if df.empty:
        return pd.DataFrame(columns=['ds', 'y'])

    # Group by date and sum quantities
    df = df.groupby('ds')['qty'].sum().reset_index()
    
    # Fill in missing dates with zero sales to construct a continuous time series
    df = df.set_index('ds')
    all_dates = pd.date_range(start=df.index.min(), end=df.index.max(), freq='D')
    df = df.reindex(all_dates, fill_value=0).reset_index()
    df.columns = ['ds', 'y']
    return df


def classify_demand(df: pd.DataFrame):
    """
    Classify the demand pattern using the Syntetos-Boylan Classification (SBC).
    ADI: Average Demand Interval (average days between positive sales)
    CV2: Coefficient of Variation squared (variance/mean^2 of positive sales sizes)
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

    # Average Demand Interval
    adi = total_periods / non_zero_periods if non_zero_periods > 0 else float('inf')

    # Coefficient of Variation squared
    mean_size = np.mean(positive_sales)
    std_size = np.std(positive_sales)
    cv2 = (std_size / mean_size) ** 2 if mean_size > 0 else 0.0

    # Classify based on standard thresholds (ADI = 1.32, CV2 = 0.49)
    if adi < 1.32 and cv2 < 0.49:
        category = "Regular"
        desc = "Smooth, high-frequency demand with low variability. Ideal for standard forecasting."
    elif adi < 1.32 and cv2 >= 0.49:
        category = "Erratic"
        desc = "Frequent demand but highly variable order sizes. Requires robust, adaptive forecasting."
    elif adi >= 1.32 and cv2 < 0.49:
        category = "Intermittent"
        desc = "Sparsely occurring demand with relatively consistent quantity sizes."
    else:
        category = "Lumpy"
        desc = "Sparse and highly variable demand. Very difficult to predict."

    return {
        "adi": round(float(adi), 3),
        "cv2": round(float(cv2), 3),
        "category": category,
        "description": desc
    }


def calculate_error_metrics(y_true, y_pred):
    """
    Compute MAE, RMSE, and MAPE.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    # Clip predictions to prevent negative quantities
    y_pred = np.clip(y_pred, 0, None)

    mae = np.mean(np.abs(y_true - y_pred))
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
    
    # Avoid division by zero in MAPE
    mask = y_true > 0
    if np.sum(mask) > 0:
        mape = np.mean(np.abs(y_true[mask] - y_pred[mask]) / y_true[mask]) * 100
    else:
        mape = 0.0

    return {
        "mae": round(float(mae), 3),
        "rmse": round(float(rmse), 3),
        "mape": round(float(mape), 3)
    }


def train_and_evaluate(df: pd.DataFrame, test_size=0.2):
    """
    Trains Prophet, Holt-Winters, and Simple Exponential Smoothing models.
    Splits data using 80/20 train/test split.
    Returns metrics for all models and recommends the best model.
    """
    if len(df) < 15:
        return None, "Insufficient data length for model training."

    split_idx = int(len(df) * (1 - test_size))
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()

    metrics = {}
    forecasts = {}

    # --- 1. Simple Exponential Smoothing (SES) ---
    if SimpleExpSmoothing:
        try:
            ses_model = SimpleExpSmoothing(train_df['y']).fit(optimized=True)
            ses_pred = ses_model.forecast(len(test_df))
            metrics["Simple Exponential Smoothing"] = calculate_error_metrics(test_df['y'], ses_pred)
            forecasts["Simple Exponential Smoothing"] = ses_pred
        except Exception as e:
            metrics["Simple Exponential Smoothing"] = {"mae": float('inf'), "rmse": float('inf'), "mape": float('inf'), "error": str(e)}
    else:
        metrics["Simple Exponential Smoothing"] = {"error": "statsmodels library missing"}

    # --- 2. Holt-Winters ---
    if ExponentialSmoothing:
        try:
            # Fit Holt-Winters with additive trend and weekly seasonality (periods=7)
            hw_model = ExponentialSmoothing(
                train_df['y'],
                trend='add',
                seasonal='add',
                seasonal_periods=7
            ).fit()
            hw_pred = hw_model.forecast(len(test_df))
            metrics["Holt-Winters"] = calculate_error_metrics(test_df['y'], hw_pred)
            forecasts["Holt-Winters"] = hw_pred
        except Exception as e:
            # Fallback to simple trend model if seasonality fit fails
            try:
                hw_model = ExponentialSmoothing(train_df['y'], trend='add', seasonal=None).fit()
                hw_pred = hw_model.forecast(len(test_df))
                metrics["Holt-Winters"] = calculate_error_metrics(test_df['y'], hw_pred)
                forecasts["Holt-Winters"] = hw_pred
            except Exception as e2:
                metrics["Holt-Winters"] = {"mae": float('inf'), "rmse": float('inf'), "mape": float('inf'), "error": str(e2)}
    else:
        metrics["Holt-Winters"] = {"error": "statsmodels library missing"}

    # --- 3. Prophet ---
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
            metrics["Prophet"] = {"mae": float('inf'), "rmse": float('inf'), "mape": float('inf'), "error": str(e)}
    else:
        metrics["Prophet"] = {"error": "Prophet library missing"}

    # Select the model with the lowest MAE
    best_model_name = None
    min_mae = float('inf')
    for m_name, score in metrics.items():
        if "error" not in score and score.get("mae", float('inf')) < min_mae:
            min_mae = score["mae"]
            best_model_name = m_name

    if not best_model_name:
        best_model_name = "Simple Exponential Smoothing"

    return metrics, best_model_name


def generate_forecast_and_inventory_plan(db: Session, product_id: int):
    """
    Main function called to classify demand, evaluate models, predict next 30 days,
    and output inventory restocking suggestions.
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
            "predictions": [],
            "recommendation": None
        }

    # 1. Classify demand
    classification = classify_demand(df)

    # 2. Evaluate models & select best one
    metrics, best_model = train_and_evaluate(df)

    # 3. Forecast next 30 days using selected model on full dataset
    predictions = []
    if best_model == "Prophet" and Prophet:
        try:
            model = Prophet(yearly_seasonality=False, daily_seasonality=False, weekly_seasonality=True)
            model.fit(df)
            future = model.make_future_dataframe(periods=30, include_history=False)
            forecast = model.predict(future)
            predictions = np.clip(forecast['yhat'].values, 0, None).tolist()
        except Exception:
            best_model = "Simple Exponential Smoothing"  # fallback

    if best_model == "Holt-Winters" and ExponentialSmoothing:
        try:
            model = ExponentialSmoothing(df['y'], trend='add', seasonal='add', seasonal_periods=7).fit()
            predictions = np.clip(model.forecast(30).values, 0, None).tolist()
        except Exception:
            best_model = "Simple Exponential Smoothing"  # fallback

    if best_model == "Simple Exponential Smoothing" or not predictions:
        if SimpleExpSmoothing:
            try:
                model = SimpleExpSmoothing(df['y']).fit()
                predictions = np.clip(model.forecast(30).values, 0, None).tolist()
            except Exception:
                predictions = [float(df['y'].mean())] * 30
        else:
            predictions = [float(df['y'].mean())] * 30

    # 4. Inventory restocking recommendation
    # Small store parameters: lead_time = 3 days, 7-day restocking cycle, 95% service level factor
    lead_time = 3
    restock_cycle_days = 7
    avg_daily_demand = np.mean(predictions)
    std_demand = np.std(df['y'].values)
    
    # Safety stock formula: 1.65 * std_demand * sqrt(lead_time)
    safety_stock = 1.65 * std_demand * np.sqrt(lead_time)
    reorder_point = (avg_daily_demand * lead_time) + safety_stock
    
    # Get current stock
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    current_stock = product.quantity_in_stock if product else 0

    restock_needed = current_stock <= reorder_point
    # Recommend restocking to target 7-day store capacity + safety stock
    target_inventory = (avg_daily_demand * restock_cycle_days) + safety_stock
    restock_volume = max(0, target_inventory - current_stock) if restock_needed else 0

    recommendation = {
        "current_stock": current_stock,
        "average_daily_forecast": round(float(avg_daily_demand), 2),
        "safety_stock": round(float(safety_stock), 2),
        "reorder_point": round(float(reorder_point), 2),
        "restock_needed": bool(restock_needed),
        "recommended_volume": int(np.ceil(restock_volume))
    }

    # Generate dates for predictions
    last_date = df['ds'].max()
    prediction_dates = [(last_date + timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(30)]

    prediction_list = [{"date": d, "quantity": round(q, 2)} for d, q in zip(prediction_dates, predictions)]

    return {
        "product_id": product_id,
        "classification": classification,
        "metrics": metrics,
        "best_model": best_model,
        "predictions": prediction_list,
        "recommendation": recommendation
    }
