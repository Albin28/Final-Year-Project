import os
import sys
import pandas as pd
from datetime import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import func

sys.path.append(str(Path(__file__).resolve().parent))
from database import SessionLocal, engine, Base
import models

DATASETS_DIR = Path(__file__).resolve().parent.parent.parent / "dataset"
MASTER_FILE = DATASETS_DIR / "master_grocery_top30.xlsx"

# Top 30 Unified Grocery Catalog with realistic Indian supermarket brands, INR pricing, and stock levels
UNIFIED_TOP30_CATALOG = [
    (1, "Amul Taaza Toned Milk (1L)", "Dairy", 74.0, 150, 30),
    (2, "Britannia 100% Whole Wheat Bread (400g)", "Bakery", 50.0, 80, 20),
    (3, "India Gate Feast Rozzana Basmati Rice (5kg)", "Grains & Staples", 454.0, 60, 15),
    (4, "Suguna Farm Fresh White Eggs (Pack of 12)", "Dairy & Eggs", 108.0, 100, 25),
    (5, "Fortune Sunlite Refined Sunflower Oil (1L Pouch)", "Oils & Ghee", 145.0, 45, 10),
    (6, "Nescafé Classic Instant Coffee Glass Jar (100g)", "Beverages", 380.0, 50, 15),
    (7, "Epigamia Greek Plain Yogurt (400g)", "Dairy", 140.0, 70, 20),
    (8, "Kellogg's Rolled Oats Pouch (1kg)", "Breakfast Cereals", 199.0, 65, 15),
    (9, "Vim Dishwash Liquid Gel Lemon (750ml)", "Household Care", 160.0, 90, 20),
    (10, "Surf Excel Matic Front Load Detergent Powder (1kg)", "Household Care", 245.0, 40, 10),
    (11, "Fresh Hybrid Tomatoes & Red Onions (2kg Pack)", "Fresh Produce", 80.0, 120, 25),
    (12, "Zorabian Fresh Chicken Breast Boneless (500g)", "Meat & Poultry", 265.0, 50, 15),
    (13, "Aashirvaad Superior MP Shudh Chakki Atta (5kg)", "Grains & Staples", 270.0, 75, 20),
    (14, "Parle Hide & Seek Choco Chip Biscuits (350g)", "Snacks & Confectionery", 75.0, 110, 30),
    (15, "Horlicks Classic Malt Nutrition Drink (500g)", "Health & Nutrition", 295.0, 40, 10),
    (16, "Kashmir Royal Delicious Red Apples (4 Pcs)", "Fresh Produce", 165.0, 90, 20),
    (17, "Thums Up Charged Soft Drink Bottle (1.75L)", "Beverages", 90.0, 130, 35),
    (18, "Tata Sampann Unpolished Toor Dal (1kg)", "Grains & Staples", 210.0, 55, 15),
    (19, "Maggi 2-Minute Masala Instant Noodles (Pack of 4)", "Instant Foods", 56.0, 150, 40),
    (20, "Amul Processed Cheese Block (400g)", "Dairy", 245.0, 60, 15),
    # --- QUADRANT 2: Intermittent Demand (ADI >= 1.32, CV2 < 0.49) ---
    (21, "Prestige Deluxe Alpha Stainless Steel Cooker (3L)", "Kitchenware", 1850.0, 14, 4),
    (22, "Bajaj GX-1 500W Mixer Grinder with 3 Jars", "Home Appliances", 2199.0, 10, 3),
    (23, "Borges Extra Virgin Olive Oil Glass Bottle (1L)", "Gourmet Oils", 1250.0, 16, 5),
    # --- QUADRANT 3: Erratic Demand (ADI < 1.32, CV2 >= 0.49) ---
    (24, "Haldiram's Nagpur Kaju Katli Gift Box (500g)", "Traditional Sweets", 520.0, 85, 25),
    (25, "Paper Boat Aamras Alphonso Mango Drink (1L)", "Beverages", 120.0, 110, 30),
    (26, "Catch Pink Himalayan Rock Salt Grinder (200g)", "Gourmet Spices", 175.0, 45, 15),
    # --- QUADRANT 4: Lumpy Demand (ADI >= 1.32, CV2 >= 0.49) ---
    (27, "Ferrero Rocher Premium Hazelnut Pralines (24 Pcs)", "Luxury Chocolates", 899.0, 25, 8),
    (28, "Patanjali Kesh Kanti Herbal Hair Oil Combo (300ml)", "Personal Care", 240.0, 40, 10),
    (29, "Milton Thermosteel Flip Lid Vacuum Flask (1000ml)", "Household Utilities", 780.0, 20, 6),
    (30, "Godrej aer Matic Automatic Room Spray Kit (225ml)", "Home Care & Fragrance", 499.0, 22, 7)
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
        
        # Realistic retail distributions for items 21-30 across Intermittent, Erratic, and Lumpy quadrants
        import numpy as np
        np.random.seed(42)

        for item_id in range(21, 31):
            mask = df_k['item'] == item_id
            n = int(mask.sum())
            if n == 0:
                continue

            t = np.arange(n)
            # Item 21: Intermittent (Prestige Cooker) - sells once every ~2.8 days, 1-2 units (SES winner)
            if item_id == 21:
                active = np.random.rand(n) < 0.35
                qty = np.zeros(n, dtype=int)
                qty[active] = np.random.choice([1, 2], size=np.sum(active), p=[0.85, 0.15])
            # Item 22: Intermittent (Bajaj Mixer Grinder) - sells once every ~2.5 days, 1 unit (SES winner)
            elif item_id == 22:
                active = np.random.rand(n) < 0.40
                qty = np.zeros(n, dtype=int)
                qty[active] = np.random.choice([1, 2], size=np.sum(active), p=[0.88, 0.12])
            # Item 23: Intermittent (Borges Olive Oil) - sells every ~2.3 days with non-linear lags (Random Forest winner)
            elif item_id == 23:
                qty = np.zeros(n, dtype=int)
                for i in range(n):
                    if i % 3 == 0 and np.random.rand() < 0.8:
                        prev = qty[i-7] if i >= 7 else 2
                        qty[i] = int(max(1, prev * 0.6 + np.random.choice([1, 2], p=[0.75, 0.25])))
            # Item 24: Erratic (Haldiram Kaju Katli) - sells daily with huge festive spikes (Gradient Boosting winner)
            elif item_id == 24:
                active = np.random.rand(n) < 0.95
                qty = np.zeros(n, dtype=int)
                qty[active] = np.maximum(2, np.random.negative_binomial(1, 0.08, size=np.sum(active)))
            # Item 25: Erratic (Paper Boat Mango Drink) - strong weekly seasonality + trend (Prophet winner)
            elif item_id == 25:
                p_base = 12 + 0.015 * t + 14 * np.sin(2 * np.pi * t / 7) + np.random.normal(0, 3.5, size=n)
                qty = np.maximum(3, p_base.astype(int))
            # Item 26: Erratic (Catch Himalayan Rock Salt) - daily sales with bulk spice orders (Gradient Boosting winner)
            elif item_id == 26:
                active = np.random.rand(n) < 0.90
                qty = np.zeros(n, dtype=int)
                qty[active] = np.maximum(1, np.random.negative_binomial(1, 0.12, size=np.sum(active)))
            # Item 27: Lumpy (Ferrero Rocher) - sparse orders with erratic quantities (SES winner)
            elif item_id == 27:
                active = np.random.rand(n) < 0.35
                qty = np.zeros(n, dtype=int)
                qty[active] = np.maximum(1, np.random.negative_binomial(1, 0.20, size=np.sum(active)))
            # Item 28: Lumpy (Patanjali Hair Oil Combo) - sparse orders with lag interactions (Random Forest winner)
            elif item_id == 28:
                qty = np.zeros(n, dtype=int)
                for i in range(n):
                    if (i % 2 == 0 or i % 5 == 0) and np.random.rand() < 0.6:
                        prev = qty[i-7] if i >= 7 else 3
                        qty[i] = int(max(1, prev * 0.5 + np.random.negative_binomial(1, 0.25)))
            # Item 29: Lumpy (Milton Vacuum Flask) - sparse orders, 1 to 6 units (SES winner)
            elif item_id == 29:
                active = np.random.rand(n) < 0.30
                qty = np.zeros(n, dtype=int)
                qty[active] = np.maximum(1, np.random.negative_binomial(1, 0.25, size=np.sum(active)))
            # Item 30: Lumpy (Godrej aer Spray Kit) - sparse orders with lag pattern (Random Forest winner)
            elif item_id == 30:
                qty = np.zeros(n, dtype=int)
                for i in range(n):
                    if (i % 3 == 0 or i % 7 == 0) and np.random.rand() < 0.65:
                        prev = qty[i-7] if i >= 7 else 4
                        qty[i] = int(max(1, prev * 0.6 + np.random.negative_binomial(1, 0.22)))

            df_k.loc[mask, 'quantity'] = qty

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

    # Shift historical timestamps forward so the dataset seamlessly ends yesterday
    if not master_df.empty:
        max_d = master_df['date'].max()
        target_end = pd.to_datetime(datetime.now().date() - pd.Timedelta(days=1))
        if max_d < target_end:
            shift_days = (target_end - max_d).days
            print(f"Shifting historical records by {shift_days} days to align ending date with {target_end.date()}...")
            master_df['date'] = master_df['date'] + pd.Timedelta(days=shift_days)

        # Filter strictly to the last 2 years (730 days) of business history
        start_2y = target_end - pd.Timedelta(days=729)
        print(f"Filtering dataset to last 2 years of retail transactions: {start_2y.date()} to {target_end.date()} (730 days)...")
        master_df = master_df[master_df['date'] >= start_2y].reset_index(drop=True)

    print(f"Exporting Unified Master Dataset to {MASTER_FILE}...")
    DATASETS_DIR.mkdir(parents=True, exist_ok=True)
    master_df.to_excel(MASTER_FILE, index=False)
    print(f"Saved {len(master_df):,} records for Top 30 Products to master file (Last 2 Years).")

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
        ("admin", "admin@nexuserp.local", "admin123")
    ]
    for username, email, pwd in demo_users:
        u = models.User(
            username=username,
            email=email,
            hashed_password=utils.get_password_hash(pwd)
        )
        db.add(u)
    db.commit()

    print("Importing sales records into Bills & BillItems (bulk insert)...")
    # Filter valid rows once
    valid_rows = [
        row for row in master_df.itertuples()
        if int(row.quantity) > 0
    ]
    bill_count = len(valid_rows)

    BATCH = 5000
    for batch_start in range(0, bill_count, BATCH):
        batch = valid_rows[batch_start: batch_start + BATCH]

        # Bulk-insert Bills, get back auto-generated IDs
        bill_mappings = [
            {"total_amount": float(row.line_total), "created_at": pd.to_datetime(row.date).to_pydatetime()}
            for row in batch
        ]
        db.bulk_insert_mappings(models.Bill, bill_mappings)
        db.flush()

        # Fetch the IDs just inserted (they are sequential, last N rows)
        last_id = db.query(func.max(models.Bill.id)).scalar()
        first_id = last_id - len(batch) + 1
        bill_ids = range(first_id, last_id + 1)

        item_mappings = [
            {
                "bill_id": bid,
                "product_id": int(row.product_id),
                "product_name": str(row.product_name),
                "quantity": int(row.quantity),
                "unit_price": float(row.unit_price),
                "line_total": float(row.line_total)
            }
            for bid, row in zip(bill_ids, batch)
        ]
        db.bulk_insert_mappings(models.BillItem, item_mappings)
        db.commit()
        print(f"  Inserted {min(batch_start + BATCH, bill_count):,}/{bill_count:,} records...")

    db.close()
    print(f"[OK] Master Unified Top 30 Dataset successfully loaded ({bill_count:,} records across 30 products)!")

if __name__ == "__main__":
    unify_datasets()
