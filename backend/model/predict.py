"""
Prediction module — loads saved model and returns risk level + SHAP explanations.
"""

import os
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import joblib
import numpy as np
import pandas as pd
import shap

# ── registry & feature list ───────────────────────────────────────────────────
from registry import get_active_model

FEATURE_COLS = [
    "attendance_rate",
    "gpa",
    "assignment_submission_rate",
    "lms_login_frequency",
    "library_visits",
    "socioeconomic_score",
    "scholarship_recipient",
    "family_income_bracket",
    "previous_backlogs",
    "distance_from_college",
    "extracurricular_participation",
    "mental_health_score",
]

_model        = None
_scaler       = None
_feature_cols = None
_explainers   = None   # Cached dict of SHAP TreeExplainers for ensemble sub-models

RISK_LABELS = {0: "Low", 1: "Medium", 2: "High"}
RISK_COLORS = {0: "#10B981", 1: "#F59E0B", 2: "#EF4444"}  # emerald / amber / red


def _load_artifacts(institution_id=None):
    global _model, _scaler, _feature_cols, _explainers
    from registry import get_active_model, get_active_version_id
    current_active_id = get_active_version_id(institution_id=institution_id)
    
    if not hasattr(_load_artifacts, "loaded_version_id"):
        _load_artifacts.loaded_version_id = None
        
    expected_loaded_id = f"{institution_id}:{current_active_id}"
    if _model is None or _load_artifacts.loaded_version_id != expected_loaded_id:
        _model, _scaler = get_active_model(institution_id=institution_id)
        _feature_cols = FEATURE_COLS
        _load_artifacts.loaded_version_id = expected_loaded_id
        _explainers = None  # Reset SHAP explainer cache so it rebuilds for new model


def _get_explainers(institution_id=None):
    """Lazily build SHAP TreeExplainers for both sub-estimators (XGBoost and RandomForest)."""
    global _explainers
    if _explainers is None:
        _load_artifacts(institution_id=institution_id)
        xgb_model = _model.named_estimators_["xgb"]
        rf_model  = _model.named_estimators_["rf"]
        _explainers = {
            "xgb": shap.TreeExplainer(xgb_model),
            "rf":  shap.TreeExplainer(rf_model),
        }
    return _explainers


def _intervention_map(feature: str, value: float) -> str | None:
    """Return an intervention string based on the feature and its direction."""
    rules = {
        "attendance_rate": (0.65, "Enroll in the Attendance Support & Mentorship Programme"),
        "gpa": (4.0, "Connect with Academic Tutoring & Peer Study Groups"),
        "assignment_submission_rate": (0.70, "Assignment Tracking & Submission Reminder System"),
        "lms_login_frequency": (3, "Digital Learning Re-engagement: Guided LMS Walkthrough"),
        "mental_health_score": (4.5, "Refer to Student Counseling & Wellness Centre"),
        "socioeconomic_score": (4.0, "Apply for Emergency Financial Aid & Scholarship"),
        "previous_backlogs": (2, "Backlog Clearance Programme with Faculty Support"),
        "library_visits": (2, "Research Skills Workshop & Library Buddy Programme"),
        "distance_from_college": (25, "Explore On-Campus Hostel / Transport Subsidy"),
    }
    if feature in rules:
        threshold, message = rules[feature]
        # For features where lower = bad
        if feature in ("attendance_rate", "gpa", "assignment_submission_rate",
                       "lms_login_frequency", "mental_health_score",
                       "socioeconomic_score", "library_visits"):
            if value < threshold:
                return message
        # For features where higher = bad
        elif feature in ("previous_backlogs", "distance_from_college"):
            if value > threshold:
                return message
    return None


def _extract_class_shap(shap_vals, risk_code):
    """Extract a 1D array of feature SHAP values for a specific predicted class."""
    if isinstance(shap_vals, list):
        idx = min(risk_code, len(shap_vals) - 1)
        return shap_vals[idx][0]
    elif len(shap_vals.shape) == 3:
        idx = min(risk_code, shap_vals.shape[0] - 1)
        return shap_vals[idx][0]
    else:
        return shap_vals[0]


