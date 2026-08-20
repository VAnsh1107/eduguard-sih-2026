from datetime import date, datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, JSON
from database import Base, TenantScopedMixin


class Goal(TenantScopedMixin, Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False, index=True)
    goal_type = Column(String, nullable=False)
    target_value = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False, default=date.today)
    end_date = Column(Date, nullable=False)
    status = Column(String, nullable=False, default="active")
    weekly_snapshots = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "institution_id": self.institution_id,
            "student_id": self.student_id,
            "goal_type": self.goal_type,
            "target_value": round(float(self.target_value), 2),
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "status": self.status,
            "weekly_snapshots": self.weekly_snapshots or [],
            "created_at": self.created_at.isoformat(),
        }
