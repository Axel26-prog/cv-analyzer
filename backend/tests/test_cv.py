import pytest
import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

MOCK_ANALYSIS = {
    "score": 85,
    "summary": "Experienced developer with strong Python skills.",
    "strengths": ["Python", "FastAPI", "PostgreSQL", "Clean code"],
    "improvements": ["Add more projects", "Improve LinkedIn", "Add certifications"],
    "keywords_found": ["Python", "FastAPI", "PostgreSQL"],
    "keywords_missing": ["Docker", "AWS", "Kubernetes"],
    "ats_friendly": True,
    "sections": {
        "experience": True,
        "education": True,
        "skills": True,
        "contact": True
    },
    "seniority_level": "Mid",
    "years_experience": 5,
    "tech_stack": ["Python", "FastAPI", "PostgreSQL"],
    "employment_gaps": [],
    "score_breakdown": {
        "format_score": 85,
        "content_score": 85,
        "relevance_score": 80,
        "ats_score": 90
    },
    "recommendations": [
        {"priority": "high", "action": "Add Docker experience"},
        {"priority": "medium", "action": "Improve LinkedIn profile"}
    ]
}

def get_auth_token(client, db):
    from app.repositories import user_repo
    client.post("/api/v1/auth/register", json={
        "email": "cvuser@example.com",
        "password": "testpassword123"
    })
    user = user_repo.get_by_email(db, "cvuser@example.com")
    if user and not user.is_verified:
        user_repo.set_verified(db, user)
    res = client.post("/api/v1/auth/login", data={
        "username": "cvuser@example.com",
        "password": "testpassword123"
    })
    return res.json()["access_token"]


# --- Tests de extracción de texto ---

def test_extract_text_from_pdf():
    from app.services.cv_service import extract_text
    import io
    import pdfplumber

    # Crear un PDF mínimo en memoria
    with patch("pdfplumber.open") as mock_pdf:
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "John Doe\nSoftware Engineer"
        mock_pdf.return_value.__enter__.return_value.pages = [mock_page]

        result = extract_text(b"fake pdf bytes", "cv.pdf")
        assert "John Doe" in result
        assert "Software Engineer" in result


def test_extract_text_from_docx():
    from app.services.cv_service import extract_text

    with patch("docx.Document") as mock_doc:
        mock_para = MagicMock()
        mock_para.text = "Jane Doe - Developer"
        mock_doc.return_value.paragraphs = [mock_para]

        result = extract_text(b"fake docx bytes", "cv.docx")
        assert "Jane Doe" in result


def test_extract_text_unsupported_format():
    from app.services.cv_service import extract_text

    with pytest.raises(ValueError, match="Formato no soportado"):
        extract_text(b"fake bytes", "cv.txt")


# --- Tests del servicio de análisis ---

def test_analyze_cv_returns_expected_fields():
    from app.services.cv_service import analyze_cv

    with patch("app.services.cv_service.get_cached", return_value=None), \
         patch("app.services.cv_service.set_cached"), \
         patch("app.services.analyzer.orchestrator.call_openai") as mock_call:

        mock_call.return_value = json.dumps(MOCK_ANALYSIS)

        result = analyze_cv("John Doe Software Engineer Python FastAPI PostgreSQL Docker kubernetes cloud computing experience")
        assert result["score"] == 85
        assert "strengths" in result
        assert "improvements" in result
        assert "keywords_found" in result
        assert "ats_friendly" in result


def test_analyze_cv_uses_cache():
    from app.services.cv_service import analyze_cv

    with patch("app.services.cv_service.get_cached", return_value=MOCK_ANALYSIS) as mock_cache, \
         patch("app.services.analyzer.orchestrator.call_openai") as mock_call:

        result = analyze_cv("some cv text")
        assert result["score"] == 85
        mock_call.assert_not_called()


# --- Tests del endpoint /cv/analyze ---

def test_analyze_endpoint_requires_auth(client):
    dummy_pdf = b"%PDF-1.4 fake content"
    res = client.post(
        "/api/v1/cv/analyze",
        files={"file": ("cv.pdf", dummy_pdf, "application/pdf")},
        data={"job_description": ""}
    )
    assert res.status_code == 401


def test_analyze_endpoint_rejects_invalid_format(client, db):
    token = get_auth_token(client, db)
    res = client.post(
        "/api/v1/cv/analyze",
        files={"file": ("cv.txt", b"fake content", "text/plain")},
        data={"job_description": ""},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 400


def test_analyze_endpoint_success(client, db):
    token = get_auth_token(client, db)

    with patch("app.api.v1.cv.extract_text", return_value="John Doe Software Engineer"), \
         patch("app.api.v1.cv.analyze_cv", return_value=MOCK_ANALYSIS):

        dummy_pdf = b"%PDF-1.4 fake content"
        res = client.post(
            "/api/v1/cv/analyze",
            files={"file": ("cv.pdf", dummy_pdf, "application/pdf")},
            data={"job_description": "Python developer"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["result"]["score"] == 85
        assert data["filename"] == "cv.pdf"


# --- Tests del endpoint /cv/history ---

def test_history_requires_auth(client):
    res = client.get("/api/v1/cv/history")
    assert res.status_code == 401


def test_history_returns_list(client, db):
    token = get_auth_token(client, db)
    res = client.get(
        "/api/v1/cv/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert isinstance(res.json(), list)