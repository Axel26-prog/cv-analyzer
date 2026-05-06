from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from loguru import logger
import sentry_sdk
import json
from app.services.cv_service import extract_text, analyze_cv
from app.services.analyzer import analyze_stream as _analyze_stream, analyze_cv as _analyze_fallback
from app.services.analyzer.parser import parse_and_validate_dict
from app.services.analyzer.exceptions import InvalidResponseError
from app.services.cache_service import get_cached, set_cached
from app.repositories import cv_repo
from app.schemas.cv import CVAnalysisOut
from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.services import storage_service

router = APIRouter(prefix="/cv", tags=["cv"])

ALLOWED_EXTENSIONS = (".pdf", ".docx")
MAX_FILE_SIZE = 5 * 1024 * 1024

def validate_file(file: UploadFile):
    if not file.filename.endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(status_code=400, detail="Solo PDF o DOCX")

def check_file_size(file_bytes: bytes):
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Máximo 5MB")

def compute_ats_info(result: dict):
    sections = result.get("sections", {})
    count = sum(1 for v in sections.values() if v)
    if count == 4:
        result["ats_friendly"] = True
        result["ats_message"] = "All sections present"
    elif count >= 3:
        result["ats_friendly"] = True
        result["ats_message"] = f"{count}/4 sections detected"
    elif count >= 2:
        result["ats_friendly"] = False
        result["ats_message"] = f"Only {count}/4 sections detected"
    else:
        result["ats_friendly"] = False
        result["ats_message"] = "Minimal sections detected"

def _save_and_enrich(db: Session, user_id: int, filename: str, job_desc: str, result: dict, cv_text: str, file_bytes: bytes = None):
    compute_ats_info(result)
    set_cached(cv_text, job_desc, result)

    blob_url = None
    if file_bytes and storage_service.AZURE_STORAGE_CONNECTION_STRING:
        try:
            blob_url = storage_service.upload_cv_file(file_bytes, filename, user_id)
            if blob_url:
                result["storage_url"] = blob_url
        except Exception as e:
            logger.warning(f"Failed to upload to blob storage: {e}")

    return cv_repo.create(db, user_id, filename, job_desc, result, cv_text=cv_text)

@router.post("/analyze", response_model=CVAnalysisOut)
async def analyze(
    file: UploadFile = File(...),
    job_description: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"User {current_user.id} analyzing file: {file.filename}")

    validate_file(file)
    file_bytes = await file.read()
    check_file_size(file_bytes)

    try:
        text = extract_text(file_bytes, file.filename)
        result = analyze_cv(text, job_description)
    except Exception as e:
        logger.error(f"Error analyzing CV for user {current_user.id}: {e}")
        sentry_sdk.capture_exception(e)
        raise HTTPException(status_code=500, detail=str(e))

    saved = _save_and_enrich(db, current_user.id, file.filename, job_description, result, cv_text=text, file_bytes=file_bytes)
    logger.info(f"CV analysis saved for user {current_user.id}, score: {result.get('score')}")
    return saved

@router.post("/analyze/stream")
async def analyze_stream(
    file: UploadFile = File(...),
    job_description: str = Form(default=""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"User {current_user.id} streaming analysis for file: {file.filename}")

    validate_file(file)
    file_bytes = await file.read()
    check_file_size(file_bytes)

    try:
        text = extract_text(file_bytes, file.filename)
    except Exception as e:
        logger.error(f"Error extracting text for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    async def event_stream():
        cached = get_cached(text, job_description)
        if cached:
            yield f"data: {json.dumps(cached)}\n\n"
            yield "data: [DONE]\n\n"
            return

        chunks = []
        try:
            for chunk in _analyze_stream(text, job_description):
                chunks.append(chunk)
                yield f"data: {chunk}\n\n"

            full_response = "".join(chunks)
            try:
                result = parse_and_validate_dict(full_response)
            except Exception:
                result = _analyze_fallback(text, job_description)

            _save_and_enrich(db, current_user.id, file.filename, job_description, result, cv_text=text, file_bytes=file_bytes)
            yield f"data: {json.dumps(result)}\n\n"
        except Exception as e:
            logger.error(f"Stream error for user {current_user.id}: {e}")
            sentry_sdk.capture_exception(e)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        }
    )

@router.get("/history", response_model=list[CVAnalysisOut])
def history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    logger.info(f"User {current_user.id} fetching history")
    return cv_repo.get_by_user(db, current_user.id)