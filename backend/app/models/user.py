from sqlalchemy import Column, Integer, String, DateTime, Boolean, func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_verified = Column(Boolean, nullable=False, default=False, server_default="false")
    verification_token = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, server_default=func.now())