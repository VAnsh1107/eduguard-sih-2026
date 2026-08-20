from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from database import Base


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    logo_url = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "logo_url": self.logo_url,
            "created_at": self.created_at.isoformat(),
            "is_active": self.is_active,
        }
