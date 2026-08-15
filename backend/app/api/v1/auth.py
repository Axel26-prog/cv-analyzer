from fastapi import APIRouter, Depends, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from loguru import logger
import sentry_sdk
from app.schemas.user import (
    UserCreate,
    UserOut,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageOut,
)
from app.services.auth_service import (
    register,
    login,
    verify_email,
    request_password_reset,
    reset_password,
)
from app.core.limiter import limiter
from app.core.config import settings
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
@limiter.limit(lambda: settings.REGISTER_RATE_LIMIT)
def do_register(request: Request, body: UserCreate, db: Session = Depends(get_db)):
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

@router.get("/verify-email", response_model=MessageOut)
def do_verify_email(token: str, db: Session = Depends(get_db)):
    try:
        verify_email(db, token)
        logger.info("Email verified")
        return {"detail": "Email verificado correctamente"}
    except Exception as e:
        logger.warning(f"Email verification failed: {e}")
        sentry_sdk.capture_exception(e)
        raise

@router.post("/forgot-password", response_model=MessageOut)
def do_forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    try:
        request_password_reset(db, body.email)
        logger.info(f"Password reset requested for: {body.email}")
        return {"detail": "Si el email existe, recibirás un correo con instrucciones"}
    except Exception as e:
        logger.error(f"Forgot password error for {body.email}: {e}")
        sentry_sdk.capture_exception(e)
        raise

@router.post("/reset-password", response_model=MessageOut)
def do_reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        reset_password(db, body.token, body.password)
        logger.info("Password reset completed")
        return {"detail": "Contraseña actualizada correctamente"}
    except Exception as e:
        logger.warning("Password reset failed")
        sentry_sdk.capture_exception(e)
        raise