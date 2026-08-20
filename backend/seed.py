import os
import sys
import numpy as np
import pandas as pd
import joblib

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from database import engine, Base, get_db
from models.student import Student
from models.user import User
from models.institution import Institution

MODELS_DIR = os.path.join(BASE_DIR, "models")

def seed_database():
    """Generates 5,000 synthetic students and inserts them into SQLite using batch prediction."""
    Base.metadata.create_all(bind=engine)

    with get_db() as db:
        from models.user import User
        from models.alert_config import AlertConfig

        default_institution = db.query(Institution).filter(Institution.slug == "default-university").first()
        if default_institution is None:
            default_institution = Institution(name="Default University", slug="default-university")
            db.add(default_institution)
            db.flush()

        secondary_institution = db.query(Institution).filter(Institution.slug == "northbridge-college").first()
        if secondary_institution is None:
            secondary_institution = Institution(name="Northbridge College", slug="northbridge-college")
            db.add(secondary_institution)
            db.flush()

        # Check if users are empty
        if db.query(User).first() is None:
            print("[SEED] Users table is empty. Seeding default users...")
            super_admin = User(email="superadmin@edu.local", role="super_admin", institution_id=default_institution.id)
            super_admin.set_password("changeme")

            admin = User(email="admin@edu.local", role="admin", institution_id=default_institution.id)
            admin.set_password("changeme")

            teacher = User(email="teacher@edu.local", role="teacher", institution_id=default_institution.id)
            teacher.set_password("changeme")

            has_student = db.query(Student).filter(Student.student_id == "STU1001").first() is not None
            student_user = User(
                email="student@edu.local",
                role="student",
                linked_student_id="STU1001" if has_student else None,
                institution_id=default_institution.id
            )
            student_user.set_password("changeme")

            db.add_all([super_admin, admin, teacher, student_user])
            print("[SEED] Successfully seeded default users.")

        if db.query(AlertConfig).filter(AlertConfig.institution_id == default_institution.id).first() is None:
            print("[SEED] Default institution alert config is empty. Seeding default config...")
            config = AlertConfig(
                institution_id=default_institution.id,
                threshold_probability=75.0,
                alert_on_escalation=True,
                weekly_digest_enabled=True
            )
            db.add(config)
            print("[SEED] Successfully seeded default institution alert config.")

        if db.query(AlertConfig).filter(AlertConfig.institution_id == secondary_institution.id).first() is None:
            db.add(AlertConfig(
                institution_id=secondary_institution.id,
                threshold_probability=75.0,
                alert_on_escalation=True,
                weekly_digest_enabled=True
            ))

        # Check if the DB is already seeded with students
        if db.query(Student).first() is not None:
            print("[SEED] Students database already contains records. Skipping student seeding.")
            # Fix linked student ID on early return if student exists now
            stu_user = db.query(User).filter(User.email == "student@edu.local").first()
            if stu_user and not stu_user.linked_student_id:
                stu_user.linked_student_id = "STU1001"
            return

        print("[SEED] Seeding database with 5000 students (optimised batch model inference)...")
        N = 5000
        np.random.seed(42)

        # 1. Load ML Model Artifacts
        model_path  = os.path.join(MODELS_DIR, "dropout_model.pkl")
        scaler_path = os.path.join(MODELS_DIR, "scaler.pkl")
        cols_path   = os.path.join(MODELS_DIR, "feature_cols.pkl")

        if not (os.path.exists(model_path) and os.path.exists(scaler_path)):
            print("[SEED] Trained model files not found. Run model training first.")
            return

        model        = joblib.load(model_path)
        scaler       = joblib.load(scaler_path)
        feature_cols = joblib.load(cols_path)

        # 2. Generate features using standard distributions
        socioeconomic_score = np.clip(np.random.normal(5.5, 2.0, N), 1, 10)
        family_income_bracket = np.random.choice([1, 2, 3, 4, 5], N, p=[0.15, 0.25, 0.30, 0.20, 0.10])
        scholarship = np.where(socioeconomic_score < 4, np.random.binomial(1, 0.70, N), np.random.binomial(1, 0.15, N))
        distance_from_college = np.clip(np.random.exponential(12, N), 0.5, 80)

        gpa_base = 3.5 + (socioeconomic_score - 5) * 0.3
        gpa = np.clip(gpa_base + np.random.normal(0, 1.2, N), 0, 10)

        attendance_rate = np.clip(0.60 + 0.04 * gpa + np.random.normal(0, 0.12, N), 0.10, 1.0)
        assignment_submission_rate = np.clip(attendance_rate * 0.9 + np.random.normal(0, 0.10, N), 0.05, 1.0)

        backlog_prob = np.clip(1.0 - gpa / 10, 0.02, 0.80)
        previous_backlogs = np.random.binomial(5, backlog_prob * 0.4, N)

        lms_logins_week = np.clip(np.round(3 + 2 * attendance_rate + np.random.normal(0, 2, N)), 0, 21).astype(int)
        library_visits_month = np.clip(np.round(2 + 1.5 * gpa / 10 * 8 + np.random.normal(0, 1.5, N)), 0, 20).astype(int)

        extracurricular = np.where(socioeconomic_score > 4, np.random.binomial(1, 0.55, N), np.random.binomial(1, 0.25, N))
        mental_wellbeing_score = np.clip(5.0 + 0.3 * socioeconomic_score + np.random.normal(0, 1.8, N), 1, 10)

        # 3. Create DataFrame of features for batch prediction
        features_df = pd.DataFrame({
            "attendance_rate":                attendance_rate,
            "gpa":                            gpa,
            "assignment_submission_rate":      assignment_submission_rate,
            "lms_login_frequency":            lms_logins_week,
            "library_visits":                 library_visits_month,
            "socioeconomic_score":            socioeconomic_score,
            "scholarship_recipient":          scholarship,
            "family_income_bracket":          family_income_bracket,
            "previous_backlogs":              previous_backlogs,
            "distance_from_college":          distance_from_college,
            "extracurricular_participation":  extracurricular,
            "mental_health_score":            mental_wellbeing_score
        })

        # Ensure correct column order
        features_df = features_df[feature_cols]

        # 4. Scale & Predict in Batch
        features_scaled = scaler.transform(features_df)
        probabilities = model.predict_proba(features_scaled)

        # 5. Build Student objects
        departments = np.random.choice(
            ["Computer Science", "Mechanical Eng.", "Electrical Eng.",
             "Civil Eng.", "Electronics", "Information Tech.", "Biotechnology"],
            N, p=[0.22, 0.18, 0.16, 0.12, 0.12, 0.12, 0.08]
        )
        semesters = np.random.choice([1, 2, 3, 4, 5, 6, 7, 8], N)

        first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyan",
                       "Priya", "Ananya", "Ishita", "Kavya", "Riya", "Sneha", "Pooja",
                       "Rahul", "Rohan", "Karan", "Amit", "Nikhil", "Suresh"]
        last_names = ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Verma", "Nair",
                      "Reddy", "Joshi", "Mehta", "Yadav", "Mishra", "Pandey", "Rao"]

        risk_labels = ["Low", "Medium", "High"]
        students_to_add = []

        for i in range(N):
            student_id = f"STU{str(i+1001).zfill(4)}"
            name = f"{np.random.choice(first_names)} {np.random.choice(last_names)}"
            email = f"{student_id.lower()}@sih.edu"
            dept = departments[i]
            sem = int(semesters[i])
            yr = (sem + 1) // 2

            # Read batch predictions
            risk_code = int(np.argmax(probabilities[i]))
            risk_label = risk_labels[risk_code]
            risk_probability = float(probabilities[i][risk_code]) * 100

            s = Student(
                institution_id=default_institution.id,
                student_id=student_id,
                name=name,
                email=email,
                department=dept,
                year=yr,
                semester=sem,
                risk_label=risk_label,
                risk_probability=risk_probability,
                gpa=float(gpa[i]),
                attendance_rate=float(attendance_rate[i]),
                assignment_submission_rate=float(assignment_submission_rate[i]),
                lms_logins_week=int(lms_logins_week[i]),
                library_visits_month=int(library_visits_month[i]),
                extracurricular=int(extracurricular[i]),
                socioeconomic_score=float(socioeconomic_score[i]),
                family_income_bracket=int(family_income_bracket[i]),
                scholarship=int(scholarship[i]),
                distance_from_college=float(distance_from_college[i]),
                mental_wellbeing_score=float(mental_wellbeing_score[i]),
                previous_backlogs=int(previous_backlogs[i])
            )
            students_to_add.append(s)

        # Batch insert to SQLite
        db.add_all(students_to_add)
        db.flush()

        # Seed default users
        from models.user import User
        if db.query(User).first() is None:
            print("[SEED] Seeding default users...")
            super_admin = User(email="superadmin@edu.local", role="super_admin", institution_id=default_institution.id)
            super_admin.set_password("changeme")

            admin = User(email="admin@edu.local", role="admin", institution_id=default_institution.id)
            admin.set_password("changeme")

            teacher = User(email="teacher@edu.local", role="teacher", institution_id=default_institution.id)
            teacher.set_password("changeme")

            student_user = User(email="student@edu.local", role="student", linked_student_id="STU1001", institution_id=default_institution.id)
            student_user.set_password("changeme")

            db.add_all([super_admin, admin, teacher, student_user])
            print("[SEED] Successfully seeded default users.")

        print(f"[SEED] Successfully database seeded with {N} students in batch mode.")

if __name__ == "__main__":
    seed_database()
