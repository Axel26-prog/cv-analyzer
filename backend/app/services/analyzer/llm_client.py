import os
import time
from openai import OpenAI
from dotenv import load_dotenv
from typing import Any, Callable, Generator

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class APIError(Exception):
    pass

class RateLimitError(APIError):
    pass

def _with_retry(fn: Callable, max_retries: int, rate_limit_wait: int, general_wait: int):
    for attempt in range(max_retries):
        try:
            return fn()
        except Exception as e:
            error_str = str(e).lower()
            is_rate_limit = "rate_limit" in error_str or "429" in error_str
            if attempt < max_retries - 1:
                wait = (2 ** attempt) * (rate_limit_wait if is_rate_limit else general_wait)
                time.sleep(wait)
                continue
            if is_rate_limit:
                raise RateLimitError(f"Rate limit exceeded after {max_retries} retries")
            raise APIError(f"OpenAI API error after {max_retries} retries: {str(e)}")
    raise APIError("Unexpected error in retry loop")

def stream_openai(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    temperature: float = 0.3,
    timeout: int = 60,
    max_retries: int = 3
) -> Generator[str, None, None]:
    def _create_stream():
        return client.chat.completions.create(
            model=model,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=temperature,
            timeout=timeout,
            stream=True
        )

    stream = _with_retry(_create_stream, max_retries, rate_limit_wait=2, general_wait=1)
    for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content

def call_openai(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    temperature: float = 0.3,
    timeout: int = 30,
    max_retries: int = 3
) -> str:
    def _call():
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=temperature,
            timeout=timeout
        )
        return response.choices[0].message.content

    return _with_retry(_call, max_retries, rate_limit_wait=2, general_wait=1)