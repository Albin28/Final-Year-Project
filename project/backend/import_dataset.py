import os
import sys
import pandas as pd
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session

sys.path.append(str(Path(__file__).resolve().parent))
from database import SessionLocal, engine, Base
import models

GROCERY_CATALOG = {
    1: ("Organic Whole Milk (1L)", "Dairy", 3.50, 150, 30),
    2: ("Whole Wheat Sandwich Bread", "Bakery", 2.80, 80, 20),
    3: ("Basmati Rice (5kg)", "Grains & Pulses", 12.50, 60, 15),
    4: ("Farm Fresh Eggs (12 pack)", "Dairy", 4.20, 100, 25),
    5: ("Extra Virgin Olive Oil (1L)", "Oils & Condiments", 14.90, 45, 10),
    6: ("Dark Roast Coffee Beans (500g)", "Beverages", 9.80, 50, 15),
    7: ("Greek Plain Yogurt (500g)", "Dairy", 3.90, 70, 20),
    8: ("Whole Grain Oats Cereal", "Breakfast", 4.50, 65, 15),
    9: ("Dishwashing Liquid Soap (750ml)", "Household", 3.20, 90, 20),
    10: ("Concentrated Laundry Detergent", "Household", 11.50, 40, 10),
}

def get_product_metadata(item_id: int):
    if item_id in GROCERY_CATALOG:
        return GROCERY_CATALOG[item_id]
    name = f"Grocery Product #{item_id}"
    cat = "General Grocery"
    price = round(3.0 + (item_id * 1.25), 2)
    stock = 100
    reorder = 20
    return name, cat, price, stock, reorder

