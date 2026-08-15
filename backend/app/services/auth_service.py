import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException
from jose import JWTError
from loguru import logger
from app.repositories import user_repo
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_password_reset_token,
    decode_token,
)
from app.services.disposable_domains import is_disposable_email
from app.services.email_service import send_verification_email, send_password_reset_email


def normalize_email(email: str) -> str:
    email = email.strip().lower()
    local, _, domain = email.partition("@")
    if domain in ("gmail.com", "googlemail.com"):
        local = local.split("+", 1)[0].replace(".", "")
    return f"{local}@{domain}"


def register(db: Session, email: str, password: str):
    normalized = normalize_email(email)
    if is_disposable_email(normalized):
        raise HTTPException(status_code=400, detail="No se permiten correos temporales o desechables")
    if user_repo.get_by_email(db, normalized):
        raise HTTPException(status_code=400, detail="Email ya registrado")
    token = str(uuid.uuid4())
    user = user_repo.create(db, normalized, hash_password(password), verification_token=token)
    try:
        send_verification_email(user.email, token)
    except Exception as e:
        logger.warning(f"Failed to send verification email to {user.email}: {e}")
    return user


def login(db: Session, email: str, password: str) -> str:
    user = user_repo.get_by_email(db, normalize_email(email))
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Verifica tu email antes de iniciar sesión")
    return create_access_token({"sub": str(user.id)})


def verify_email(db: Session, token: str) -> None:
    user = user_repo.get_by_verification_token(db, token)
    if not user:
        raise HTTPException(status_code=400, detail="Token de verificación inválido")
    user_repo.set_verified(db, user)


def request_password_reset(db: Session, email: str) -> None:
    user = user_repo.get_by_email(db, normalize_email(email))
    if not user:
        return
    token = create_password_reset_token(user.id)
    try:
        send_password_reset_email(user.email, token)
    except Exception as e:
        logger.warning(f"Failed to send password reset email to {user.email}: {e}")


def reset_password(db: Session, token: str, new_password: str) -> None:
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    if payload.get("type") != "reset":
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    user = user_repo.get_by_id(db, int(user_id))
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    user_repo.update_password(db, user, hash_password(new_password))