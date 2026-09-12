import os
import random
from datetime import datetime, timedelta
from pathlib import Path
from sqlalchemy.orm import Session
from openpyxl import Workbook

# Adjust Python path to import backend modules
import sys
sys.path.append(str(Path(__file__).resolve().parent))

from database import SessionLocal, engine, Base
import models

# Master Excel path
DATASETS_DIR = Path(__file__).resolve().parent.parent.parent / "02_Datasets"
MASTER_EXCEL = DATASETS_DIR / "all_bills.xlsx"
EXCEL_HEADERS = [
    "bill_id", "bill_date", "product_id", "product_name",
    "quantity", "unit_price", "line_total", "bill_total"
]

def seed_data():
    db: Session = SessionLocal()
    print("Recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    print("Seeding products...")
    # Define our four products representing distinct demand pattern archetypes
    products_data = [
        {"id": 1, "name": "Premium Milk", "category": "Dairy", "price": 3.0, "quantity_in_stock": 100, "reorder_level": 30},
        {"id": 2, "name": "Specialty Coffee Beans", "category": "Beverages", "price": 15.0, "quantity_in_stock": 50, "reorder_level": 15},
        {"id": 3, "name": "Industrial Cleaning Solution", "category": "Cleaning", "price": 45.0, "quantity_in_stock": 25, "reorder_level": 5},
        {"id": 4, "name": "Air Conditioning Unit", "category": "Appliances", "price": 500.0, "quantity_in_stock": 10, "reorder_level": 2}
    ]

    products = []
    for p_data in products_data:
        p = models.Product(**p_data)
        db.add(p)
        products.append(p)
    db.commit()

    print("Generating 18 months (540 days) of historical sales data...")
    start_date = datetime.now() - timedelta(days=540)
    
    # We will accumulate bill records and items
    excel_rows = []
    bill_counter = 1

    # Product demand parameters
    # 1. Milk: Regular (sold daily, mean=15, std=3, higher on weekends)
    # 2. Coffee: Erratic (sold 85% of days, high variation in quantity: mean=8, std=6)
    # 3. Cleaning: Intermittent (sold ~10% of days, small volume: 1-3 units)
    # 4. AC Unit: Lumpy (sold ~3% of days, high volume spikes: 5-12 units)

    for day_offset in range(540):
        current_day = start_date + timedelta(days=day_offset)
        # Determine day of week (0=Monday, 6=Sunday)
        weekday = current_day.weekday()
        is_weekend = weekday >= 4  # Fri, Sat, Sun

        daily_transactions = []

        # Product 1: Milk (Regular)
        # Always demand
        base_demand = 14.0
        if is_weekend:
            base_demand += 5.0  # weekend bump
        qty_milk = int(max(1, random.normalvariate(base_demand, 2.5)))
        daily_transactions.append((1, "Premium Milk", qty_milk, 3.0))

        # Product 2: Coffee Beans (Erratic)
        if random.random() < 0.85:
            qty_coffee = int(max(1, random.normalvariate(7.0, 4.5)))
            daily_transactions.append((2, "Specialty Coffee Beans", qty_coffee, 15.0))

        # Product 3: Cleaning Solution (Intermittent)
        # Average interval: ~10 days
        if random.random() < 0.10:
            qty_clean = random.choice([1, 2])
            daily_transactions.append((3, "Industrial Cleaning Solution", qty_clean, 45.0))

        # Product 4: AC Unit (Lumpy / Irregular)
        # Average interval: ~30 days, high quantities
        if random.random() < 0.03:
            qty_ac = random.randint(5, 12)
            daily_transactions.append((4, "Air Conditioning Unit", qty_ac, 500.0))

        if daily_transactions:
            # Group into 1 or 2 bills per day to make it realistic
            # For simplicity, we can create one consolidated bill or multiple bills
            # Let's create multiple separate bills
            for item_idx, (p_id, name, qty, price) in enumerate(daily_transactions):
                line_total = qty * price
                
                # Create Bill
                bill = models.Bill(
                    id=bill_counter,
                    total_amount=line_total,
                    created_at=current_day
                )
                db.add(bill)
                db.flush()

                # Create Bill Item
                item = models.BillItem(
                    bill_id=bill.id,
                    product_id=p_id,
                    product_name=name,
                    quantity=qty,
                    unit_price=price,
                    line_total=line_total
                )
                db.add(item)
                
                # Track for Excel
                excel_rows.append([
                    bill.id,
                    str(current_day.strftime("%Y-%m-%d %H:%M:%S")),
                    p_id,
                    name,
                    qty,
                    price,
                    line_total,
                    line_total
                ])
                
                bill_counter += 1

        if day_offset % 100 == 0:
            print(f"Generated day {day_offset}/540...")

    db.commit()
    db.close()
    print("Database seeding completed.")

    # Write to Excel
    print("Writing to Excel...")
    DATASETS_DIR.mkdir(parents=True, exist_ok=True)
    wb = Workbook()
    ws = wb.active
    ws.title = "Bills"
    ws.append(EXCEL_HEADERS)
    for row in excel_rows:
        ws.append(row)
    wb.save(MASTER_EXCEL)
    print(f"Excel file created at {MASTER_EXCEL} with {len(excel_rows)} rows.")

if __name__ == "__main__":
    seed_data()