def import_online_retail_ii(excel_path: str, max_items: int = 10, wipe_existing: bool = True):
    """
    Specifically imports UCI Online Retail II dataset (online_retail_II.xlsx).
    Extracts top N products by sales volume.
    """
    if not os.path.exists(excel_path):
        print(f"Error: File not found at {excel_path}")
        return

    print(f"Loading Online Retail II dataset from {excel_path}...")
    xl = pd.ExcelFile(excel_path)
    df = pd.read_excel(xl, sheet_name=xl.sheet_names[0])

    # Clean & filter
    df = df[(df['Quantity'] > 0) & (df['Price'] > 0) & (df['Description'].notnull())]
    
    # Pick top N most popular items
    top_items = df['Description'].value_counts().head(max_items).index.tolist()
    df = df[df['Description'].isin(top_items)]

    db: Session = SessionLocal()

    if wipe_existing:
        print("Clearing existing database tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    prod_db_map = {}
    print(f"Creating {len(top_items)} products in database...")
    for idx, item_desc in enumerate(top_items, start=1):
        p_name = str(item_desc).strip().title()
        sample_price = float(df[df['Description'] == item_desc]['Price'].iloc[0])
        
        p = models.Product(
            id=idx,
            name=p_name,
            category="Retail Goods",
            price=sample_price,
            quantity_in_stock=100,
            reorder_level=20
        )
        db.add(p)
        prod_db_map[item_desc] = idx

    db.commit()

    print("Importing transactional bill history into database...")
    bill_count = 0
    for row in df.itertuples():
        dt = pd.to_datetime(getattr(row, "InvoiceDate"))
        qty = int(getattr(row, "Quantity"))
        price = float(getattr(row, "Price"))
        p_desc = getattr(row, "Description")
        p_id = prod_db_map.get(p_desc, 1)
        p_name = str(p_desc).strip().title()
        total = round(qty * price, 2)

        bill = models.Bill(total_amount=total, created_at=dt)
        db.add(bill)
        db.flush()

        item = models.BillItem(
            bill_id=bill.id,
            product_id=p_id,
            product_name=p_name,
            quantity=qty,
            unit_price=price,
            line_total=total
        )
        db.add(item)
        bill_count += 1

        if bill_count % 2000 == 0:
            db.commit()

    db.commit()
    db.close()
    print(f"[OK] Successfully imported Online Retail II dataset ({bill_count} records) into NexusERP database!")

def import_excel_dataset(excel_path: str, wipe_existing: bool = True):
    if "online_retail_ii" in excel_path.lower():
        import_online_retail_ii(excel_path, wipe_existing=wipe_existing)
        return

    if not os.path.exists(excel_path):
        print(f"Error: File not found at {excel_path}")
        return

    print(f"Loading Excel file from {excel_path}...")
    df = pd.read_excel(excel_path)

    col_map = {}
    for col in df.columns:
        c_lower = col.lower().replace(" ", "").replace("/", "").replace("_", "")
        if c_lower in ["datetime", "orderdate", "date", "billdate", "invoicedate"]:
            col_map[col] = "date"
        elif c_lower in ["productname", "productid", "item", "product", "description", "stockcode"]:
            col_map[col] = "product_name"
        elif c_lower in ["quantity", "qty", "sales"]:
            col_map[col] = "quantity"
        elif c_lower in ["price", "unitprice"]:
            col_map[col] = "unit_price"

    df = df.rename(columns=col_map)
    print("Detected normalized columns:", df.columns.tolist())

    db: Session = SessionLocal()

    if wipe_existing:
        print("Clearing existing database tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    unique_prods = df['product_name'].unique()
    print(f"Found {len(unique_prods)} unique products in Excel dataset.")

    prod_db_map = {}
    for idx, prod_name in enumerate(unique_prods, start=1):
        prod_str = str(prod_name)
        sample_price = float(df[df['product_name'] == prod_name]['unit_price'].iloc[0]) if 'unit_price' in df.columns else 10.0
        
        p = models.Product(
            id=idx,
            name=prod_str,
            category="Grocery",
            price=sample_price,
            quantity_in_stock=100,
            reorder_level=20
        )
        db.add(p)
        prod_db_map[prod_str] = idx

    db.commit()

    print("Importing sales rows into Bills & BillItems...")
    bill_count = 0
    for row in df.itertuples():
        dt = pd.to_datetime(getattr(row, "date"))
        qty = int(getattr(row, "quantity", 1))
        if qty <= 0:
            continue

        p_name = str(getattr(row, "product_name"))
        p_id = prod_db_map.get(p_name, 1)
        price = float(getattr(row, "unit_price", 10.0))
        total = round(qty * price, 2)

        bill = models.Bill(total_amount=total, created_at=dt)
        db.add(bill)
        db.flush()

        item = models.BillItem(
            bill_id=bill.id,
            product_id=p_id,
            product_name=p_name,
            quantity=qty,
            unit_price=price,
            line_total=total
        )
        db.add(item)
        bill_count += 1

        if bill_count % 500 == 0:
            db.commit()

    db.commit()
    db.close()
    print(f"[OK] Successfully imported Excel dataset ({bill_count} transactions, {len(unique_prods)} products) into NexusERP!")

def import_kaggle_store_item_demand(csv_path: str, store_id: int = 1, max_items: int = 10, wipe_existing: bool = True):
    if not os.path.exists(csv_path):
        print(f"Error: File not found at {csv_path}")
        return

    print(f"Loading CSV from {csv_path}...")
    df = pd.read_csv(csv_path)

    if 'store' in df.columns:
        df = df[df['store'] == store_id]

    items = df['item'].unique()[:max_items]
    df = df[df['item'].isin(items)]

    db: Session = SessionLocal()

    if wipe_existing:
        print("Clearing existing tables in database for clean import...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    print(f"Populating {len(items)} Grocery Products with real names...")
    for item_id in items:
        p_id = int(item_id)
        p_name, p_cat, p_price, p_stock, p_reorder = get_product_metadata(p_id)
        
        existing = db.query(models.Product).filter(models.Product.id == p_id).first()
        if not existing:
            p = models.Product(
                id=p_id,
                name=p_name,
                category=p_cat,
                price=p_price,
                quantity_in_stock=p_stock,
                reorder_level=p_reorder
            )
            db.add(p)
    db.commit()

    print("Importing Sales History into Bills & BillItems...")
    bill_count = 0
    for row in df.itertuples():
        dt = pd.to_datetime(row.date)
        qty = int(row.sales)
        if qty <= 0:
            continue

        p_id = int(row.item)
        p_name, _, p_price, _, _ = get_product_metadata(p_id)
        line_total = round(qty * p_price, 2)

        bill = models.Bill(total_amount=line_total, created_at=dt)
        db.add(bill)
        db.flush()

        item = models.BillItem(
            bill_id=bill.id,
            product_id=p_id,
            product_name=p_name,
            quantity=qty,
            unit_price=p_price,
            line_total=line_total
        )
        db.add(item)
        bill_count += 1

        if bill_count % 2000 == 0:
            db.commit()

    db.commit()
    db.close()
    print(f"[OK] Successfully imported Kaggle dataset ({bill_count} daily transactions) into NexusERP database!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if target.endswith(".xlsx") or target.endswith(".xls"):
            import_excel_dataset(target)
        else:
            import_kaggle_store_item_demand(target)
    else:
        excel_online = Path(__file__).resolve().parent.parent.parent / "dataset" / "online_retail_II.xlsx"
        if excel_online.exists():
            import_excel_dataset(str(excel_online))
        else:
            excel_default = Path(__file__).resolve().parent.parent.parent / "dataset" / "bill.xlsx"
            if excel_default.exists():
                import_excel_dataset(str(excel_default))
