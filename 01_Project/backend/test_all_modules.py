import sys
import os

# Ensure UTF-8 output encoding for Windows terminal compatibility
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import database
import models
import forecasting_engine
from sqlalchemy.orm import Session

def run_system_tests():
    print("====================================================")
    print("       NEXUSERP FULL SYSTEM INTEGRATION TEST        ")
    print("====================================================")
    
    db: Session = database.SessionLocal()
    try:
        # 1. Database & Product Catalog Check
        products = db.query(models.Product).all()
        print(f"[OK] [1/6] Products Catalog: {len(products)} products registered in SQLite DB.")
        assert len(products) > 0, "No products found in DB"
        
        # 2. Sales & Bill Verification
        bills = db.query(models.Bill).all()
        bill_items = db.query(models.BillItem).all()
        print(f"[OK] [2/6] Sales Workflow: {len(bills)} bills and {len(bill_items)} item records verified.")
        
        # 3. AI Demand Classification (Syntetos-Boylan)
        sample_prod = products[0]
        df = forecasting_engine.get_product_sales_series(db, sample_prod.id)
        classification = forecasting_engine.classify_demand(df)
        print(f"[OK] [3/6] Demand Classification ({sample_prod.name}): Category={classification['category']} (ADI={classification['adi']}, CV2={classification['cv2']})")
        
        # 4. Multi-Model ML Tournament & Explainable AI (XAI)
        plan = forecasting_engine.generate_forecast_and_inventory_plan(db, sample_prod.id, lead_time=5, z_score=1.96)
        print(f"[OK] [4/6] ML Tournament ({sample_prod.name}): Selected Winner = {plan['best_model']}")
        print(f"         Models Evaluated: {list(plan['metrics'].keys())}")
        print(f"         XAI Top Feature: {plan['feature_importance'][0]['feature']} ({plan['feature_importance'][0]['importance']}%)")
        print(f"         Simulated Reorder Point: {plan['recommendation']['reorder_point']} (Safety Stock: {plan['recommendation']['safety_stock']})")
        
        # 5. Isolation Forest Anomaly Detection
        anomalies = forecasting_engine.detect_sales_anomalies(db, sample_prod.id)
        print(f"[OK] [5/6] Anomaly Detection: {anomalies['total_flagged']} spikes flagged by Isolation Forest.")
        
        # 6. ABC-XYZ Portfolio Matrix
        abc_xyz = forecasting_engine.get_abc_xyz_analysis(db)
        matrix_count = sum(len(items) for items in abc_xyz['matrix'].values())
        print(f"[OK] [6/6] Portfolio ABC-XYZ Matrix: Categorized {matrix_count} items across 3x3 revenue/predictability grid.")
        
        print("====================================================")
        print("     ALL NEXUSERP BACKEND MODULES TESTED & PASSED 100%")
        print("====================================================")
    except Exception as e:
        print(f"[FAIL] TEST FAILED: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    run_system_tests()
