"""
routers/purchase_orders.py
--------------------------
Full purchase order CRUD with status lifecycle.
Status flow: Generated -> Approved -> Pending Delivery -> Delivered
On Delivered: automatically increments product.quantity_in_stock.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
import models
from database import get_db

router = APIRouter(prefix="/api/po", tags=["Purchase Orders"])

STATUS_FLOW = ["Generated", "Approved", "Pending Delivery", "Delivered"]


class POCreate(BaseModel):
    vendor_name: str
    product_id: int
    quantity: int


class POStatusUpdate(BaseModel):
    status: str


def _generate_po_number(db: Session) -> str:
    year = datetime.utcnow().year
    count = db.query(models.PurchaseOrder).count() + 1
    return f"PO-{year}-{str(count).zfill(3)}"


@router.get("/")
def list_purchase_orders(db: Session = Depends(get_db)):
    orders = db.query(models.PurchaseOrder).order_by(models.PurchaseOrder.created_at.desc()).all()
    return [_po_to_dict(po) for po in orders]


@router.post("/", status_code=201)
def create_purchase_order(body: POCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == body.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    unit_price = product.price
    total_amount = unit_price * body.quantity
    po_number = _generate_po_number(db)

    po = models.PurchaseOrder(
        po_number=po_number,
        vendor_name=body.vendor_name,
        product_id=body.product_id,
        product_name=product.name,
        quantity=body.quantity,
        unit_price=unit_price,
        total_amount=total_amount,
        status="Generated"
    )
    db.add(po)
    db.commit()
    db.refresh(po)
    return _po_to_dict(po)


@router.patch("/{po_id}/status")
def update_po_status(po_id: int, body: POStatusUpdate, db: Session = Depends(get_db)):
    po = db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    if po.status == "Delivered":
        raise HTTPException(status_code=400, detail="Delivered orders cannot be changed.")

    new_status = body.status
    if new_status not in STATUS_FLOW:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {STATUS_FLOW}")

    old_status = po.status
    po.status = new_status

    # Auto-update inventory when status changes TO Delivered
    inventory_updated = False
    if new_status == "Delivered" and old_status != "Delivered":
        if po.product_id:
            product = db.query(models.Product).filter(models.Product.id == po.product_id).first()
            if product:
                old_stock = product.quantity_in_stock
                product.quantity_in_stock += po.quantity
                inventory_updated = True

    db.commit()
    db.refresh(po)

    result = _po_to_dict(po)
    result["inventory_updated"] = inventory_updated
    if inventory_updated:
        import forecasting_engine
        forecasting_engine.clear_forecast_cache()
        product = db.query(models.Product).filter(models.Product.id == po.product_id).first()
        result["new_stock"] = product.quantity_in_stock if product else None
    return result


@router.get("/pending-count")
def get_pending_count(db: Session = Depends(get_db)):
    count = db.query(models.PurchaseOrder).filter(
        models.PurchaseOrder.status != "Delivered"
    ).count()
    return {"pending_count": count}


def _po_to_dict(po: models.PurchaseOrder) -> dict:
    return {
        "id": po.id,
        "po_number": po.po_number,
        "vendor_name": po.vendor_name,
        "product_id": po.product_id,
        "product_name": po.product_name,
        "quantity": po.quantity,
        "unit_price": round(po.unit_price, 2),
        "total_amount": round(po.total_amount, 2),
        "status": po.status,
        "created_at": po.created_at.isoformat() if po.created_at else None,
        "updated_at": po.updated_at.isoformat() if po.updated_at else None,
    }
