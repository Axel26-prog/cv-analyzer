from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "CV Analyzer API"
    OPENAI_API_KEY: str
    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"

settings = Settings()