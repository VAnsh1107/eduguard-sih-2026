import os
import sqlite3
from contextlib import contextmanager
from contextvars import ContextVar
from sqlalchemy import create_engine, Column, Integer, ForeignKey, event
from sqlalchemy.orm import declarative_base, sessionmaker, with_loader_criteria

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, "eduguard.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"


TENANT_TABLES = [
    "students",
    "users",
    "risk_snapshots",
    "interventions",
    "checkins",
    "goals",
    "alert_config",
]


def _needs_dev_schema_reset():
    if not os.path.exists(DB_PATH):
        return False
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='institutions'")
            has_institutions = cursor.fetchone() is not None
            if not has_institutions:
                return True

            for table_name in TENANT_TABLES:
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = {row[1] for row in cursor.fetchall()}
                if columns and "institution_id" not in columns:
                    return True
    except Exception:
        return False
    return False


if _needs_dev_schema_reset():
    try:
        os.remove(DB_PATH)
        print("[DB] Reset dev SQLite database to apply multi-tenant schema upgrade.")
    except OSError:
        pass

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

CURRENT_INSTITUTION_ID = ContextVar("current_institution_id", default=None)


class TenantScopedMixin:
    # default=1 ensures batch jobs and seeder code that don't set a tenant
    # context still pass the NOT NULL constraint (institution id 1 = Default University).
    institution_id = Column(Integer, ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True, default=1)


def set_current_institution_id(institution_id):
    return CURRENT_INSTITUTION_ID.set(institution_id)


def reset_current_institution_id(token):
    if token is not None:
        try:
            CURRENT_INSTITUTION_ID.reset(token)
        except Exception:
            pass


def get_current_institution_id():
    return CURRENT_INSTITUTION_ID.get()


@event.listens_for(SessionLocal, "do_orm_execute")
def _add_tenant_filter(execute_state):
    institution_id = get_current_institution_id()
    if institution_id is None or not execute_state.is_select:
        return

    execute_state.statement = execute_state.statement.options(
        with_loader_criteria(
            TenantScopedMixin,
            lambda cls: cls.institution_id == institution_id,
            include_aliases=True,
        )
    )


@event.listens_for(SessionLocal, "before_flush")
def _populate_institution_id(session, flush_context, instances):
    institution_id = get_current_institution_id()
    if institution_id is None:
        return

    for obj in session.new:
        if isinstance(obj, TenantScopedMixin) and getattr(obj, "institution_id", None) is None:
            obj.institution_id = institution_id

@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
