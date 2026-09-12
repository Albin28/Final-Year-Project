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
    Get demand pattern parameters and historical error metrics for the models.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    plan = forecasting_engine.generate_forecast_and_inventory_plan(db, product_id)
    return {
        "product_name": product.name,
        "classification": plan["classification"],
        "metrics": plan["metrics"],
        "best_model": plan["best_model"]
    }


@router.get("/predictions/{product_id}")
def get_product_predictions(product_id: int, db: Session = Depends(get_db)):
    """
    Get 30-day demand forecast and restocking inventory recommendations.
    """
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    plan = forecasting_engine.generate_forecast_and_inventory_plan(db, product_id)
    return {
        "product_name": product.name,
        "best_model": plan["best_model"],
        "predictions": plan["predictions"],
        "recommendation": plan["recommendation"]
    }


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
