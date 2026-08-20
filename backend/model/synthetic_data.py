"""
Synthetic Student Dataset Generator
Generates 5,000 realistic student records for training the dropout prediction model.
"""

import numpy as np
import pandas as pd
import os

np.random.seed(42)
N = 5000

def generate_dataset():
    """Generate a synthetic dataset of student records with dropout risk labels."""

    # --- Socio-economic & demographic features ---
    socioeconomic_score = np.clip(np.random.normal(5.5, 2.0, N), 1, 10)
    family_income_bracket = np.random.choice([1, 2, 3, 4, 5], N,
                                              p=[0.15, 0.25, 0.30, 0.20, 0.10])
    scholarship_recipient = np.where(socioeconomic_score < 4, 
                                     np.random.binomial(1, 0.70, N),
                                     np.random.binomial(1, 0.15, N))
    distance_from_college = np.clip(np.random.exponential(12, N), 0.5, 80)

    # --- Academic performance features ---
    # GPA correlates with socioeconomic score but has random variation
    gpa_base = 3.5 + (socioeconomic_score - 5) * 0.3
    gpa = np.clip(gpa_base + np.random.normal(0, 1.2, N), 0, 10)

    # Attendance correlates with GPA
    attendance_rate = np.clip(
        0.60 + 0.04 * gpa + np.random.normal(0, 0.12, N), 0.10, 1.0
    )

    # Assignment submission rate correlates with attendance
    assignment_submission_rate = np.clip(
        attendance_rate * 0.9 + np.random.normal(0, 0.10, N), 0.05, 1.0
    )

    # Previous backlogs — more common for low GPA students
    backlog_prob = np.clip(1.0 - gpa / 10, 0.02, 0.80)
    previous_backlogs = np.random.binomial(5, backlog_prob * 0.4, N)

    # --- Behavioral / engagement features ---
    lms_login_frequency = np.clip(
        np.round(3 + 2 * attendance_rate + np.random.normal(0, 2, N)), 0, 21
    ).astype(int)

    library_visits = np.clip(
        np.round(2 + 1.5 * gpa / 10 * 8 + np.random.normal(0, 1.5, N)), 0, 20
    ).astype(int)

    extracurricular_participation = np.where(
        socioeconomic_score > 4,
        np.random.binomial(1, 0.55, N),
        np.random.binomial(1, 0.25, N)
    )

    # --- Mental health ---
    mental_health_score = np.clip(
        5.0 + 0.3 * socioeconomic_score + np.random.normal(0, 1.8, N), 1, 10
    )

    # -------------------------------------------------------------------------
    # Compute dropout risk score (0–1) using a weighted formula
    # -------------------------------------------------------------------------
    risk_score = (
        - 0.25 * (attendance_rate)             # low attendance → high risk
        - 0.20 * (gpa / 10)                    # low GPA → high risk
        - 0.15 * (assignment_submission_rate)   # low submission → high risk
        - 0.10 * (lms_login_frequency / 21)     # low engagement → high risk
        - 0.08 * (socioeconomic_score / 10)     # low SES → high risk
        - 0.07 * (mental_health_score / 10)     # low mental health → high risk
        + 0.05 * (previous_backlogs / 5)        # more backlogs → higher risk
        - 0.05 * (scholarship_recipient)        # scholarship = protective
        + 0.05 * (distance_from_college / 80)   # far distance → higher risk
        - 0.03 * (family_income_bracket / 5)    # higher income = lower risk
        - 0.02 * extracurricular_participation  # active = slightly protective
    )

    # Normalize to 0–1
    risk_score = (risk_score - risk_score.min()) / (risk_score.max() - risk_score.min())
    # Add small noise
    risk_score = np.clip(risk_score + np.random.normal(0, 0.05, N), 0, 1)

    # Convert to 3-class label: 0=Low, 1=Medium, 2=High
    dropout_risk = np.where(risk_score < 0.40, 0,
                   np.where(risk_score < 0.70, 1, 2))

    # --- Student IDs and names (for dashboard display) ---
    student_ids = [f"STU{str(i+1001).zfill(4)}" for i in range(N)]
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
    names = [f"{np.random.choice(first_names)} {np.random.choice(last_names)}" 
             for _ in range(N)]

    df = pd.DataFrame({
        "student_id": student_ids,
        "name": names,
        "department": departments,
        "semester": semesters,
        "attendance_rate": np.round(attendance_rate, 3),
        "gpa": np.round(gpa, 2),
        "assignment_submission_rate": np.round(assignment_submission_rate, 3),
        "lms_login_frequency": lms_login_frequency,
        "library_visits": library_visits,
        "socioeconomic_score": np.round(socioeconomic_score, 2),
        "scholarship_recipient": scholarship_recipient.astype(int),
        "family_income_bracket": family_income_bracket,
        "previous_backlogs": previous_backlogs,
        "distance_from_college": np.round(distance_from_college, 1),
        "extracurricular_participation": extracurricular_participation.astype(int),
        "mental_health_score": np.round(mental_health_score, 2),
        "dropout_risk": dropout_risk
    })

    return df


if __name__ == "__main__":
    df = generate_dataset()
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "students.csv")
    df.to_csv(out_path, index=False)

    print(f"Dataset generated: {len(df)} records → {out_path}")
    print("\nClass distribution:")
    labels = {0: "Low Risk", 1: "Medium Risk", 2: "High Risk"}
    for k, v in labels.items():
        count = (df["dropout_risk"] == k).sum()
        print(f"  {v}: {count} ({count/len(df)*100:.1f}%)")
    print("\nSample rows:")
    print(df.head(5).to_string())
