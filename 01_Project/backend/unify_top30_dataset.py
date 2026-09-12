import os
import sys
import pandas as pd
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session

sys.path.append(str(Path(__file__).resolve().parent))
from database import SessionLocal, engine, Base
import models

DATASETS_DIR = Path(__file__).resolve().parent.parent.parent / "02_Datasets"
MASTER_FILE = DATASETS_DIR / "master_grocery_top30.xlsx"

# Top 30 Unified Grocery Catalog with realistic pricing, stock levels, and demand patterns
UNIFIED_TOP30_CATALOG = [
    (1, "Organic Whole Milk (1L)", "Dairy", 3.50, 150, 30),
    (2, "Whole Wheat Bread", "Bakery", 2.80, 80, 20),
    (3, "Basmati Rice (5kg)", "Grains & Pulses", 12.50, 60, 15),
    (4, "Farm Fresh Eggs (12 pack)", "Dairy", 4.20, 100, 25),
    (5, "Extra Virgin Olive Oil (1L)", "Oils & Condiments", 14.90, 45, 10),
    (6, "Dark Roast Coffee Beans (500g)", "Beverages", 9.80, 50, 15),
    (7, "Greek Plain Yogurt (500g)", "Dairy", 3.90, 70, 20),
    (8, "Whole Grain Oats Cereal", "Breakfast", 4.50, 65, 15),
    (9, "Dishwashing Liquid Soap (750ml)", "Household", 3.20, 90, 20),
    (10, "Concentrated Laundry Detergent", "Household", 11.50, 40, 10),
    (11, "Fresh Organic Vegetables", "Produce", 4.50, 120, 25),
    (12, "Fresh Chicken Breast (1kg)", "Meat & Poultry", 8.90, 50, 15),
    (13, "Atta Whole Wheat Flour (5kg)", "Grains & Pulses", 7.80, 75, 20),
    (14, "Chocolate Chip Cookies", "Snacks", 2.50, 110, 30),
    (15, "Nutritional Health Drink (500g)", "Beverages", 6.50, 40, 10),
    (16, "Seasonal Fresh Fruits Pack", "Produce", 5.20, 90, 20),
    (17, "Carbonated Soft Drink (1.5L)", "Beverages", 2.10, 130, 35),
    (18, "Organic Pulses & Staples Pack", "Grains & Pulses", 9.50, 55, 15),
    (19, "Instant Noodles (Pack of 4)", "Pantry", 1.80, 150, 40),
    (20, "Cheddar Cheese Block (400g)", "Dairy", 5.60, 60, 15),
    (21, "Unsalted Butter (250g)", "Dairy", 3.10, 85, 20),
    (22, "Organic Green Tea (100 bags)", "Beverages", 6.40, 50, 10),
    (23, "Italian Tomato Pasta Sauce", "Pantry", 2.90, 110, 25),
    (24, "Penne Rigate Pasta (1kg)", "Pantry", 2.30, 130, 30),
    (25, "Raw Wildflower Honey (500g)", "Pantry", 8.70, 40, 10),
    (26, "Fresh Orange Juice (1L)", "Beverages", 3.80, 75, 20),
    (27, "70% Dark Chocolate Bar", "Snacks", 2.50, 120, 30),
    (28, "Crispy Potato Chips (200g)", "Snacks", 1.95, 140, 35),
    (29, "Unsweetened Almond Milk (1L)", "Dairy Alternatives", 3.60, 60, 15),
    (30, "Paper Towels (Pack of 4)", "Household", 4.10, 85, 20)
]

