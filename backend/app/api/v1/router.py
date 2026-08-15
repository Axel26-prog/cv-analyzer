from fastapi import APIRouter
from app.api.v1 import auth, cv, applications

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(cv.router)
router.include_router(applications.router)