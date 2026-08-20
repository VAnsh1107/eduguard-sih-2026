from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
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
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None
        }
