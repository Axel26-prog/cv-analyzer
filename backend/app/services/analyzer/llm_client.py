import os
import time
from openai import OpenAI
from dotenv import load_dotenv
from typing import Any, Callable, Generator

load_dotenv()

use_azure = os.getenv("AZURE_OPENAI_ENDPOINT") and os.getenv("AZURE_OPENAI_API_KEY")

if use_azure:
    client = OpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        base_url=f"{os.getenv('AZURE_OPENAI_ENDPOINT').rstrip('/')}/openai/deployments/{os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME')}",
        default_query={"api-version": "2024-05-01-preview"},
        default_headers={"api-key": os.getenv("AZURE_OPENAI_API_KEY")}
    )
    default_model = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o-mini")
else:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    default_model = "gpt-4o-mini"

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
    model: str = None,
    temperature: float = 0.3,
    timeout: int = 60,
    max_retries: int = 3
) -> Generator[str, None, None]:
    model = model or default_model
    def _create_stream():
        if use_azure:
            return client.chat.completions.create(
                model=model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=temperature,
                timeout=timeout,
                stream=True
            )
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
    model: str = None,
    temperature: float = 0.3,
    timeout: int = 30,
    max_retries: int = 3
) -> str:
    model = model or default_model
    def _call():
        if use_azure:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=temperature,
                timeout=timeout
            )
        else:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=temperature,
                timeout=timeout
            )
        return response.choices[0].message.content

    return _with_retry(_call, max_retries, rate_limit_wait=2, general_wait=1)