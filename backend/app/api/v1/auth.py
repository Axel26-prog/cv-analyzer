from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from loguru import logger
import sentry_sdk
from app.schemas.user import UserCreate, UserOut, Token
from app.services.auth_service import register, login
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
def do_register(body: UserCreate, db: Session = Depends(get_db)):
    try:
        user = register(db, body.email, body.password)
        logger.info(f"New user registered: {user.email}")
        return user
    except Exception as e:
        logger.error(f"Registration error for {body.email}: {e}")
        sentry_sdk.capture_exception(e)
        raise

@router.post("/login", response_model=Token)
def do_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        token = login(db, form_data.username, form_data.password)
        logger.info(f"User logged in: {form_data.username}")
        return {"access_token": token}
    except Exception as e:
        logger.warning(f"Failed login attempt for: {form_data.username}")
        sentry_sdk.capture_exception(e)
        raise