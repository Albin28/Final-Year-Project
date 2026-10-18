from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from pathlib import Path
import os

# Keep DB location deterministic regardless of where uvicorn is started.
BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "nexuserp.db"
DB_PATH = Path(os.getenv("NEXUSERP_DB_PATH", str(DEFAULT_DB_PATH))).resolve()
DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False, "timeout": 30})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    # Import models here so Base has them registered before create_all
    import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
