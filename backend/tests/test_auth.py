def test_register(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword123"
    })
    assert res.status_code == 200
    assert res.json()["email"] == "test@example.com"

def test_register_duplicate(client):
    client.post("/api/v1/auth/register", json={
        "email": "duplicate@example.com",
        "password": "testpassword123"
    })
    res = client.post("/api/v1/auth/register", json={
        "email": "duplicate@example.com",
        "password": "testpassword123"
    })
    assert res.status_code == 400

def test_login(client, db):
    from app.repositories import user_repo
    client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "password": "testpassword123"
    })
    user = user_repo.get_by_email(db, "login@example.com")
    user_repo.set_verified(db, user)
    res = client.post("/api/v1/auth/login", data={
        "username": "login@example.com",
        "password": "testpassword123"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()

def test_login_wrong_password(client):
    client.post("/api/v1/auth/register", json={
        "email": "wrong@example.com",
        "password": "testpassword123"
    })
    res = client.post("/api/v1/auth/login", data={
        "username": "wrong@example.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401


def test_login_unverified_blocked(client):
    client.post("/api/v1/auth/register", json={
        "email": "unverified@example.com",
        "password": "testpassword123"
    })
    res = client.post("/api/v1/auth/login", data={
        "username": "unverified@example.com",
        "password": "testpassword123"
    })
    assert res.status_code == 403


def test_verify_email(client, db):
    from app.repositories import user_repo
    client.post("/api/v1/auth/register", json={
        "email": "verify@example.com",
        "password": "testpassword123"
    })
    user = user_repo.get_by_email(db, "verify@example.com")
    token = user.verification_token
    res = client.get(f"/api/v1/auth/verify-email?token={token}")
    assert res.status_code == 200
    assert res.json()["detail"] == "Email verificado correctamente"
    res = client.post("/api/v1/auth/login", data={
        "username": "verify@example.com",
        "password": "testpassword123"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_verify_email_invalid_token(client):
    res = client.get("/api/v1/auth/verify-email?token=bogus-token")
    assert res.status_code == 400


def test_email_normalization_gmail(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "first.last+tag@gmail.com",
        "password": "testpassword123"
    })
    assert res.status_code == 200
    assert res.json()["email"] == "firstlast@gmail.com"
    res = client.post("/api/v1/auth/register", json={
        "email": "firstlast@gmail.com",
        "password": "testpassword123"
    })
    assert res.status_code == 400


def test_email_normalization_googlemail(client, db):
    from app.repositories import user_repo
    res = client.post("/api/v1/auth/register", json={
        "email": "name.last+test@googlemail.com",
        "password": "testpassword123"
    })
    assert res.status_code == 200
    assert res.json()["email"] == "namelast@googlemail.com"
    assert user_repo.get_by_email(db, "namelast@googlemail.com") is not None


def test_disposable_email_blocked(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "spammer@mailinator.com",
        "password": "testpassword123"
    })
    assert res.status_code == 400


def test_forgot_password_always_200(client):
    res = client.post("/api/v1/auth/forgot-password", json={
        "email": "does-not-exist@example.com"
    })
    assert res.status_code == 200
    client.post("/api/v1/auth/register", json={
        "email": "forgot@example.com",
        "password": "testpassword123"
    })
    res = client.post("/api/v1/auth/forgot-password", json={
        "email": "forgot@example.com"
    })
    assert res.status_code == 200


def test_reset_password(client, db):
    from app.core.security import create_password_reset_token
    from app.repositories import user_repo
    client.post("/api/v1/auth/register", json={
        "email": "reset@example.com",
        "password": "oldpassword123"
    })
    user = user_repo.get_by_email(db, "reset@example.com")
    user_repo.set_verified(db, user)
    token = create_password_reset_token(user.id)
    res = client.post("/api/v1/auth/reset-password", json={
        "token": token,
        "password": "newpassword123"
    })
    assert res.status_code == 200
    res = client.post("/api/v1/auth/login", data={
        "username": "reset@example.com",
        "password": "newpassword123"
    })
    assert res.status_code == 200
    res = client.post("/api/v1/auth/login", data={
        "username": "reset@example.com",
        "password": "oldpassword123"
    })
    assert res.status_code == 401


def test_reset_password_invalid_token(client):
    res = client.post("/api/v1/auth/reset-password", json={
        "token": "bogus-token",
        "password": "newpassword123"
    })
    assert res.status_code == 400


def test_register_rate_limited(client, db, monkeypatch):
    import uuid
    from app.core.limiter import limiter
    from app.core.config import settings

    monkeypatch.setattr(settings, "REGISTER_RATE_LIMIT", "3/day")
    client_ip = f"203.0.113.{uuid.uuid4().int % 250 + 1}"
    headers = {"X-Forwarded-For": client_ip}
    limiter.enabled = True
    try:
        for i in range(3):
            res = client.post("/api/v1/auth/register", json={
                "email": f"rateuser{i}@example.com",
                "password": "testpassword123"
            }, headers=headers)
            assert res.status_code == 200, res.text
        res = client.post("/api/v1/auth/register", json={
            "email": "rateuser3@example.com",
            "password": "testpassword123"
        }, headers=headers)
        assert res.status_code == 429
        assert "intentos" in res.json()["detail"].lower()
    finally:
        limiter.enabled = False