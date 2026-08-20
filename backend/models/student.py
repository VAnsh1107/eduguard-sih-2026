from sqlalchemy import Column, Integer, String, Float
from database import Base, TenantScopedMixin

class Student(TenantScopedMixin, Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    risk_label = Column(String, nullable=False)         # "Low", "Medium", "High"
    risk_probability = Column(Float, nullable=False)    # Confidence level

    # 12 Feature Columns
    gpa = Column(Float, nullable=False)
    attendance_rate = Column(Float, nullable=False)
    assignment_submission_rate = Column(Float, nullable=False)
    lms_logins_week = Column(Integer, nullable=False)          # ML: lms_login_frequency
    library_visits_month = Column(Integer, nullable=False)     # ML: library_visits
    extracurricular = Column(Integer, nullable=False)          # ML: extracurricular_participation
    socioeconomic_score = Column(Float, nullable=False)
    family_income_bracket = Column(Integer, nullable=False)
    scholarship = Column(Integer, nullable=False)              # ML: scholarship_recipient
    distance_from_college = Column(Float, nullable=False)
    mental_wellbeing_score = Column(Float, nullable=False)     # ML: mental_health_score
    previous_backlogs = Column(Integer, nullable=False)

    def to_features_dict(self):
        """Map DB columns back to exact ML features expected by prediction model."""
        return {
            "attendance_rate": self.attendance_rate,
            "gpa": self.gpa,
            "assignment_submission_rate": self.assignment_submission_rate,
            "lms_login_frequency": self.lms_logins_week,
            "library_visits": self.library_visits_month,
            "socioeconomic_score": self.socioeconomic_score,
            "scholarship_recipient": self.scholarship,
            "family_income_bracket": self.family_income_bracket,
            "previous_backlogs": self.previous_backlogs,
            "distance_from_college": self.distance_from_college,
            "extracurricular_participation": self.extracurricular,
            "mental_health_score": self.mental_wellbeing_score,
        }

    def to_dict(self):
        """Serialize student profile for client-side API consume."""
        return {
            "institution_id": self.institution_id,
            "student_id": self.student_id,
            "name": self.name,
            "email": self.email,
            "department": self.department,
            "year": self.year,
            "semester": self.semester,
            "risk_label": self.risk_label,
            "risk_probability": self.risk_probability,
            "gpa": self.gpa,
            "attendance_rate": self.attendance_rate,
            "assignment_submission_rate": self.assignment_submission_rate,
            "lms_logins_week": self.lms_logins_week,
            "library_visits_month": self.library_visits_month,
            "extracurricular": self.extracurricular,
            "socioeconomic_score": self.socioeconomic_score,
            "family_income_bracket": self.family_income_bracket,
            "scholarship": self.scholarship,
            "distance_from_college": self.distance_from_college,
            "mental_wellbeing_score": self.mental_wellbeing_score,
            "previous_backlogs": self.previous_backlogs,
        }
