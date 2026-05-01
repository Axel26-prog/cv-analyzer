import redis
import hashlib
import json
from app.core.config import settings

r = redis.from_url(settings.REDIS_URL, decode_responses=True)
CACHE_TTL = 60 * 60 * 24  # 24 horas

def _make_key(cv_text: str, job_description: str) -> str:
    raw = f"{cv_text[:3000]}|{job_description}"
    return "cv:" + hashlib.sha256(raw.encode()).hexdigest()

def get_cached(cv_text: str, job_description: str) -> dict | None:
    key = _make_key(cv_text, job_description)
    data = r.get(key)
    return json.loads(data) if data else None

def set_cached(cv_text: str, job_description: str, result: dict):
    key = _make_key(cv_text, job_description)
    r.setex(key, CACHE_TTL, json.dumps(result))