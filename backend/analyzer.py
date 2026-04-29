from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_cv(cv_text: str, job_description: str = "") -> dict:
    prompt = f"""
    Analyze this CV and respond ONLY with a valid JSON object, no markdown, no explanation.
    Use this exact structure:
    {{
      "score": <number 0-100>,
      "summary": "<2-3 sentence professional summary of the candidate>",
      "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
      "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
      "keywords_found": ["<keyword 1>", "<keyword 2>"],
      "keywords_missing": ["<keyword 1>", "<keyword 2>"],
      "ats_friendly": <true or false>,
      "sections": {{
        "experience": <true or false>,
        "education": <true or false>,
        "skills": <true or false>,
        "contact": <true or false>
      }}
    }}

    CV Content:
    {cv_text[:3000]}

    {"Job Description: " + job_description if job_description else "No job description provided."}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert HR analyst and ATS specialist."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.3
    )

    return json.loads(response.choices[0].message.content)