def predict(features: dict, institution_id: int | None = None) -> dict:
    """
    Predict dropout risk for a single student.

    Parameters
    ----------
    features : dict
        Keys must match FEATURE_COLS exactly.

    Returns
    -------
    dict with keys:
        risk_level      str   "Low" | "Medium" | "High"
        risk_code       int   0 | 1 | 2
        confidence      float 0–100 (%)
        probabilities   dict  {Low: %, Medium: %, High: %}
        risk_color      str   hex color
        top_factors     list  [{feature, impact, direction, value}]
        interventions   list  [str]
    """
    _load_artifacts(institution_id=institution_id)

    # Build feature DataFrame in correct order
    row  = [features.get(col, 0) for col in _feature_cols]
    X_df = pd.DataFrame([row], columns=_feature_cols)
    X_s  = _scaler.transform(X_df)

    # Ensemble prediction
    proba_raw  = _model.predict_proba(X_s)[0]          # [P_low, P_med, P_high]
    risk_code  = int(np.argmax(proba_raw))
    confidence = float(proba_raw[risk_code]) * 100

    probabilities = {
        "Low":    round(float(proba_raw[0]) * 100, 1),
        "Medium": round(float(proba_raw[1]) * 100, 1),
        "High":   round(float(proba_raw[2]) * 100, 1),
    }

    # ── SHAP top-5 contributing features across soft-voting ensemble ─────────
    shap_available = True
    top_factors = []
    explanation_message = None

    try:
        explainers  = _get_explainers(institution_id=institution_id)
        X_scaled_df = pd.DataFrame(X_s, columns=_feature_cols)

        shap_xgb = _extract_class_shap(explainers["xgb"].shap_values(X_scaled_df), risk_code)
        shap_rf  = _extract_class_shap(explainers["rf"].shap_values(X_scaled_df), risk_code)

        # Soft-voting ensemble probability SHAP attribution (weighted 0.5 XGB + 0.5 RF)
        shap_class = (0.5 * shap_xgb) + (0.5 * shap_rf)

        # Sort by absolute impact
        indices = np.argsort(np.abs(shap_class))[::-1][:5]  # top-5

        for idx in indices:
            fname   = _feature_cols[idx]
            impact  = float(shap_class[idx])
            raw_val = float(row[idx])
            top_factors.append({
                "feature":   fname,
                "label":     fname.replace("_", " ").title(),
                "impact":    round(impact, 4),
                "direction": "increases risk" if impact > 0 else "reduces risk",
                "value":     round(raw_val, 3),
            })
    except Exception as e:
        # Do NOT silently substitute scaled feature magnitude as a fake explanation (Guardrail #5)
        import logging
        logging.warning(f"[SHAP] Attribution calculation failed for ensemble model: {str(e)}")
        shap_available = False
        top_factors = []
        explanation_message = "Feature attribution explanation unavailable for this prediction context."

    # ── Interventions ─────────────────────────────────────────────────────────
    interventions = []
    for fac in top_factors:
        msg = _intervention_map(fac["feature"], fac["value"])
        if msg and msg not in interventions:
            interventions.append(msg)

    # Always add a general intervention for high-risk students
    if risk_code == 2 and len(interventions) < 3:
        interventions.append("Schedule immediate one-on-one meeting with Faculty Advisor")
    if risk_code >= 1 and len(interventions) == 0:
        interventions.append("Routine academic check-in with Department Counselor")

    return {
        "risk_level":          RISK_LABELS[risk_code],
        "risk_code":           risk_code,
        "confidence":          round(confidence, 1),
        "probabilities":       probabilities,
        "risk_color":          RISK_COLORS[risk_code],
        "top_factors":         top_factors,
        "shap_available":      shap_available,
        "explanation_message": explanation_message,
        "interventions":       interventions,
    }
