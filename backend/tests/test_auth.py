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

def test_login(client):
    client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "password": "testpassword123"
    })
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