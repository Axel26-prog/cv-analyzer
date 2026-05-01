from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories import user_repo
from app.core.security import hash_password, verify_password, create_access_token

def register(db: Session, email: str, password: str):
    if user_repo.get_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email ya registrado")
    return user_repo.create(db, email, hash_password(password))

def login(db: Session, email: str, password: str) -> str:
    user = user_repo.get_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return create_access_token({"sub": str(user.id)})