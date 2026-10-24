"""
scheduler.py
------------
APScheduler-based background scheduler.
Reads retrain schedule from DB and registers jobs accordingly.
Provides start_scheduler() called from main.py on app startup.
"""

import logging
import threading
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from database import SessionLocal

logger = logging.getLogger(__name__)

_scheduler: BackgroundScheduler = None
_lock = threading.Lock()


def _get_scheduler() -> BackgroundScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = BackgroundScheduler(timezone="UTC")
    return _scheduler


def _retrain_job():
    """The actual job function called by APScheduler."""
    from prediction_tracker import run_full_retrain, reconcile_actuals
    db = SessionLocal()
    try:
        logger.info(f"[Scheduler] Starting scheduled retrain at {datetime.utcnow()}")
        reconcile_actuals(db)
        run_full_retrain(db)
        logger.info("[Scheduler] Scheduled retrain complete.")
    except Exception as e:
        logger.error(f"[Scheduler] Retrain job failed: {e}", exc_info=True)
    finally:
        db.close()


def reschedule_from_db():
    """
    Reads the retrain schedule from system_config and updates APScheduler.
    Called on startup and whenever the user changes the schedule via API.
    """
    from prediction_tracker import get_retrain_schedule
    db = SessionLocal()
    try:
        schedule = get_retrain_schedule(db)
    finally:
        db.close()

    sched = _get_scheduler()
    with _lock:
        # Remove existing retrain job if any
        if sched.get_job("retrain_job"):
            sched.remove_job("retrain_job")

        stype = schedule.get("type", "manual")

        if stype == "daily":
            time_str = schedule.get("time", "23:59")
            hour, minute = (int(x) for x in time_str.split(":"))
            sched.add_job(
                _retrain_job,
                CronTrigger(hour=hour, minute=minute),
                id="retrain_job",
                replace_existing=True,
                name=f"Daily retrain at {time_str}"
            )
            logger.info(f"[Scheduler] Scheduled daily retrain at {time_str} UTC")

        elif stype == "weekly":
            day = schedule.get("day", "mon")
            time_str = schedule.get("time", "23:59")
            hour, minute = (int(x) for x in time_str.split(":"))
            sched.add_job(
                _retrain_job,
                CronTrigger(day_of_week=day, hour=hour, minute=minute),
                id="retrain_job",
                replace_existing=True,
                name=f"Weekly retrain on {day} at {time_str}"
            )
            logger.info(f"[Scheduler] Scheduled weekly retrain on {day} at {time_str} UTC")

        else:
            logger.info("[Scheduler] Schedule set to manual -- no automatic jobs registered.")

    # Always register the daily reconcile job (00:05 UTC)
    if not sched.get_job("reconcile_job"):
        sched.add_job(
            _reconcile_job,
            CronTrigger(hour=0, minute=5),
            id="reconcile_job",
            replace_existing=True,
            name="Daily actuals reconcile"
        )


def _reconcile_job():
    from prediction_tracker import reconcile_actuals
    db = SessionLocal()
    try:
        reconcile_actuals(db)
    except Exception as e:
        logger.error(f"[Scheduler] Reconcile job failed: {e}", exc_info=True)
    finally:
        db.close()


def start_scheduler():
    sched = _get_scheduler()
    if not sched.running:
        reschedule_from_db()
        sched.start()
        logger.info("[Scheduler] APScheduler started.")


def stop_scheduler():
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("[Scheduler] APScheduler stopped.")
