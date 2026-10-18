import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

from database import SessionLocal
import models
import forecasting_engine
from unify_top30_dataset import UNIFIED_TOP30_CATALOG

def update_products():
    db = SessionLocal()
    print("Updating products in database with Indian brands and INR prices...")
    
    updated_count = 0
    for p_id, p_name, p_cat, p_price, p_stock, _ in UNIFIED_TOP30_CATALOG:
        prod = db.query(models.Product).filter(models.Product.id == p_id).first()
        if prod:
            prod.name = p_name
            prod.category = p_cat
            prod.price = p_price
            updated_count += 1
            
            # Also sync BillItem names
            db.query(models.BillItem).filter(models.BillItem.product_id == p_id).update(
                {"product_name": p_name, "unit_price": p_price},
                synchronize_session=False
            )
            
            # Also sync PurchaseOrder product names if any
            db.query(models.PurchaseOrder).filter(models.PurchaseOrder.product_id == p_id).update(
                {"product_name": p_name, "unit_price": p_price},
                synchronize_session=False
            )

    db.commit()
    print(f"Updated {updated_count} products and corresponding historical records successfully.")
    
    # Invalidate old cache so predictions take the new names and prices
    forecasting_engine.clear_forecast_cache()
    print("Forecasting cache cleared for fresh naming.")
    db.close()

if __name__ == "__main__":
    update_products()
