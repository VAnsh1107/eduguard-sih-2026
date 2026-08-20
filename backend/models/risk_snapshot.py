from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from database import Base, TenantScopedMixin
from datetime import datetime

class RiskSnapshot(TenantScopedMixin, Base):
    __tablename__ = "risk_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, ForeignKey("students.student_id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    risk_label = Column(String, nullable=False)       # "Low", "Medium", "High"
    risk_probability = Column(Float, nullable=False)  # confidence percentage (0-100)
    top_factors = Column(JSON, nullable=True)         # Serialized SHAP factors list
    interventions = Column(JSON, nullable=True)       # Serialized intervention recommendations list

    def to_dict(self):
        return {
            "id": self.id,
            "institution_id": self.institution_id,
            "student_id": self.student_id,
            "timestamp": self.timestamp.isoformat(),
            "risk_label": self.risk_label,
            "risk_probability": self.risk_probability,
            "top_factors": self.top_factors,
            "interventions": self.interventions
        }
