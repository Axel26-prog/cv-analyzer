import json
from .models import CVAnalysis
from .exceptions import InvalidResponseError

__all__ = ["parse_and_validate", "parse_and_validate_dict"]

SENIORITY_MAP = {
    "entry": "Entry", "entrylevel": "Entry",
    "junior": "Junior", "jr": "Junior",
    "mid": "Mid", "midlevel": "Mid",
    "senior": "Senior", "sr": "Senior",
    "lead": "Lead",
    "manager": "Manager",
    "executive": "Executive",
}

def _normalize_seniority(data: dict):
    if "seniority_level" not in data:
        return
    key = data["seniority_level"].lower().replace("-", "").replace(" ", "")
    if key in SENIORITY_MAP:
        data["seniority_level"] = SENIORITY_MAP[key]

def parse_and_validate(content: str) -> CVAnalysis:
    if not content:
        raise InvalidResponseError("Empty response from OpenAI API")

    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        raise InvalidResponseError(f"Invalid JSON response: {str(e)}")

    _normalize_seniority(data)
    return CVAnalysis.model_validate(data)

def parse_and_validate_dict(content: str) -> dict:
    model = parse_and_validate(content)
    return model.model_dump()