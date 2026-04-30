from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.services.auth_service import register, login
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
def do_register(body: UserCreate, db: Session = Depends(get_db)):
    return register(db, body.email, body.password)

@router.post("/login", response_model=Token)
def do_login(body: UserLogin, db: Session = Depends(get_db)):
    token = login(db, body.email, body.password)
    return {"access_token": token}