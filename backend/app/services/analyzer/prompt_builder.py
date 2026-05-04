import os
from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

def load_template(name: str) -> str:
    path = PROMPTS_DIR / name
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def build_cv_analysis_prompt(cv_text: str, job_description: str) -> str:
    template = load_template("cv_analysis.txt")

    json_schema = """{
  "score": <number 0-100>,
  "summary": "<2-3 sentence professional summary of the candidate>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>", "<improvement 4>"],
  "keywords_found": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "keywords_missing": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
  "ats_friendly": <true or false>,
  "sections": {
    "experience": <true or false>,
    "education": <true or false>,
    "skills": <true or false>,
    "contact": <true or false>
  },
  "seniority_level": "<Junior | Mid | Senior | Lead | Executive>",
  "years_experience": <estimated years based on CV>,
  "tech_stack": ["<technology 1>", "<technology 2>", "<technology 3>"],
  "employment_gaps": ["<gap 1 with dates if detectable>", "<gap 2 if detectable>"],
  "score_breakdown": {
    "format_score": <0-100>,
    "content_score": <0-100>,
    "relevance_score": <0-100>,
    "ats_score": <0-100>
  },
  "recommendations": [
    {"priority": "high", "action": "<specific action to take>"},
    {"priority": "medium", "action": "<specific action to take>"},
    {"priority": "low", "action": "<specific action to take>"}
  ]
}"""

    evaluation_criteria = """- Structure and formatting (20% of total score)
- Content quality and completeness (30% of total score)
- Relevance to job description if provided (30% of total score)
- ATS friendliness and keyword optimization (20% of total score)"""

    if job_description:
        job_description_section = f"Job Description: {job_description}\n\nIf provided, analyze alignment between CV and job requirements, identify missing critical skills, and score relevance accordingly."
    else:
        job_description_section = "No job description provided."

    return template.format(
        json_schema=json_schema,
        evaluation_criteria=evaluation_criteria,
        cv_text=cv_text[:4000],
        job_description_section=job_description_section
    )