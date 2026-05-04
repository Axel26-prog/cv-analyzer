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

    return CVAnalysis.model_validate(data)

def parse_and_validate_dict(content: str) -> dict:
    model = parse_and_validate(content)
    return model.model_dump()