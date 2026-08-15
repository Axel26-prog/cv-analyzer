from sqlalchemy.orm import Session
from app.models.user import User

def get_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()

def get_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()

def get_by_verification_token(db: Session, token: str) -> User | None:
    return db.query(User).filter(User.verification_token == token).first()

def create(
    db: Session,
    email: str,
    hashed_password: str,
    verification_token: str | None = None,
) -> User:
    user = User(
        email=email,
        hashed_password=hashed_password,
        is_verified=False,
        verification_token=verification_token,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def set_verified(db: Session, user: User) -> None:
    user.is_verified = True
    user.verification_token = None
    db.commit()

def update_password(db: Session, user: User, hashed_password: str) -> None:
    user.hashed_password = hashed_password
    db.commit()