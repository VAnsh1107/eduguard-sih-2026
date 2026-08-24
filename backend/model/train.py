"""
Model Training Script — XGBoost + RandomForest Voting Ensemble
Supports model versioning, custom data sources, and metadata tracking.
"""

import os
import sys
import json
import joblib
from datetime import datetime
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (classification_report, accuracy_score,
                             f1_score, confusion_matrix)
from xgboost import XGBClassifier

# ── paths ──────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
VERSIONS_DIR = os.path.join(BASE_DIR, "versions")
os.makedirs(VERSIONS_DIR, exist_ok=True)

# ── feature columns (matches synthetic_data.py) ───────────────────────────────
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
TARGET_COL = "dropout_risk"


def load_data_from_db(institution_id: int | None = None) -> tuple[pd.DataFrame, pd.Series]:
    """Pull student records from the SQLite database using SQLAlchemy."""
    sys.path.insert(0, os.path.join(BASE_DIR, ".."))
    from database import get_db
    from models.student import Student

    with get_db() as db:
        query = db.query(Student)
        if institution_id is not None:
            query = query.filter(Student.institution_id == institution_id)
        students = query.all()
        if not students:
            # Fallback to CSV if DB is completely empty
            csv_path = os.path.join(BASE_DIR, "..", "data", "students.csv")
            if os.path.exists(csv_path):
                print(f"[TRAIN] SQLite empty. Loading fallback CSV: {csv_path}")
                df = pd.read_csv(csv_path)
            else:
                raise ValueError("No student records found in database or CSV to train on.")
        else:
            print(f"[TRAIN] Loading {len(students)} records from SQLite database.")
            # Convert Student objects to dict
            records = [s.to_features_dict() for s in students]
            df = pd.DataFrame(records)

            # Map risk levels to numeric classes
            risk_map = {"Low": 0, "Medium": 1, "High": 2}
            df[TARGET_COL] = [risk_map.get(s.risk_label, 0) for s in students]

    X = df[FEATURE_COLS]
    y = df[TARGET_COL]
    return X, y


def build_ensemble() -> VotingClassifier:
    xgb = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
        n_jobs=-1,
    )
    rf = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_split=5,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    ensemble = VotingClassifier(
        estimators=[("xgb", xgb), ("rf", rf)],
        voting="soft",
    )
    return ensemble


def train(data_source=None, institution_id: int | None = None) -> str:
    """
    Trains the model ensemble and saves a versioned copy with metadata.

    Parameters
    ----------
    data_source : tuple(DataFrame, Series), optional
        Pre-loaded training data. If None, pulls from SQLite database.

    Returns
    -------
    version_id : str
        The unique timestamped identifier for the trained model version.
    """
    print("=" * 60)
    print("  SIH Dropout Prediction Model — Versioned Training")
    print("=" * 60)

    # 1. Load data
    if data_source is None:
        X, y = load_data_from_db(institution_id=institution_id)
    else:
        X, y = data_source

    print(f"\n[DATA] {len(X)} records | {X.shape[1]} features")
    print(f"  Class distribution: {y.value_counts().to_dict()}")

    # 2. Split first (prevents data leakage from test set into scaler)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n[SPLIT] Train: {len(X_train_raw)} | Test: {len(X_test_raw)}")

    # 3. Scale strictly on training set
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train_raw)
    X_test = scaler.transform(X_test_raw)

    # 4. Build + train ensemble
    model = build_ensemble()
    print("\n[TRAIN] Fitting XGBoost + RandomForest ensemble...")
    model.fit(X_train, y_train)

    # 5. Evaluate with Stratified 5-Fold Cross-Validation (Pipeline-isolated scaling per fold)
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import StratifiedKFold, cross_val_score
    from sklearn.metrics import confusion_matrix, precision_recall_fscore_support

    cv_pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("ensemble", build_ensemble())
    ])
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(cv_pipeline, X_train_raw, y_train, cv=skf, scoring="f1_macro")
    cv_mean = float(np.mean(cv_scores))
    cv_std  = float(np.std(cv_scores))

    y_pred = model.predict(X_test)
    acc         = float(accuracy_score(y_test, y_pred))
    macro_f1    = float(f1_score(y_test, y_pred, average="macro"))
    weighted_f1 = float(f1_score(y_test, y_pred, average="weighted"))

    p_cls, r_cls, f_cls, _ = precision_recall_fscore_support(y_test, y_pred, labels=[0, 1, 2])
    cm = confusion_matrix(y_test, y_pred).tolist()

    class_names = ["Low", "Medium", "High"]
    per_class_metrics = {
        class_names[i]: {
            "precision": round(float(p_cls[i]), 4),
            "recall":    round(float(r_cls[i]), 4),
            "f1_score":  round(float(f_cls[i]), 4),
        }
        for i in range(3)
    }

    print(f"\n[EVAL] 5-Fold CV F1-Macro: {cv_mean * 100:.2f}% (+/- {cv_std * 100:.2f}%)")
    print(f"[EVAL] Test Accuracy:    {acc * 100:.2f}%")
    print(f"[EVAL] Test Macro F1:    {macro_f1 * 100:.2f}%")
    print(f"[EVAL] Test Weighted F1: {weighted_f1 * 100:.2f}%")
    print("\n[EVAL] Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Low Risk", "Medium Risk", "High Risk"]))

    # 6. Extract Feature Importances
    xgb_model = model.named_estimators_["xgb"]
    rf_model  = model.named_estimators_["rf"]
    avg_importances = (xgb_model.feature_importances_ + rf_model.feature_importances_) / 2.0

    feature_importances = {
        FEATURE_COLS[i]: float(avg_importances[i])
        for i in range(len(FEATURE_COLS))
    }

    # 7. Generate Version ID and Save versioned artifacts
    version_id = datetime.now().strftime("v_%Y%m%d_%H%M%S")
    model_path  = os.path.join(VERSIONS_DIR, f"{version_id}_model.pkl")
    scaler_path = os.path.join(VERSIONS_DIR, f"{version_id}_scaler.pkl")
    meta_path   = os.path.join(VERSIONS_DIR, f"{version_id}_metadata.json")

    joblib.dump(model,  model_path)
    joblib.dump(scaler, scaler_path)

    # Save comprehensive metadata JSON
    metadata = {
        "training_date":        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "institution_id":       institution_id,
        "n_samples":            int(len(X)),
        "accuracy":             round(acc, 4),
        "macro_f1":             round(macro_f1, 4),
        "weighted_f1":          round(weighted_f1, 4),
        "cv_f1_macro_mean":     round(cv_mean, 4),
        "cv_f1_macro_std":      round(cv_std, 4),
        "per_class_metrics":    per_class_metrics,
        "confusion_matrix":     cm,
        "feature_importances":  feature_importances
    }

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n[SAVE] Model    -> {model_path}")
    print(f"[SAVE] Scaler   -> {scaler_path}")
    print(f"[SAVE] Metadata -> {meta_path}")
    print(f"\n[DONE] Version {version_id} training complete!")

    # Set as active automatically if it's the first version
    from registry import set_active_version, list_versions
    if institution_id is not None and len(list_versions(institution_id=institution_id)) == 1:
        set_active_version(version_id, institution_id)

    return version_id


if __name__ == "__main__":
    train()
