import json
from .models import CVAnalysis
from .exceptions import InvalidResponseError

__all__ = ["parse_and_validate", "parse_and_validate_dict"]

def parse_and_validate(content: str) -> CVAnalysis:
    if not content:
        raise InvalidResponseError("Empty response from OpenAI API")

    try:
        data = json.loads(content)
    except json.JSONDecodeError as e:
        raise InvalidResponseError(f"Invalid JSON response: {str(e)}")

    if "seniority_level" in data:
        seniority = data["seniority_level"].lower().replace("-", "").replace(" ", "")
        if seniority in ["entry", "entrylevel"]:
            data["seniority_level"] = "Entry"
        elif seniority in ["junior", "jr"]:
            data["seniority_level"] = "Junior"
        elif seniority in ["mid", "midlevel"]:
            data["seniority_level"] = "Mid"
        elif seniority in ["senior", "sr"]:
            data["seniority_level"] = "Senior"
        elif seniority in ["lead"]:
            data["seniority_level"] = "Lead"
        elif seniority in ["manager"]:
            data["seniority_level"] = "Manager"
        elif seniority in ["executive"]:
            data["seniority_level"] = "Executive"

    return CVAnalysis.model_validate(data)

def parse_and_validate_dict(content: str) -> dict:
    model = parse_and_validate(content)
    return model.model_dump()