from pydantic import BaseModel, Field
from typing import Literal

class Recommendation(BaseModel):
    priority: Literal["high", "medium", "low"]
    action: str

class ScoreBreakdown(BaseModel):
    format_score: float = Field(ge=0, le=100)
    content_score: float = Field(ge=0, le=100)
    relevance_score: float = Field(ge=0, le=100)
    ats_score: float = Field(ge=0, le=100)

class CVSections(BaseModel):
    experience: bool
    education: bool
    skills: bool
    contact: bool

class CVAnalysis(BaseModel):
    score: float = Field(ge=0, le=100)
    summary: str
    strengths: list[str]
    improvements: list[str]
    keywords_found: list[str]
    keywords_missing: list[str]
    ats_friendly: bool
    sections: CVSections
    seniority_level: Literal["Entry", "Junior", "Mid", "Senior", "Lead", "Manager", "Executive"]
    years_experience: float
    tech_stack: list[str]
    employment_gaps: list[str]
    score_breakdown: ScoreBreakdown
    recommendations: list[Recommendation]

    class Config:
        extra="forbid"