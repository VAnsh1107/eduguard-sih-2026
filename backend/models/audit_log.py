from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from database import Base, TenantScopedMixin


class AuditLog(TenantScopedMixin, Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    actor_email = Column(String, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "institution_id": self.institution_id,
            "action": self.action,
            "actor_email": self.actor_email,
            "metadata_json": self.metadata_json,
            "created_at": self.created_at.isoformat(),
        }
