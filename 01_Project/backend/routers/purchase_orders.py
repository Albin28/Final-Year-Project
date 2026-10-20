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

STATUS_FLOW = ["Generated", "Approved", "Pending Delivery", "Delivered", "Cancelled"]


class POCreate(BaseModel):
    vendor_name: str
    product_id: int
    quantity: int


class POStatusUpdate(BaseModel):
    status: str


VENDOR_MAP = {
    "Amul": "Amul India Dairy Supply Ltd.",
    "Britannia": "Britannia Industries Hub",
    "India Gate": "KRBL India Gate Distributor",
    "Suguna": "Suguna Agro & Poultry Ltd.",
    "Fortune": "Adani Wilmar Consumer Goods",
    "Nescafé": "Nestlé India Distribution Hub",
    "Epigamia": "Drums Food International Depot",
    "Kellogg's": "Kellogg India Wholesale",
    "Vim": "Hindustan Unilever Wholesale Ltd.",
    "Surf Excel": "Hindustan Unilever Wholesale Ltd.",
    "Aashirvaad": "ITC Foods Supply Chain",
    "Parle": "Parle Products & Confectionery",
    "Horlicks": "Hindustan Unilever Nutrition",
    "Thums Up": "Coca-Cola Bottlers India",
    "Tata": "Tata Consumer Products Depot",
    "Maggi": "Nestlé India Distribution Hub",
    "Tetley": "Tata Global Beverages Ltd.",
    "Kissan": "Hindustan Unilever Wholesale Ltd.",
    "Cadbury": "Mondelez India Foods Depot",
    "Dabur": "Dabur India Consumer Logistics",
    "Real": "Dabur Foods Distribution",
    "Lay's": "PepsiCo India Holdings",
    "Raw Pressery": "Rakyan Beverages Supply",
    "Origami": "Origami Paper Products Ltd.",
    "Prestige": "TTK Prestige Consumer Goods Depot",
    "Bajaj": "Bajaj Electricals Distribution Depot",
    "Borges": "Borges Mediterranean India Logistics",
    "Haldiram": "Haldiram Snacks & Sweets Pvt. Ltd.",
    "Paper Boat": "Hector Beverages Distribution Hub",
    "Catch": "DS Group Catch Spices Network",
    "Ferrero": "Ferrero India Luxury Depot",
    "Patanjali": "Patanjali Ayurved Supply Chain",
    "Milton": "Hamilton Housewares (Milton) Depot",
    "Godrej": "Godrej Consumer Products Hub",
}

def get_vendor_for_product(product_name: str, category: str) -> str:
    for brand, vendor in VENDOR_MAP.items():
        if brand.lower() in product_name.lower():
            return vendor
    return f"{category} Wholesale Supermarket Dist."


def _generate_po_number(db: Session) -> str:
    year = datetime.utcnow().year
    existing = db.query(models.PurchaseOrder.po_number).filter(
        models.PurchaseOrder.po_number.like(f"PO-{year}-%")
    ).all()
    max_num = 0
    for (num_str,) in existing:
        try:
            seq = int(num_str.split("-")[-1])
            if seq > max_num:
                max_num = seq
        except (ValueError, IndexError):
            pass
    return f"PO-{year}-{str(max_num + 1).zfill(3)}"


@router.get("/")
def list_purchase_orders(db: Session = Depends(get_db)):
    orders = db.query(models.PurchaseOrder).order_by(models.PurchaseOrder.created_at.desc()).all()
    return [_po_to_dict(po) for po in orders]


@router.post("/auto-generate-low-stock")
def auto_generate_low_stock_pos(db: Session = Depends(get_db)):
    """
    Finds all products where quantity_in_stock <= reorder_level.
    Generates a unique, separate Purchase Order for each product with the
    recommended restock quantity (derived from AI forecasting recommendation or dynamic ROP buffer).
    Returns list of generated purchase orders.
    """
    low_stock_products = (
        db.query(models.Product)
        .filter(models.Product.quantity_in_stock <= models.Product.reorder_level)
        .order_by(models.Product.id.asc())
        .all()
    )

    if not low_stock_products:
        return {
            "status": "success",
            "count": 0,
            "message": "All inventory levels are healthy. No pending low-stock products to restock.",
            "purchase_orders": []
        }

    year = datetime.utcnow().year
    existing = db.query(models.PurchaseOrder.po_number).filter(
        models.PurchaseOrder.po_number.like(f"PO-{year}-%")
    ).all()
    max_num = 0
    for (num_str,) in existing:
        try:
            seq = int(num_str.split("-")[-1])
            if seq > max_num:
                max_num = seq
        except (ValueError, IndexError):
            pass

    created_pos = []
    import forecasting_engine

    for prod in low_stock_products:
        restock_qty = 0
        try:
            plan = forecasting_engine.get_cached_forecast(db, prod.id)
            rec = plan.get("recommendation", {})
            if rec.get("recommended_volume", 0) > 0:
                restock_qty = int(rec["recommended_volume"])
        except Exception:
            pass

        if restock_qty <= 0:
            target_stock = max(prod.reorder_level * 2, 50)
            restock_qty = max(prod.reorder_level, target_stock - prod.quantity_in_stock)

        max_num += 1
        po_number = f"PO-{year}-{str(max_num).zfill(3)}"
        vendor_name = get_vendor_for_product(prod.name, prod.category)
        unit_price = float(prod.price)
        total_amount = round(unit_price * restock_qty, 2)

        po = models.PurchaseOrder(
            po_number=po_number,
            vendor_name=vendor_name,
            product_id=prod.id,
            product_name=prod.name,
            quantity=restock_qty,
            unit_price=unit_price,
            total_amount=total_amount,
            status="Generated"
        )
        db.add(po)
        created_pos.append(po)

    db.commit()
    for po in created_pos:
        db.refresh(po)

    return {
        "status": "success",
        "count": len(created_pos),
        "message": f"Successfully generated {len(created_pos)} separate Purchase Orders for all low stock items.",
        "purchase_orders": [_po_to_dict(po) for po in created_pos]
    }


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

    if po.status == "Cancelled":
        raise HTTPException(status_code=400, detail="Cancelled orders cannot be changed.")

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
