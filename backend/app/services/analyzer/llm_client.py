import os
import time
from openai import OpenAI
from dotenv import load_dotenv
from typing import Any, Generator

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class APIError(Exception):
    pass

class RateLimitError(APIError):
    pass

def stream_openai(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    temperature: float = 0.3,
    timeout: int = 60,
    max_retries: int = 3
) -> Generator[str, None, None]:
    for attempt in range(max_retries):
        try:
            stream = client.chat.completions.create(
                model=model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=temperature,
                timeout=timeout,
                stream=True
            )
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
            return
        except Exception as e:
            error_str = str(e).lower()
            if "rate_limit" in error_str or "429" in error_str:
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) * 2
                    time.sleep(wait_time)
                    continue
                raise RateLimitError(f"Rate limit exceeded after {max_retries} retries")
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) * 1
                time.sleep(wait_time)
                continue
            raise APIError(f"OpenAI API error after {max_retries} retries: {str(e)}")
    raise APIError("Unexpected error in retry loop")

def call_openai(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    temperature: float = 0.3,
    timeout: int = 30,
    max_retries: int = 3
) -> str:
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=temperature,
                timeout=timeout
            )
            return response.choices[0].message.content
        except Exception as e:
            error_str = str(e).lower()
            if "rate_limit" in error_str or "429" in error_str:
                if attempt < max_retries - 1:
                    wait_time = (2 ** attempt) * 2
                    time.sleep(wait_time)
                    continue
                raise RateLimitError(f"Rate limit exceeded after {max_retries} retries")
            if attempt < max_retries - 1:
                wait_time = (2 ** attempt) * 1
                time.sleep(wait_time)
                continue
            raise APIError(f"OpenAI API error after {max_retries} retries: {str(e)}")
    raise APIError("Unexpected error in retry loop")