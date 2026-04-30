from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.cv_service import extract_text, analyze_cv
from app.repositories import cv_repo
from app.schemas.cv import CVAnalysisOut
from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/cv", tags=["cv"])

@router.post("/analyze", response_model=CVAnalysisOut)
async def analyze(
    file: UploadFile = File(...),
    job_description: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Solo PDF o DOCX")
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Máximo 5MB")
    try:
        text = extract_text(file_bytes, file.filename)
        result = analyze_cv(text, job_description)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    saved = cv_repo.create(db, current_user.id, file.filename, text, job_description, result)
    return saved

@router.get("/history", response_model=list[CVAnalysisOut])
def history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return cv_repo.get_by_user(db, current_user.id)