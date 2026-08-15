from datetime import date
from app.core.security import hash_password
from app.repositories import application_repo, user_repo


def get_auth_token(client, db, email="appuser@example.com"):
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "testpassword123"
    })
    user = user_repo.get_by_email(db, email)
    if user and not user.is_verified:
        user_repo.set_verified(db, user)
    res = client.post("/api/v1/auth/login", data={
        "username": email,
        "password": "testpassword123"
    })
    return res.json()["access_token"]


def _create_user(db, email):
    user = user_repo.create(db, email, hash_password("testpassword123"))
    user_repo.set_verified(db, user)
    return user


# --- Repository tests ---

def test_repo_create_and_get_by_id(db):
    user = _create_user(db, "repouser@example.com")
    app = application_repo.create(
        db, user_id=user.id,
        company_name="Google", position="SWE",
        applied_date=date(2026, 8, 14),
    )
    assert app.id is not None
    assert app.user_id == user.id
    fetched = application_repo.get_by_id(db, app.id, user.id)
    assert fetched is not None
    assert fetched.company_name == "Google"


def test_repo_get_all_by_user_scoped(db):
    user1 = _create_user(db, "scope1@example.com")
    user2 = _create_user(db, "scope2@example.com")
    application_repo.create(db, user_id=user1.id, company_name="A", position="P", applied_date=date(2026, 8, 14))
    application_repo.create(db, user_id=user1.id, company_name="B", position="P", applied_date=date(2026, 8, 14))
    application_repo.create(db, user_id=user2.id, company_name="C", position="P", applied_date=date(2026, 8, 14))

    user1_apps = application_repo.get_all_by_user(db, user1.id)
    user2_apps = application_repo.get_all_by_user(db, user2.id)
    assert len(user1_apps) == 2
    assert len(user2_apps) == 1
    assert all(a.user_id == user1.id for a in user1_apps)


def test_repo_get_all_by_user_status_filter(db):
    user = _create_user(db, "filteruser@example.com")
    application_repo.create(db, user_id=user.id, company_name="A", position="P", applied_date=date(2026, 8, 14), status="applied")
    application_repo.create(db, user_id=user.id, company_name="B", position="P", applied_date=date(2026, 8, 14), status="interview")
    application_repo.create(db, user_id=user.id, company_name="C", position="P", applied_date=date(2026, 8, 14), status="applied")

    all_apps = application_repo.get_all_by_user(db, user.id)
    filtered = application_repo.get_all_by_user(db, user.id, status="applied")
    assert len(all_apps) == 3
    assert len(filtered) == 2
    assert all(a.status == "applied" for a in filtered)


def test_repo_update(db):
    user = _create_user(db, "updateuser@example.com")
    app = application_repo.create(db, user_id=user.id, company_name="Co", position="P", applied_date=date(2026, 8, 14))
    updated = application_repo.update(db, app, status="offer", notes="Got it!")
    assert updated.status == "offer"
    assert updated.notes == "Got it!"
    assert updated.company_name == "Co"


def test_repo_delete(db):
    user = _create_user(db, "deleteuser@example.com")
    app = application_repo.create(db, user_id=user.id, company_name="Co", position="P", applied_date=date(2026, 8, 14))
    application_repo.delete(db, app)
    assert application_repo.get_by_id(db, app.id, user.id) is None


def test_repo_get_by_id_wrong_user_returns_none(db):
    user1 = _create_user(db, "owner_repo@example.com")
    user2 = _create_user(db, "intruder_repo@example.com")
    app = application_repo.create(db, user_id=user1.id, company_name="Co", position="P", applied_date=date(2026, 8, 14))
    assert application_repo.get_by_id(db, app.id, user2.id) is None


# --- API tests ---

