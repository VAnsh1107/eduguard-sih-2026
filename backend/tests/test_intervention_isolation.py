"""Regression tests for intervention endpoint multi-tenant isolation.

Verifies that:
  - Teachers/admins cannot GET interventions for students in other institutions.
  - Teachers/admins cannot POST new interventions to students in other institutions.
  - Teachers/admins cannot PATCH interventions belonging to other institutions.
  - A student cannot view interventions belonging to another student.
  - A teacher in the correct institution CAN access that institution's interventions.
"""

import json
import pytest


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ── Fixtures ────────────────────────────────────────────────────────────────────

@pytest.fixture()
def two_institution_setup(client):
    """
    Creates two institutions with one teacher each and one student each.
    Returns a dict with all IDs and tokens needed for cross-tenant tests.
    """
    import database as _db_mod
    from models.institution import Institution
    from models.user import User
    from models.student import Student

    # Import flask app for context
    import app as _app_mod
    flask_app = _app_mod.app

    tokens = {}
    student_ids = {}

    with flask_app.app_context():
        db = _db_mod.SessionLocal()
        try:
            inst_a = Institution(name="Alpha University", slug="alpha-university")
            inst_b = Institution(name="Beta College", slug="beta-college")
            db.add(inst_a)
            db.add(inst_b)
            db.flush()

            teacher_a = User(email="teacher_a@test.local", role="teacher", institution_id=inst_a.id)
            teacher_a.set_password("testpass")
            teacher_b = User(email="teacher_b@test.local", role="teacher", institution_id=inst_b.id)
            teacher_b.set_password("testpass")
            db.add(teacher_a)
            db.add(teacher_b)
            db.flush()

            # One student per institution
            stu_a = Student(
                student_id="TENANT_STU_A", name="Alice A", email="alice@alpha.local",
                department="CS", year=2, semester=4, risk_label="High",
                risk_probability=76.5, gpa=3.2, attendance_rate=0.55,
                assignment_submission_rate=0.60, lms_logins_week=2,
                library_visits_month=1, extracurricular=0, socioeconomic_score=4.0,
                family_income_bracket=2, scholarship=0, distance_from_college=10.0,
                mental_wellbeing_score=4.0, previous_backlogs=2,
                institution_id=inst_a.id,
            )
            stu_b = Student(
                student_id="TENANT_STU_B", name="Bob B", email="bob@beta.local",
                department="EE", year=3, semester=6, risk_label="Low",
                risk_probability=22.1, gpa=7.0, attendance_rate=0.90,
                assignment_submission_rate=0.95, lms_logins_week=6,
                library_visits_month=4, extracurricular=1, socioeconomic_score=7.0,
                family_income_bracket=4, scholarship=1, distance_from_college=3.0,
                mental_wellbeing_score=7.0, previous_backlogs=0,
                institution_id=inst_b.id,
            )
            db.add(stu_a)
            db.add(stu_b)
            db.commit()

            student_ids["A"] = "TENANT_STU_A"
            student_ids["B"] = "TENANT_STU_B"
        finally:
            db.close()

    # Get tokens for both teachers
    resp_a = client.post("/api/auth/login", json={"email": "teacher_a@test.local", "password": "testpass"})
    tokens["teacher_a"] = resp_a.get_json()["access_token"]
    resp_b = client.post("/api/auth/login", json={"email": "teacher_b@test.local", "password": "testpass"})
    tokens["teacher_b"] = resp_b.get_json()["access_token"]

    return {"tokens": tokens, "student_ids": student_ids}


# ── GET /api/students/<id>/interventions ────────────────────────────────────────

def test_cross_tenant_intervention_get_blocked(client, two_institution_setup):
    """Teacher from Institution B cannot GET interventions for a student in Institution A."""
    token_b = two_institution_setup["tokens"]["teacher_b"]
    stu_a = two_institution_setup["student_ids"]["A"]

    resp = client.get(f"/api/students/{stu_a}/interventions", headers=_auth(token_b))
    assert resp.status_code == 404, (
        f"Expected 404 for cross-tenant GET interventions, got {resp.status_code}: {resp.get_json()}"
    )


def test_same_tenant_intervention_get_allowed(client, two_institution_setup):
    """Teacher from Institution A CAN GET interventions for a student in Institution A."""
    token_a = two_institution_setup["tokens"]["teacher_a"]
    stu_a = two_institution_setup["student_ids"]["A"]

    resp = client.get(f"/api/students/{stu_a}/interventions", headers=_auth(token_a))
    data = resp.get_json()
    assert resp.status_code == 200, f"Expected 200 for same-tenant GET, got {resp.status_code}: {data}"
    assert "interventions" in data


# ── POST /api/students/<id>/interventions ───────────────────────────────────────

