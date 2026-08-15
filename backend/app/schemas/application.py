from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Literal


class ApplicationCreate(BaseModel):
    company_name: str
    position: str
    job_url: str | None = None
    status: Literal["applied", "interview", "rejected", "offer"] = "applied"
    applied_date: date = Field(default_factory=date.today)
    notes: str | None = None
    cv_analysis_id: int | None = None


class ApplicationUpdate(BaseModel):
    company_name: str | None = None
    position: str | None = None
    job_url: str | None = None
    status: Literal["applied", "interview", "rejected", "offer"] | None = None
    applied_date: date | None = None
    notes: str | None = None
    cv_analysis_id: int | None = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    position: str
    job_url: str | None
    status: str
    applied_date: date
    notes: str | None
    cv_analysis_id: int | None
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True