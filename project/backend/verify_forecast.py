from database import SessionLocal
import forecasting_engine

def verify():
    db = SessionLocal()
    try:
        products = db.query(forecasting_engine.models.Product).limit(5).all()
        for p in products:
            product_id = p.id
            print(f"\n=========================================")
            print(f"Verifying Product ID: {product_id} ({p.name})")
            print(f"=========================================")
            res = forecasting_engine.generate_forecast_and_inventory_plan(db, product_id)
            
            print(f"Product ID: {res['product_id']}")
            print(f"Category: {res['classification']['category']}")
            print(f"ADI: {res['classification']['adi']}")
            print(f"CV2: {res['classification']['cv2']}")
            print(f"Best Model Selected: {res['best_model']}")
            
            print("Model Metrics:")
            for model_name, metrics in res['metrics'].items():
                print(f"  - {model_name}: {metrics}")
                
            print("Recommendation:")
            print(f"  - Current Stock: {res['recommendation']['current_stock']}")
            print(f"  - Average Forecasted Volume (Daily): {res['recommendation']['average_daily_forecast']}")
            print(f"  - Safety Stock: {res['recommendation']['safety_stock']}")
            print(f"  - Reorder Point: {res['recommendation']['reorder_point']}")
            print(f"  - Restock Needed: {res['recommendation']['restock_needed']}")
            print(f"  - Recommended Restock Volume: {res['recommendation']['recommended_volume']}")
            
    finally:
        db.close()

if __name__ == "__main__":
    verify()