def unify_datasets():
    print("Unifying datasets into a single Master Top 30 Grocery dataset...")
    
    # 1. Primary data from bill.xlsx if available
    bill_path = Path(__file__).resolve().parent.parent.parent / "dataset" / "bill.xlsx"
    train_path = DATASETS_DIR / "train.csv" / "train.csv"
    if not train_path.exists():
        train_path = DATASETS_DIR / "train.csv"

    frames = []

    if train_path.exists():
        print(f"Reading Kaggle base sales from {train_path}...")
        df_k = pd.read_csv(train_path)
        if 'store' in df_k.columns:
            df_k = df_k[df_k['store'] == 1]
        
        # Take top 30 item IDs
        df_k = df_k[df_k['item'].isin(range(1, 31))].copy()
        
        # Map item IDs to product names
        p_map = {p[0]: p[1] for p in UNIFIED_TOP30_CATALOG}
        c_map = {p[0]: p[2] for p in UNIFIED_TOP30_CATALOG}
        pr_map = {p[0]: p[3] for p in UNIFIED_TOP30_CATALOG}
        
        df_k['product_id'] = df_k['item']
        df_k['product_name'] = df_k['item'].map(p_map)
        df_k['category'] = df_k['item'].map(c_map)
        df_k['unit_price'] = df_k['item'].map(pr_map)
        df_k['quantity'] = df_k['sales']
        df_k['date'] = pd.to_datetime(df_k['date'])
        df_k['line_total'] = (df_k['quantity'] * df_k['unit_price']).round(2)
        
        frames.append(df_k[['date', 'product_id', 'product_name', 'category', 'quantity', 'unit_price', 'line_total']])

    if not frames and bill_path.exists():
        print(f"Reading bill sales from {bill_path}...")
        df_b = pd.read_excel(bill_path)
        col_map = {'Date/Time': 'date', 'Product Name': 'product_name', 'Quantity': 'quantity', 'Price': 'unit_price'}
        df_b = df_b.rename(columns=col_map)
        df_b['date'] = pd.to_datetime(df_b['date'])
        df_b['line_total'] = (df_b['quantity'] * df_b['unit_price']).round(2)
        frames.append(df_b)

    master_df = pd.concat(frames, ignore_index=True)
    master_df = master_df.sort_values(by='date').reset_index(drop=True)

    print(f"Exporting Unified Master Dataset to {MASTER_FILE}...")
    DATASETS_DIR.mkdir(parents=True, exist_ok=True)
    master_df.to_excel(MASTER_FILE, index=False)
    print(f"Saved {len(master_df):,} records for Top 30 Products to master file.")

    # Populate SQLite Database
    db: Session = SessionLocal()
    print("Recreating database tables for clean Unified Top 30 dataset...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    print("Seeding Top 30 Products into database...")
    for p_id, p_name, p_cat, p_price, p_stock, p_reorder in UNIFIED_TOP30_CATALOG:
        prod = models.Product(
            id=p_id,
            name=p_name,
            category=p_cat,
            price=p_price,
            quantity_in_stock=p_stock,
            reorder_level=p_reorder
        )
        db.add(prod)

    print("Seeding default demo users into database...")
    import utils
    demo_users = [
        ("admin", "admin@nexuserp.local", "admin123"),
        ("manager", "manager@nexuserp.local", "manager123"),
        ("cashier", "cashier@nexuserp.local", "cashier123")
    ]
    for username, email, pwd in demo_users:
        u = models.User(
            username=username,
            email=email,
            hashed_password=utils.get_password_hash(pwd)
        )
        db.add(u)
    db.commit()

    print("Importing sales records into Bills & BillItems...")
    bill_count = 0
    for row in master_df.itertuples():
        dt = pd.to_datetime(row.date)
        qty = int(row.quantity)
        if qty <= 0:
            continue

        p_id = int(row.product_id)
        p_name = str(row.product_name)
        price = float(row.unit_price)
        total = float(row.line_total)

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

        if bill_count % 5000 == 0:
            db.commit()

    db.commit()
    db.close()
    print(f"[OK] Master Unified Top 30 Dataset successfully loaded ({bill_count:,} records across 30 products)!")

if __name__ == "__main__":
    unify_datasets()
