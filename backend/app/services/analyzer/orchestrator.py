from .exceptions import EmptyCVError, InvalidResponseError
from .prompt_builder import build_cv_analysis_prompt, load_template
from .llm_client import call_openai, stream_openai
from .parser import parse_and_validate_dict

def _build_messages(cv_text: str, job_description: str):
    if not cv_text or not cv_text.strip():
        raise EmptyCVError("CV text cannot be empty")
    if len(cv_text.strip()) < 50:
        raise EmptyCVError("CV text is too short (minimum 50 characters)")
    system_message = load_template("system_instructions.txt")
    user_prompt = build_cv_analysis_prompt(cv_text, job_description)
    return [
        {"role": "system", "content": system_message},
        {"role": "user", "content": user_prompt}
    ]

def analyze(cv_text: str, job_description: str = "") -> dict:
    messages = _build_messages(cv_text, job_description)
    content = call_openai(messages)
    return parse_and_validate_dict(content)

def analyze_stream(cv_text: str, job_description: str = ""):
    messages = _build_messages(cv_text, job_description)
    for chunk in stream_openai(messages):
        yield chunk