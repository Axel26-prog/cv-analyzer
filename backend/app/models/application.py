from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, func
from app.db.base import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company_name = Column(String, nullable=False)
    position = Column(String, nullable=False)
    job_url = Column(String, nullable=True)
    status = Column(String, nullable=False, default="applied", server_default="applied")
    applied_date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    cv_analysis_id = Column(Integer, ForeignKey("cv_analyses.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())