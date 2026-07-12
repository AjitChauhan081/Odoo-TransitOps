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


def start_server():
    step(3, "Starting FastAPI server")
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
    start_server()
