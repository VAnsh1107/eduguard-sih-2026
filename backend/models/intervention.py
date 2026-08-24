from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from database import Base, TenantScopedMixin
from datetime import datetime

class Intervention(TenantScopedMixin, Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)        # E.g., "Academic Support", "Attendance & Engagement", etc.
    title = Column(String, nullable=False)       # The short description/title of the intervention assigned
    status = Column(String, default="pending", nullable=False)  # pending | active | resolved
    notes = Column(Text, nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    # Lifecycle fields — all nullable for backward compatibility
    priority = Column(String, nullable=True)             # "HIGH" | "MEDIUM" | "LOW"
    reason = Column(Text, nullable=True)                 # Why this intervention was recommended
    target_metric = Column(String, nullable=True)        # e.g. "attendance_rate", "gpa"
    target_value = Column(Float, nullable=True)          # e.g. 0.75 (target attendance rate)
    review_date = Column(DateTime, nullable=True)        # Suggested check-in / review date
    outcome = Column(Text, nullable=True)                # Mentor notes on outcome after resolution
    risk_prob_at_assignment = Column(Float, nullable=True)  # Snapshot of risk_probability at time of assignment

    def to_dict(self):
        return {
            "id": self.id,
            "institution_id": self.institution_id,
            "student_id": self.student_id,
            "assigned_by": self.assigned_by,
            "type": self.type,
            "title": self.title,
            "status": self.status,
            "notes": self.notes,
            "assigned_at": self.assigned_at.isoformat(),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            # Lifecycle fields
            "priority": self.priority,
            "reason": self.reason,
            "target_metric": self.target_metric,
            "target_value": self.target_value,
            "review_date": self.review_date.isoformat() if self.review_date else None,
            "outcome": self.outcome,
            "risk_prob_at_assignment": self.risk_prob_at_assignment,
        }