def test_create_application(client, db):
    token = get_auth_token(client, db)
    res = client.post("/api/v1/applications", json={
        "company_name": "Google",
        "position": "Software Engineer",
        "applied_date": "2026-08-14",
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert data["company_name"] == "Google"
    assert data["position"] == "Software Engineer"
    assert data["status"] == "applied"
    assert data["id"] is not None
    assert data["applied_date"] == "2026-08-14"


def test_create_application_requires_auth(client):
    res = client.post("/api/v1/applications", json={
        "company_name": "Google",
        "position": "SWE",
        "applied_date": "2026-08-14",
    })
    assert res.status_code == 401


def test_create_application_default_status(client, db):
    token = get_auth_token(client, db)
    res = client.post("/api/v1/applications", json={
        "company_name": "Apple",
        "position": "Dev",
        "applied_date": "2026-08-14",
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    assert res.json()["status"] == "applied"


def test_create_application_default_applied_date(client, db):
    token = get_auth_token(client, db)
    res = client.post("/api/v1/applications", json={
        "company_name": "Apple",
        "position": "Dev",
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    assert res.json()["applied_date"] == date.today().isoformat()


def test_create_application_invalid_status(client, db):
    token = get_auth_token(client, db)
    res = client.post("/api/v1/applications", json={
        "company_name": "Google",
        "position": "SWE",
        "applied_date": "2026-08-14",
        "status": "invalid",
    }, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 422


def test_list_applications(client, db):
    token = get_auth_token(client, db, email="listapps@example.com")
    for name in ["Company A", "Company B"]:
        client.post("/api/v1/applications", json={
            "company_name": name, "position": "Dev", "applied_date": "2026-08-14",
        }, headers={"Authorization": f"Bearer {token}"})
    res = client.get("/api/v1/applications", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_list_applications_filter_by_status(client, db):
    token = get_auth_token(client, db, email="filterapps@example.com")
    client.post("/api/v1/applications", json={
        "company_name": "A", "position": "Dev", "applied_date": "2026-08-14",
    }, headers={"Authorization": f"Bearer {token}"})
    client.post("/api/v1/applications", json={
        "company_name": "B", "position": "Dev", "applied_date": "2026-08-14",
        "status": "interview",
    }, headers={"Authorization": f"Bearer {token}"})
    res = client.get(
        "/api/v1/applications?status=interview",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["company_name"] == "B"


def test_list_applications_requires_auth(client):
    res = client.get("/api/v1/applications")
    assert res.status_code == 401


def test_get_application_by_id(client, db):
    token = get_auth_token(client, db)
    created = client.post("/api/v1/applications", json={
        "company_name": "Google", "position": "SWE", "applied_date": "2026-08-14",
    }, headers={"Authorization": f"Bearer {token}"})
    app_id = created.json()["id"]
    res = client.get(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert res.json()["company_name"] == "Google"


def test_get_application_not_found(client, db):
    token = get_auth_token(client, db)
    res = client.get(
        "/api/v1/applications/9999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 404


def test_get_application_not_owned(client, db):
    token1 = get_auth_token(client, db, email="owner@example.com")
    created = client.post("/api/v1/applications", json={
        "company_name": "Google", "position": "SWE", "applied_date": "2026-08-14",
    }, headers={"Authorization": f"Bearer {token1}"})
    app_id = created.json()["id"]

    token2 = get_auth_token(client, db, email="intruder@example.com")
    res = client.get(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res.status_code == 404


def test_update_application(client, db):
    token = get_auth_token(client, db)
    created = client.post("/api/v1/applications", json={
        "company_name": "Google", "position": "SWE", "applied_date": "2026-08-14",
    }, headers={"Authorization": f"Bearer {token}"})
    app_id = created.json()["id"]
    res = client.patch(
        f"/api/v1/applications/{app_id}",
        json={"status": "interview", "notes": "Phone screen"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "interview"
    assert data["notes"] == "Phone screen"
    assert data["company_name"] == "Google"


def test_update_application_not_owned(client, db):
    token1 = get_auth_token(client, db, email="owner2@example.com")
    created = client.post("/api/v1/applications", json={
        "company_name": "Google", "position": "SWE", "applied_date": "2026-08-14",
    }, headers={"Authorization": f"Bearer {token1}"})
    app_id = created.json()["id"]

    token2 = get_auth_token(client, db, email="intruder2@example.com")
    res = client.patch(
        f"/api/v1/applications/{app_id}",
        json={"status": "offer"},
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res.status_code == 404


def test_delete_application(client, db):
    token = get_auth_token(client, db)
    created = client.post("/api/v1/applications", json={
        "company_name": "Google", "position": "SWE", "applied_date": "2026-08-14",
    }, headers={"Authorization": f"Bearer {token}"})
    app_id = created.json()["id"]
    res = client.delete(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 204
    res = client.get(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 404


def test_delete_application_not_owned(client, db):
    token1 = get_auth_token(client, db, email="owner3@example.com")
    created = client.post("/api/v1/applications", json={
        "company_name": "Google", "position": "SWE", "applied_date": "2026-08-14",
    }, headers={"Authorization": f"Bearer {token1}"})
    app_id = created.json()["id"]

    token2 = get_auth_token(client, db, email="intruder3@example.com")
    res = client.delete(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert res.status_code == 404