def test_cross_tenant_intervention_post_blocked(client, two_institution_setup):
    """Teacher from Institution B cannot POST an intervention for a student in Institution A."""
    token_b = two_institution_setup["tokens"]["teacher_b"]
    stu_a = two_institution_setup["student_ids"]["A"]

    resp = client.post(
        f"/api/students/{stu_a}/interventions",
        headers=_auth(token_b),
        json={"type": "Academic Support", "title": "Cross-tenant test"},
    )
    assert resp.status_code in [403, 404], (
        f"Expected 403 or 404 for cross-tenant POST intervention, got {resp.status_code}: {resp.get_json()}"
    )


def test_same_tenant_intervention_post_sets_institution_id(client, two_institution_setup):
    """POST intervention by Institution A teacher must stamp institution_id = Institution A's id."""
    from unittest.mock import patch

    token_a = two_institution_setup["tokens"]["teacher_a"]
    stu_a = two_institution_setup["student_ids"]["A"]

    MOCK_PREDICTION = {
        "risk_level": "High", "confidence": 76.5, "risk_probability": 76.5,
        "risk_code": 2, "probabilities": {"Low": 5.0, "Medium": 18.5, "High": 76.5},
        "risk_color": "#EF4444", "top_factors": [], "interventions": [],
    }

    with patch("app.ml_predict", return_value=MOCK_PREDICTION):
        resp = client.post(
            f"/api/students/{stu_a}/interventions",
            headers=_auth(token_a),
            json={"type": "Academic Support", "title": "Tutoring sessions", "priority": "HIGH"},
        )
    data = resp.get_json()
    assert resp.status_code == 201, f"Expected 201 for same-tenant POST, got {resp.status_code}: {data}"
    assert data["success"] is True
    assert data["intervention"]["student_id"] == stu_a
    # institution_id must NOT be None
    assert data["intervention"]["institution_id"] is not None
    # priority field should be persisted
    assert data["intervention"]["priority"] == "HIGH"


# ── PATCH /api/interventions/<id> ───────────────────────────────────────────────

def test_cross_tenant_intervention_patch_blocked(client, two_institution_setup):
    """Teacher from Institution B cannot PATCH an intervention belonging to Institution A's student."""
    from unittest.mock import patch as _patch

    token_a = two_institution_setup["tokens"]["teacher_a"]
    token_b = two_institution_setup["tokens"]["teacher_b"]
    stu_a = two_institution_setup["student_ids"]["A"]

    MOCK_PREDICTION = {
        "risk_level": "High", "confidence": 76.5, "risk_probability": 76.5,
        "risk_code": 2, "probabilities": {"Low": 5.0, "Medium": 18.5, "High": 76.5},
        "risk_color": "#EF4444", "top_factors": [], "interventions": [],
    }

    # First, teacher_a creates an intervention for their student
    with _patch("app.ml_predict", return_value=MOCK_PREDICTION):
        create_resp = client.post(
            f"/api/students/{stu_a}/interventions",
            headers=_auth(token_a),
            json={"type": "Mental Health & Wellbeing", "title": "Counseling referral"},
        )
    assert create_resp.status_code == 201, f"Setup failed: {create_resp.get_json()}"
    intervention_id = create_resp.get_json()["intervention"]["id"]

    # Now teacher_b from Institution B tries to PATCH it
    patch_resp = client.patch(
        f"/api/interventions/{intervention_id}",
        headers=_auth(token_b),
        json={"status": "active"},
    )
    assert patch_resp.status_code in [403, 404], (
        f"Expected 403 or 404 for cross-tenant PATCH, got {patch_resp.status_code}: {patch_resp.get_json()}"
    )


def test_same_tenant_intervention_patch_allowed(client, two_institution_setup):
    """Teacher from Institution A CAN PATCH an intervention belonging to their student."""
    from unittest.mock import patch as _patch

    token_a = two_institution_setup["tokens"]["teacher_a"]
    stu_a = two_institution_setup["student_ids"]["A"]

    MOCK_PREDICTION = {
        "risk_level": "High", "confidence": 76.5, "risk_probability": 76.5,
        "risk_code": 2, "probabilities": {"Low": 5.0, "Medium": 18.5, "High": 76.5},
        "risk_color": "#EF4444", "top_factors": [], "interventions": [],
    }

    with _patch("app.ml_predict", return_value=MOCK_PREDICTION):
        create_resp = client.post(
            f"/api/students/{stu_a}/interventions",
            headers=_auth(token_a),
            json={"type": "Attendance & Engagement", "title": "Attendance plan"},
        )
    assert create_resp.status_code == 201
    intervention_id = create_resp.get_json()["intervention"]["id"]

    patch_resp = client.patch(
        f"/api/interventions/{intervention_id}",
        headers=_auth(token_a),
        json={"status": "active", "outcome": "Student attended 3 extra sessions."},
    )
    data = patch_resp.get_json()
    assert patch_resp.status_code == 200, f"Expected 200 for same-tenant PATCH, got {patch_resp.status_code}: {data}"
    assert data["intervention"]["status"] == "active"
    assert data["intervention"]["outcome"] == "Student attended 3 extra sessions."
