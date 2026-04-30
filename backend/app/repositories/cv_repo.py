from sqlalchemy.orm import Session
from app.models.cv import CVAnalysis

def create(db: Session, user_id: int, filename: str, cv_text: str, job_description: str, result: dict) -> CVAnalysis:
    analysis = CVAnalysis(
        user_id=user_id,
        filename=filename,
        cv_text=cv_text,
        job_description=job_description,
        result=result
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis

def get_by_user(db: Session, user_id: int) -> list[CVAnalysis]:
    return db.query(CVAnalysis).filter(CVAnalysis.user_id == user_id).order_by(CVAnalysis.created_at.desc()).all()