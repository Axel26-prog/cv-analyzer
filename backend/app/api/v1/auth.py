from fastapi import APIRouter, Depends, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.services.auth_service import register, login
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
def do_register(body: UserCreate, db: Session = Depends(get_db)):
    return register(db, body.email, body.password)

@router.post("/login", response_model=Token)
def do_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    token = login(db, form_data.username, form_data.password)
    return {"access_token": token}