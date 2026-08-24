"""Tests for POST /api/predict endpoint."""

from unittest.mock import patch

MOCK_PREDICTION = {
    "risk_level": "High",
    "risk_code": 2,
    "confidence": 87.3,
    "probabilities": {"Low": 5.1, "Medium": 7.6, "High": 87.3},
    "risk_color": "#EF4444",
    "top_factors": [
        {"feature": "attendance_rate", "label": "Attendance Rate",
         "impact": 0.42, "direction": "increases risk", "value": 0.45},
    ],
    "interventions": [
        "Enroll in the Attendance Support & Mentorship Programme",
    ],
}


def _auth_header(token):
    return {"Authorization": f"Bearer {token}"}


def _student_payload():
    """Minimal feature dict that satisfies the /api/predict required-fields check."""
    return {
        "attendance_rate": 0.45,
        "gpa": 3.2,
        "assignment_submission_rate": 0.60,
        "lms_login_frequency": 2,
        "library_visits": 1,
        "socioeconomic_score": 4.0,
        "scholarship_recipient": 0,
        "family_income_bracket": 2,
        "previous_backlogs": 3,
        "distance_from_college": 15.0,
        "extracurricular_participation": 0,
        "mental_health_score": 3.5,
    }


def test_predict_returns_risk_label(client, admin_token):
    with patch("app.ml_predict", return_value=MOCK_PREDICTION):
        resp = client.post(
            "/api/predict",
            json=_student_payload(),
            headers=_auth_header(admin_token),
        )
    data = resp.get_json()
    assert resp.status_code == 200
    assert data["risk_level"] in ("Low", "Medium", "High")


def test_predict_returns_confidence(client, admin_token):
    with patch("app.ml_predict", return_value=MOCK_PREDICTION):
        resp = client.post(
            "/api/predict",
            json=_student_payload(),
            headers=_auth_header(admin_token),
        )
    data = resp.get_json()
    assert "confidence" in data
    assert 0 <= data["confidence"] <= 100


def test_predict_returns_interventions(client, admin_token):
    with patch("app.ml_predict", return_value=MOCK_PREDICTION):
        resp = client.post(
            "/api/predict",
            json=_student_payload(),
            headers=_auth_header(admin_token),
        )
    data = resp.get_json()
    assert "interventions" in data
    assert isinstance(data["interventions"], list)
    assert len(data["interventions"]) > 0


def test_predict_rejects_unauthorised(client):
    resp = client.post("/api/predict", json=_student_payload())
    assert resp.status_code in (401, 422)


def test_predict_rejects_missing_fields(client, admin_token):
    resp = client.post(
        "/api/predict",
        json={"gpa": 5.0},
        headers=_auth_header(admin_token),
    )
    assert resp.status_code == 400
    assert "Missing features" in resp.get_json()["error"]


def test_predict_what_if_success(client, admin_token):
    payload = {
        "baseline": _student_payload(),
        "deltas": {
            "attendance_boost": 20.0,
            "gpa_boost": 1.0,
        }
    }
    resp = client.post(
        "/api/predict/what-if",
        json=payload,
        headers=_auth_header(admin_token),
    )
    if resp.status_code != 200:
        print("[TEST ERROR RESPONSE]:", resp.get_json())
    assert resp.status_code == 200
    data = resp.get_json()
    assert "original" in data
    assert "modified" in data
    assert "probability_delta" in data
    assert "risk_class_delta" in data
    assert "risk_drop_pct" in data


def test_predict_what_if_server_side_validation(client, admin_token):
    payload = {
        "baseline": _student_payload(),
        "deltas": {
            "attendance_boost": 999.0,  # Out-of-bounds slider value from client
            "gpa_boost": -50.0,
        }
    }
    resp = client.post(
        "/api/predict/what-if",
        json=payload,
        headers=_auth_header(admin_token),
    )
    assert resp.status_code == 200
    data = resp.get_json()
    # Server-side validation clips values safely
    assert data["modified_features"]["attendance_rate"] <= 1.0
    assert data["modified_features"]["gpa"] >= 0.0
