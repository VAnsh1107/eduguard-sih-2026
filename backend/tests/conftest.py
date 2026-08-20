"""Shared test fixtures — in-memory SQLite, Flask test client, seeded users."""

import os
import sys
import pytest

_backend_root = os.path.join(os.path.dirname(__file__), "..")
if _backend_root not in sys.path:
    sys.path.insert(0, _backend_root)


@pytest.fixture()
def client(tmp_path):
    """
    Fresh Flask test-client per test.
    Uses an in-memory SQLite DB, seeds minimal data, mocks scheduler/threads.
    """
    import sqlalchemy as _sa
    from unittest.mock import patch

    # ── 1. Redirect database module engine BEFORE any app import ──────────────
    #    database.py is imported before app.py on sys.modules. We swap the
    #    engine so when app.py does `from database import engine`, it captures
    #    the in-memory one.
    import database as _db_mod
    _mem = _sa.create_engine("sqlite://")
    _db_mod.engine = _mem
    _db_mod.SessionLocal.configure(bind=_mem)

    # ── 2. Patch side-effects, then import app ────────────────────────────────
    patches = [
        patch("app.seed_database"),
        patch("apscheduler.schedulers.background.BackgroundScheduler.start"),
        patch("threading.Thread", side_effect=lambda **kw: type("_Noop", (), {"start": lambda s: None, "daemon": True})()),
    ]
    for p in patches:
        p.start()

    # Import app — this triggers Base.metadata.create_all(bind=engine)
    # which now uses our in-memory engine because database.engine was swapped.
    from app import app as flask_app

    flask_app.config["TESTING"] = True
    flask_app.config["JWT_SECRET_KEY"] = "test-secret"

    # Ensure app's local `engine` ref also points to in-memory
    import app as _app_mod
    _app_mod.engine = _mem

    # ── 3. Seed minimal test data ────────────────────────────────────────────
    from models.institution import Institution
    from models.user import User
    from models.alert_config import AlertConfig

    with flask_app.app_context():
        db = _db_mod.SessionLocal()
        try:
            inst = Institution(name="Test University", slug="test-university")
            db.add(inst)
            db.flush()

            for email, role in [
                ("admin@test.local", "admin"),
                ("teacher@test.local", "teacher"),
                ("super@test.local", "super_admin"),
            ]:
                u = User(email=email, role=role, institution_id=inst.id)
                u.set_password("testpass")
                db.add(u)

            db.add(AlertConfig(institution_id=inst.id))
            db.commit()
        finally:
            db.close()

    # ── 4. Yield test client ─────────────────────────────────────────────────
    with flask_app.test_client() as c:
        yield c

    # ── 5. Cleanup ───────────────────────────────────────────────────────────
    for p in patches:
        p.stop()


@pytest.fixture()
def admin_token(client):
    """Valid JWT for the seeded admin user."""
    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.local", "password": "testpass"},
    )
    return resp.get_json()["access_token"]


@pytest.fixture()
def super_token(client):
    """Valid JWT for the seeded super_admin user."""
    resp = client.post(
        "/api/auth/login",
        json={"email": "super@test.local", "password": "testpass"},
    )
    return resp.get_json()["access_token"]
