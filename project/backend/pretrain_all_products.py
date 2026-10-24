import sys
import os
import time
from datetime import datetime, timezone

# Windows terminal UTF-8 support
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import database
import models
import forecasting_engine
import prediction_tracker
from sqlalchemy.orm import Session

def run_pretrain(force: bool = False):
    start_time = time.time()
    print("=" * 65)
    print("        NEXUSERP AI DEMAND FORECASTING PRE-TRAINER")
    print("=" * 65)
    print("Starting ML Model Tournament & Dynamic Restock Generation...")
    print("Target: 30 Products (Facebook Prophet, Holt-Winters, SES, ML)")
    print("-" * 65)

    db: Session = database.SessionLocal()
    try:
        products = db.query(models.Product).all()
        total = len(products)
        if total == 0:
            print("[ERROR] No products found in database. Run unify_top30_dataset.py first.")
            return

        # Check dirty products if not forcing full retrain
        if not force and "--force" not in sys.argv:
            dirty_ids = prediction_tracker.get_dirty_product_ids(db)
            products_to_train = [p for p in products if p.id in dirty_ids]
            if not products_to_train:
                total_elapsed = time.time() - start_time
                print(f"[INFO] Incremental Check: All {total} products are already up-to-date!")
                print(f"[INFO] 0 products have new transactions since last training ({prediction_tracker.get_config(db, 'last_trained_at')}).")
                print(f"[SUCCESS] Retrain verification finished in {total_elapsed:.2f} seconds.")
                print("[TIP] Use 'python pretrain_all_products.py --force' to retrain all products unconditionally.")
                print("=" * 65)
                return
            print(f"[INFO] Incremental Dirty-Flag Retrain: {len(products_to_train)} of {total} products have new sales.")
        else:
            products_to_train = products
            print(f"[INFO] Force Retrain Mode: Retraining all {total} products unconditionally.")

        workers = max(1, min(os.cpu_count() or 4, 12))
        print(f"Parallel Multi-Core Execution Enabled:")
        print(f"Distributing {len(products_to_train)} products across {workers} CPU worker threads/processes...")
        print("-" * 65)

        def on_progress(idx, total_tasks, res):
            p_name = res["product_name"]
            best = res["best_model"]
            cat = res["category"]
            elapsed = res["elapsed"]
            if res.get("error"):
                print(f"[{idx:02d}/{total_tasks:02d}] {p_name[:28]:<28} | FAILED: {res['error']} ({elapsed:.1f}s)")
            else:
                print(f"[{idx:02d}/{total_tasks:02d}] {p_name[:28]:<28} | Best: {best:<18} | Cat: {cat:<10} ({elapsed:.1f}s)")

        cache_data = forecasting_engine.train_all_products_parallel(
            products=products_to_train,
            lead_time=3,
            z_score=1.65,
            max_workers=workers,
            progress_callback=on_progress
        )

        print("-" * 65)
        print("Saving prediction logs & updating maturity status...")
        
        prediction_tracker._backfill_prediction_log(db, products_to_train)
        prediction_tracker._save_tomorrow_predictions(db, products)
        prediction_tracker.set_model_status(db, "active")
        prediction_tracker.set_config(db, "last_trained_at", datetime.now(timezone.utc).isoformat())
        db.commit()

        total_elapsed = time.time() - start_time
        print("=" * 65)
        print(f"[SUCCESS] Retrained {len(products_to_train)} products in {total_elapsed:.2f} seconds!")
        print("All forecasts are now pre-computed and stored on disk.")
        print("Opening the web application will now be INSTANTANEOUS (< 0.05s).")
        print("=" * 65)

    except Exception as e:
        print(f"\n[ERROR] Pre-training failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    force_flag = "--force" in sys.argv
    run_pretrain(force=force_flag)

