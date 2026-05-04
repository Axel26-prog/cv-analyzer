from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, func
from app.db.base import Base

class CVAnalysis(Base):
    __tablename__ = "cv_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    cv_text = Column(Text, nullable=True, default=None)
    job_description = Column(Text, default="")
    result = Column(JSON, nullable=False)
    created_at = Column(DateTime, server_default=func.now())