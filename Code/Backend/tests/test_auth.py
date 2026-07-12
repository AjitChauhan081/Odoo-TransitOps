"""
test_auth.py — Tests for /auth endpoints
"""
import pytest


class TestHealthCheck:
    def test_root_returns_200(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        assert "TransitOps" in resp.json()["message"]

    def test_health_endpoint(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"


class TestRegister:
    def test_register_fleet_manager(self, client):
        resp = client.post("/auth/register", json={
            "email": "manager@test.com",
            "password": "password123",
            "role": "Fleet Manager",
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == "manager@test.com"
        assert data["role"] == "Fleet Manager"
        assert "id" in data

    def test_register_driver(self, client):
        resp = client.post("/auth/register", json={
            "email": "driver@test.com",
            "password": "password123",
            "role": "Driver",
        })
        assert resp.status_code == 201
        assert resp.json()["role"] == "Driver"

    def test_register_safety_officer(self, client):
        resp = client.post("/auth/register", json={
            "email": "safety@test.com",
            "password": "password123",
            "role": "Safety Officer",
        })
        assert resp.status_code == 201

    def test_register_financial_analyst(self, client):
        resp = client.post("/auth/register", json={
            "email": "finance@test.com",
            "password": "password123",
            "role": "Financial Analyst",
        })
        assert resp.status_code == 201

    def test_register_duplicate_email_fails(self, client):
        client.post("/auth/register", json={
            "email": "dup@test.com",
            "password": "password123",
            "role": "Driver",
        })
        resp = client.post("/auth/register", json={
            "email": "dup@test.com",
            "password": "otherpass",
            "role": "Fleet Manager",
        })
        assert resp.status_code == 400
        assert "already registered" in resp.json()["detail"]

    def test_register_invalid_role_fails(self, client):
        resp = client.post("/auth/register", json={
            "email": "bad@test.com",
            "password": "password123",
            "role": "Hacker",
        })
        assert resp.status_code == 422  # Pydantic validation error


class TestLogin:
    def test_login_success(self, client):
        client.post("/auth/register", json={
            "email": "user@test.com",
            "password": "password123",
            "role": "Driver",
        })
        resp = client.post("/auth/login", data={
            "username": "user@test.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["role"] == "Driver"

    def test_login_wrong_password_fails(self, client):
        client.post("/auth/register", json={
            "email": "user2@test.com",
            "password": "correct_password",
            "role": "Driver",
        })
        resp = client.post("/auth/login", data={
            "username": "user2@test.com",
            "password": "wrong_password",
        })
        assert resp.status_code == 401

    def test_login_unknown_email_fails(self, client):
        resp = client.post("/auth/login", data={
            "username": "nobody@test.com",
            "password": "password123",
        })
        assert resp.status_code == 401


class TestGetMe:
    def test_get_me_success(self, client, fleet_manager_token):
        resp = client.get("/auth/me", headers=fleet_manager_token)
        assert resp.status_code == 200
        assert resp.json()["email"] == "manager@transitops.com"

    def test_get_me_unauthenticated_fails(self, client):
        resp = client.get("/auth/me")
        assert resp.status_code == 401

    def test_get_me_invalid_token_fails(self, client):
        resp = client.get("/auth/me", headers={"Authorization": "Bearer fake.token.here"})
        assert resp.status_code == 401
