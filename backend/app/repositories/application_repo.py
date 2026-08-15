from sqlalchemy.orm import Session
from app.models.application import Application


def create(db: Session, user_id: int, **kwargs) -> Application:
    application = Application(user_id=user_id, **kwargs)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_by_id(db: Session, application_id: int, user_id: int) -> Application | None:
    return db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == user_id,
    ).first()


def get_all_by_user(db: Session, user_id: int, status: str | None = None) -> list[Application]:
    q = db.query(Application).filter(Application.user_id == user_id)
    if status:
        q = q.filter(Application.status == status)
    return q.order_by(Application.created_at.desc()).all()


def update(db: Session, application: Application, **kwargs) -> Application:
    for key, value in kwargs.items():
        setattr(application, key, value)
    db.commit()
    db.refresh(application)
    return application


def delete(db: Session, application: Application) -> None:
    db.delete(application)
    db.commit()