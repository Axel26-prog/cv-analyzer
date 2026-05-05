from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

def load_template(name: str) -> str:
    path = PROMPTS_DIR / name
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def build_cv_analysis_prompt(cv_text: str, job_description: str) -> str:
    template = load_template("cv_analysis.txt")
    json_schema = load_template("json_schema.txt")
    evaluation_criteria = load_template("evaluation_criteria.txt")

    job_description_section = (
        f"Job Description: {job_description}\n\n"
        "If provided, analyze alignment between CV and job requirements, "
        "identify missing critical skills, and score relevance accordingly."
        if job_description else "No job description provided."
    )

    return template.format(
        json_schema=json_schema,
        evaluation_criteria=evaluation_criteria,
        cv_text=cv_text[:4000],
        job_description_section=job_description_section
    )