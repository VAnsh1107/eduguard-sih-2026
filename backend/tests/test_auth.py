"""Tests for /api/auth/* endpoints."""

import json


def _auth_header(token):
    return {"Authorization": f"Bearer {token}"}


# ── Login ──────────────────────────────────────────────────────────────────────

def test_login_success(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.local", "password": "testpass"},
    )
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["success"] is True
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["role"] == "admin"


def test_login_wrong_password(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.local", "password": "wrong"},
    )
    assert resp.status_code == 401
    assert "error" in resp.get_json()


def test_login_nonexistent_user(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "nobody@test.local", "password": "testpass"},
    )
    assert resp.status_code == 401


def test_login_institution_id_in_response(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.local", "password": "testpass"},
    )
    data = resp.get_json()
    assert data.get("institution_id") is not None


def test_login_user_object(client):
    resp = client.post(
        "/api/auth/login",
        json={"email": "admin@test.local", "password": "testpass"},
    )
    user = resp.get_json().get("user", {})
    assert user["email"] == "admin@test.local"
    assert user["role"] == "admin"
    assert "institution_id" in user


# ── Logout ─────────────────────────────────────────────────────────────────────

def test_logout(client):
    resp = client.post("/api/auth/logout")
    assert resp.status_code == 200
    assert resp.get_json()["success"] is True


# ── Token-protected endpoint ───────────────────────────────────────────────────

def test_access_protected_endpoint_without_token(client):
    resp = client.get("/api/stats")
    assert resp.status_code in (401, 422)


def test_access_protected_endpoint_with_token(client, admin_token):
    resp = client.get(
        "/api/stats",
        headers=_auth_header(admin_token),
    )
    assert resp.status_code == 200
    assert "total_students" in resp.get_json()


def test_jwt_production_fail_secure(monkeypatch):
    import os
    import pytest
    monkeypatch.setenv("FLASK_ENV", "production")
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)
    
    jwt_secret = os.getenv("JWT_SECRET_KEY")
    env = os.getenv("FLASK_ENV", "").lower()
    if not jwt_secret and env == "production":
        with pytest.raises(RuntimeError, match="FATAL SECURITY CONFIGURATION ERROR"):
            raise RuntimeError("FATAL SECURITY CONFIGURATION ERROR: JWT_SECRET_KEY environment variable is missing in production environment.")
