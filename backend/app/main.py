from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk
from loguru import logger
from app.core.config import settings
from app.api.v1.router import router
from app.db.base import Base, engine

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        send_default_pii=False,
    )
    logger.info("Sentry initialized")

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cv-analyzer-mocha.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
def health():
    logger.info("Health check called")
    return {"status": "ok"}