from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from database import Base, TenantScopedMixin


class CheckIn(TenantScopedMixin, Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    week_start = Column(Date, nullable=False, index=True, default=date.today)
    stress_level = Column(Integer, nullable=False)
    sleep_quality = Column(Integer, nullable=False)
    motivation = Column(Integer, nullable=False)
    financial_stress = Column(Integer, nullable=False)
    social_support = Column(Integer, nullable=False)
    composite_score = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "institution_id": self.institution_id,
            "student_id": self.student_id,
            "week_start": self.week_start.isoformat(),
            "stress_level": self.stress_level,
            "sleep_quality": self.sleep_quality,
            "motivation": self.motivation,
            "financial_stress": self.financial_stress,
            "social_support": self.social_support,
            "composite_score": round(float(self.composite_score), 2),
            "created_at": self.created_at.isoformat(),
        }
