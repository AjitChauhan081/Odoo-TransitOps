"""
TransitOps - One-Click Startup Script
======================================
Run this script to:
  1. Create the 'TransitOps' PostgreSQL database (if it doesn't exist)
  2. Create all tables inside it
  3. Start the FastAPI server on http://localhost:8000

Usage:
    uv run python start.py
"""

import sys
import os
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

# ─── Database Configuration ───────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5433/TransitOps")

# Parse the database URL to get individual components for psycopg2
parsed_url = urlparse(DATABASE_URL)
DB_USER = parsed_url.username
DB_PASSWORD = parsed_url.password
DB_HOST = parsed_url.hostname
DB_PORT = parsed_url.port or 5432
DB_NAME = parsed_url.path.lstrip('/')


def print_banner():
    print("""
+----------------------------------------------+
|       TransitOps  -  Startup Script          |
|    Smart Transport Operations Platform       |
+----------------------------------------------+
""")


def step(n, msg):
    print(f"\n[Step {n}] {msg}")
    print("-" * 50)


def create_database():
    step(1, f"Creating database: {DB_NAME}")
    try:
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database="postgres",
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()

        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
        exists = cur.fetchone()

        if not exists:
            cur.execute(f'CREATE DATABASE "{DB_NAME}"')
            print(f"  [OK] Database '{DB_NAME}' created.")
        else:
            print(f"  [SKIP] Database '{DB_NAME}' already exists.")

        cur.close()
        conn.close()

    except psycopg2.OperationalError as e:
        print(f"\n  [ERROR] Could not connect to PostgreSQL:")
        print(f"  {e}")
        print(f"\n  Make sure PostgreSQL is running on {DB_HOST}:{DB_PORT}")
        print(f"  with user '{DB_USER}' and the correct password.\n")
        sys.exit(1)


def create_tables():
    step(2, "Creating tables in TransitOps")
    try:
        os.environ["DATABASE_URL"] = DATABASE_URL

        from sqlalchemy import create_engine
        from database import Base
        import models  # registers all ORM models

        engine = create_engine(DATABASE_URL)
        Base.metadata.create_all(bind=engine)

        # List created tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"  [OK] {len(tables)} tables ready:")
        for t in tables:
            print(f"       - {t}")

    except Exception as e:
        print(f"\n  [ERROR] Failed to create tables:\n  {e}\n")
        sys.exit(1)


def seed_demo_data():
    step(3, "Seeding demo data")
    try:
        from sqlalchemy.orm import sessionmaker
        from sqlalchemy import create_engine
        import models
        from routers.auth import get_password_hash
        from datetime import datetime, timedelta

        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()

        if db.query(models.User).first() and db.query(models.Vehicle).first():
            print("  [SKIP] Database already contains data.")
            db.close()
            return

        print("  [INFO] Populating database with initial demo data...")

        # 0. Users
        if not db.query(models.User).first():
            hashed = get_password_hash("password123")
            u1 = models.User(email="fleet@transitops.com", hashed_password=hashed, role="Fleet Manager")
            u2 = models.User(email="driver@transitops.com", hashed_password=hashed, role="Driver")
            u3 = models.User(email="safety@transitops.com", hashed_password=hashed, role="Safety Officer")
            u4 = models.User(email="finance@transitops.com", hashed_password=hashed, role="Financial Analyst")
            db.add_all([u1, u2, u3, u4])
            db.commit()

        # 1. Vehicles
        v1 = models.Vehicle(registration_number="MH-01-AB-1234", name_model="Tata Ace", vehicle_type="Van", max_load_capacity=750.0, odometer=12500.5, acquisition_cost=450000.0, status="Available")
        v2 = models.Vehicle(registration_number="GJ-18-CX-9009", name_model="Ashok Leyland", vehicle_type="Van", max_load_capacity=1250.0, odometer=8500.0, acquisition_cost=650000.0, status="In Shop")
        v3 = models.Vehicle(registration_number="DL-04-TT-5566", name_model="Mahindra Bolero", vehicle_type="Truck", max_load_capacity=1500.0, odometer=24000.0, acquisition_cost=800000.0, status="Available")
        db.add_all([v1, v2, v3])
        db.commit()

        # 2. Drivers
        d1 = models.Driver(name="Ramesh Kumar", license_number="DL-123456789", license_category="Commercial", license_expiry_date=datetime.now() + timedelta(days=365), contact_number="9876543210", safety_score=92.5, status="Available")
        d2 = models.Driver(name="Suresh Patel", license_number="GJ-987654321", license_category="Commercial", license_expiry_date=datetime.now() + timedelta(days=180), contact_number="9988776655", safety_score=85.0, status="On Trip")
        db.add_all([d1, d2])
        db.commit()

        # 3. Trips
        t1 = models.Trip(source="Ahmedabad Depot", destination="Surat Hub", vehicle_id=v3.id, driver_id=d2.id, cargo_weight=1200.0, planned_distance=280.0, status="Dispatched")
        db.add(t1)
        db.commit()

        # 4. Fuel & Maintenance
        db.add(models.FuelLog(vehicle_id=v1.id, liters=25.5, cost=2400.0, date=datetime.now() - timedelta(days=2)))
        db.add(models.MaintenanceLog(vehicle_id=v2.id, description="Brake Pad Replacement", date=datetime.now() - timedelta(days=1), cost=4500.0, status="Active"))
        db.commit()

        print("  [OK] Demo data inserted successfully.")
        db.close()
    except Exception as e:
        print(f"\n  [ERROR] Failed to insert demo data:\n  {e}\n")


def start_server():
    step(4, "Starting FastAPI server")
    print(f"  Server  : http://localhost:8000")
    print(f"  Docs    : http://localhost:8000/docs")
    print(f"  ReDoc   : http://localhost:8000/redoc")
    print(f"\n  Press CTRL+C to stop the server.\n")
    print("-" * 50)

    os.environ["DATABASE_URL"] = DATABASE_URL

    try:
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except KeyboardInterrupt:
        print("\n\n  [STOPPED] Server shut down gracefully.\n")


if __name__ == "__main__":
    print_banner()
    create_database()
    create_tables()
    seed_demo_data()
    start_server()
