from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from loguru import logger
from typing import Literal
import sentry_sdk
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.repositories import application_repo
from app.db.session import get_db
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationResponse, status_code=201)
def do_create(
    body: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        application = application_repo.create(db, user_id=current_user.id, **body.model_dump())
        logger.info(f"Application created for user {current_user.id}: {application.company_name}")
        return application
    except Exception as e:
        logger.error(f"Create application error for user {current_user.id}: {e}")
        sentry_sdk.capture_exception(e)
        raise


@router.get("", response_model=list[ApplicationResponse])
def do_list(
    status: Literal["applied", "interview", "rejected", "offer"] | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return application_repo.get_all_by_user(db, user_id=current_user.id, status=status)
    except Exception as e:
        logger.error(f"List applications error for user {current_user.id}: {e}")
        sentry_sdk.capture_exception(e)
        raise


@router.get("/{application_id}", response_model=ApplicationResponse)
def do_get(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        application = application_repo.get_by_id(db, application_id, current_user.id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        return application
    except Exception as e:
        logger.error(f"Get application error for user {current_user.id}: {e}")
        sentry_sdk.capture_exception(e)
        raise


@router.patch("/{application_id}", response_model=ApplicationResponse)
def do_update(
    application_id: int,
    body: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        application = application_repo.get_by_id(db, application_id, current_user.id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        return application_repo.update(db, application, **body.model_dump(exclude_unset=True))
    except Exception as e:
        logger.error(f"Update application error for user {current_user.id}: {e}")
        sentry_sdk.capture_exception(e)
        raise


@router.delete("/{application_id}", status_code=204)
def do_delete(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        application = application_repo.get_by_id(db, application_id, current_user.id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        application_repo.delete(db, application)
        logger.info(f"Application {application_id} deleted by user {current_user.id}")
    except Exception as e:
        logger.error(f"Delete application error for user {current_user.id}: {e}")
        sentry_sdk.capture_exception(e)
        raise