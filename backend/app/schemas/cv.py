from pydantic import BaseModel
from datetime import datetime

class CVAnalysisOut(BaseModel):
    id: int
    filename: str
    job_description: str
    result: dict
    created_at: datetime

    class Config:
        from_attributes = True