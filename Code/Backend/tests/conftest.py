"""
conftest.py — Shared fixtures for all tests
============================================
Uses an in-memory SQLite database so tests NEVER touch your real
TransitOps PostgreSQL database. Every test function gets a fresh,
clean database via the `client` fixture.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app

# ─── In-memory SQLite engine (isolated, fast, no Postgres needed) ─────────────
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test, drop after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Return a TestClient with the DB override applied."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ─── Reusable helper fixtures ─────────────────────────────────────────────────

@pytest.fixture
def fleet_manager_token(client):
    """Register + login as a Fleet Manager, return auth headers."""
    client.post("/auth/register", json={
        "email": "manager@transitops.com",
        "password": "password123",
        "role": "Fleet Manager",
    })
    resp = client.post("/auth/login", data={
        "username": "manager@transitops.com",
        "password": "password123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def driver_token(client):
    """Register + login as a Driver, return auth headers."""
    client.post("/auth/register", json={
        "email": "driver@transitops.com",
        "password": "password123",
        "role": "Driver",
    })
    resp = client.post("/auth/login", data={
        "username": "driver@transitops.com",
        "password": "password123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def safety_officer_token(client):
    """Register + login as a Safety Officer, return auth headers."""
    client.post("/auth/register", json={
        "email": "safety@transitops.com",
        "password": "password123",
        "role": "Safety Officer",
    })
    resp = client.post("/auth/login", data={
        "username": "safety@transitops.com",
        "password": "password123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def financial_analyst_token(client):
    """Register + login as a Financial Analyst, return auth headers."""
    client.post("/auth/register", json={
        "email": "finance@transitops.com",
        "password": "password123",
        "role": "Financial Analyst",
    })
    resp = client.post("/auth/login", data={
        "username": "finance@transitops.com",
        "password": "password123",
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_vehicle(client, fleet_manager_token):
    """Create and return a sample vehicle."""
    resp = client.post("/vehicles/", json={
        "registration_number": "MH-01-AB-1234",
        "name_model": "Tata Prima 4028.S",
        "vehicle_type": "Heavy Truck",
        "max_load_capacity": 25000.0,
        "odometer": 15000.0,
        "acquisition_cost": 3500000.0,
        "status": "Available",
    }, headers=fleet_manager_token)
    return resp.json()


@pytest.fixture
def sample_driver(client, fleet_manager_token):
    """Create and return a sample driver."""
    resp = client.post("/drivers/", json={
        "name": "Ramesh Kumar",
        "license_number": "DL-1420110012345",
        "license_category": "HMV",
        "license_expiry_date": "2027-12-31",
        "contact_number": "9876543210",
        "safety_score": 95.0,
        "status": "Available",
    }, headers=fleet_manager_token)
    return resp.json()


@pytest.fixture
def sample_trip(client, fleet_manager_token, sample_vehicle, sample_driver):
    """Create and return a sample draft trip."""
    resp = client.post("/trips/", json={
        "source": "Mumbai",
        "destination": "Pune",
        "vehicle_id": sample_vehicle["id"],
        "driver_id": sample_driver["id"],
        "cargo_weight": 10000.0,
        "planned_distance": 150.0,
    }, headers=fleet_manager_token)
    return resp.json()
