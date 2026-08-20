from sqlalchemy import Column, Integer, Float, Boolean
from database import Base, TenantScopedMixin

class AlertConfig(TenantScopedMixin, Base):
    __tablename__ = "alert_config"

    id = Column(Integer, primary_key=True, index=True)
    threshold_probability = Column(Float, default=75.0, nullable=False) # e.g. 75%
    alert_on_escalation = Column(Boolean, default=True, nullable=False)
    weekly_digest_enabled = Column(Boolean, default=True, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "institution_id": self.institution_id,
            "threshold_probability": self.threshold_probability,
            "alert_on_escalation": self.alert_on_escalation,
            "weekly_digest_enabled": self.weekly_digest_enabled
        }
