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
    Get classification summary statistics for all registered products.
    """
    products = db.query(models.Product).all()
    if not products:
        return {"total_products": 0, "categories": {}}

    categories = {}
    for p in products:
        df = forecasting_engine.get_product_sales_series(db, p.id)
        classification = forecasting_engine.classify_demand(df)
        cat = classification["category"]
        categories[cat] = categories.get(cat, 0) + 1

    return {
        "total_products": len(products),
        "categories": categories
    }


@router.get("/metrics/{product_id}")
def get_product_metrics(product_id: int, db: Session = Depends(get_db)):
    """
    Get demand pattern parameters, model error metrics, and Explainable AI feature importance.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    plan = forecasting_engine.generate_forecast_and_inventory_plan(db, product_id)
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
    """
    Get 30-day demand forecast and restocking inventory recommendations with dynamic lead time & safety stock.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    plan = forecasting_engine.generate_forecast_and_inventory_plan(
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
    """
    Get 3x3 ABC-XYZ Portfolio Classification Matrix.
    """
    return forecasting_engine.get_abc_xyz_analysis(db)


@router.get("/analytics/anomalies/{product_id}")
def get_product_anomalies(product_id: int, db: Session = Depends(get_db)):
    """
    Get sales spike anomalies using Isolation Forest.
    """
    return forecasting_engine.detect_sales_anomalies(db, product_id)


import pandas as pd
from pathlib import Path

@router.post("/train")
def self_train_model(db: Session = Depends(get_db)):
    """
    Train and seed AI forecasting models using the Unified Master Top 30 Grocery Dataset.
    """
    try:
        import unify_top30_dataset
        unify_top30_dataset.unify_datasets()
        
        products_count = db.query(models.Product).count()
        bills_count = db.query(models.Bill).count()
        items_count = db.query(models.BillItem).count()
        
        return {
            "status": "success",
            "message": "AI Forecasting Models successfully trained on Master Top 30 Grocery Dataset!",
            "products_imported": products_count,
            "bills_created": bills_count,
            "items_imported": items_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to execute self-training on Top 30 dataset: {str(e)}"
        )

