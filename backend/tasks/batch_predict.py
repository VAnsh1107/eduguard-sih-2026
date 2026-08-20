import os
import sys
import warnings
warnings.filterwarnings("ignore", category=UserWarning)
from datetime import datetime

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, ".."))
sys.path.insert(0, os.path.join(BASE_DIR, "..", "model"))

from database import get_db
from models.student import Student
from models.risk_snapshot import RiskSnapshot
from models.alert_config import AlertConfig
from predict import predict as ml_predict

def send_escalation_alert(student_name, risk_prob, top_factors, interventions):
    """Import app within helper to prevent circular imports, sending mail in app context."""
    try:
        from app import app
        from models.user import User
        from services.mailer import send_risk_alert

        with app.app_context():
            with get_db() as db:
                teachers = db.query(User).filter(User.role == "teacher").all()
                teacher_emails = [t.email for t in teachers] if teachers else ["teacher@edu.local"]
                
                for email in teacher_emails:
                    send_risk_alert(email, student_name, risk_prob, top_factors, interventions)
    except Exception as e:
        print(f"[ALERT] Failed to dispatch escalation email for {student_name}: {str(e)}")

def _emit_risk_update(app, institution_id, student_id, new_label, new_prob, changed):
    """
    Emit a 'risk_update' event inside an app context so Flask-SocketIO's
    server-side emit works correctly from a background thread.
    """
    try:
        from socketio_instance import socketio
        with app.app_context():
            payload = {
                "institution_id": institution_id,
                "student_id": student_id,
                "risk_label": new_label,
                "risk_probability": round(new_prob, 2),
                "changed": changed,
            }
            # Always broadcast to teachers room
            socketio.emit("risk_update", payload, room=f"teachers_{institution_id}")
            # Also emit to the student's private room so they can see their own update
            socketio.emit("risk_update", payload, room=f"student_{institution_id}_{student_id}")
    except Exception as e:
        print(f"[WS] Failed to emit risk_update for {student_id}: {e}")


def run_batch_predictions():
    """Runs batch predictions for all students in SQLite and saves risk snapshots."""
    print(f"[BATCH] Starting batch prediction run at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Import app locally to avoid circular import at module level
    try:
        from app import app as flask_app
    except Exception:
        flask_app = None

    with get_db() as db:
        # Load active configuration
        config = db.query(AlertConfig).first()
        alert_on_escalation = config.alert_on_escalation if config else True

        students = db.query(Student).all()
        total = len(students)
        if total == 0:
            print("[BATCH] No student records found. Skipping batch run.")
            return

        print(f"[BATCH] Processing {total} student records in batches of 100...")

        snapshots = []
        batch_size = 100

        for i, s in enumerate(students):
            # 1. Fetch previous snapshot before writing the new one
            prev_snapshot = db.query(RiskSnapshot)\
                              .filter(RiskSnapshot.student_id == s.student_id)\
                              .order_by(RiskSnapshot.timestamp.desc())\
                              .first()

            prev_label = prev_snapshot.risk_label if prev_snapshot else None

            features = s.to_features_dict()
            try:
                # Predict and calculate SHAP + interventions
                pred = ml_predict(features, institution_id=s.institution_id)
                new_label = pred["risk_level"]
                new_prob = float(pred["confidence"])

                snapshot = RiskSnapshot(
                    student_id=s.student_id,
                    risk_label=new_label,
                    risk_probability=new_prob,
                    top_factors=pred["top_factors"],
                    interventions=pred["interventions"],
                    timestamp=datetime.utcnow()
                )
                snapshots.append(snapshot)

                # Check if risk escalated to High → send email alert
                if alert_on_escalation and prev_label:
                    if prev_label in ["Low", "Medium"] and new_label == "High":
                        print(f"[BATCH] Student {s.name} escalated to High Risk ({new_prob:.1f}%). Dispatching alert...")
                        send_escalation_alert(
                            student_name=s.name,
                            risk_prob=new_prob,
                            top_factors=pred["top_factors"],
                            interventions=pred["interventions"]
                        )

                # Emit WebSocket update whenever the label changed
                label_changed = (prev_label != new_label)
                if flask_app and label_changed:
                    _emit_risk_update(flask_app, s.institution_id, s.student_id, new_label, new_prob, label_changed)

            except Exception as e:
                # Fallback to current database fields if prediction fails
                new_label = s.risk_label
                new_prob = s.risk_probability
                snapshot = RiskSnapshot(
                    student_id=s.student_id,
                    risk_label=new_label,
                    risk_probability=new_prob,
                    top_factors=[],
                    interventions=[],
                    timestamp=datetime.utcnow()
                )
                snapshots.append(snapshot)

            # Insert and commit in batches of 100
            if len(snapshots) >= batch_size:
                db.add_all(snapshots)
                db.commit()  # Persist transaction immediately
                snapshots = []
                print(f"[BATCH] Progress: {i + 1}/{total} students processed and committed.")

        # Insert and commit remaining
        if snapshots:
            db.add_all(snapshots)
            db.commit()

        print(f"[BATCH] Successfully completed. Generated and committed {total} risk snapshots.")

def weekly_digest_job():
    """Weekly Cron task grouping High Risk students and emailing report summaries to teachers."""
    print(f"[DIGEST] Running weekly high risk digest task at {datetime.now().isoformat()}")
    try:
        from app import app
        from models.user import User
        from models.student import Student
        from services.mailer import send_weekly_digest

        with app.app_context():
            with get_db() as db:
                config = db.query(AlertConfig).first()
                if config and not config.weekly_digest_enabled:
                    print("[DIGEST] Weekly digest is disabled in settings. Skipping digest dispatch.")
                    return

                high_risk_students = db.query(Student).filter(Student.risk_label == "High").all()
                if not high_risk_students:
                    print("[DIGEST] No high risk students currently in DB. Skipping digest emails.")
                    return

                teachers = db.query(User).filter(User.role == "teacher").all()
                teacher_emails = [t.email for t in teachers] if teachers else ["teacher@edu.local"]
                
                students_list = []
                for s in high_risk_students:
                    students_list.append({
                        "student_id": s.student_id,
                        "name": s.name,
                        "gpa": s.gpa,
                        "attendance_rate": s.attendance_rate,
                        "risk_probability": s.risk_probability
                    })

                for email in teacher_emails:
                    send_weekly_digest(email, students_list)
    except Exception as e:
        print(f"[DIGEST] Error running weekly digest job: {str(e)}")

if __name__ == "__main__":
    run_batch_predictions()
