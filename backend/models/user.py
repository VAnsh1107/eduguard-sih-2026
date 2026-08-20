from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base, TenantScopedMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(TenantScopedMixin, Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "super_admin", "admin", "teacher", "student"
    linked_student_id = Column(String, ForeignKey("students.student_id"), nullable=True)

    # Relationship to Student model
    student = relationship("Student", backref="user", uselist=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "institution_id": self.institution_id,
            "email": self.email,
            "role": self.role,
            "linked_student_id": self.linked_student_id
        }
