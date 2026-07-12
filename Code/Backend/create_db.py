"""
Script to:
1. Connect to the default 'postgres' database
2. Create the 'TransitOps' database if it doesn't exist
3. Create all tables in 'TransitOps'
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

HOST = "localhost"
PORT = 5433
USER = "postgres"
PASSWORD = "1234"
DB_NAME = "TransitOps"

def create_database():
    # Connect to default postgres DB to issue CREATE DATABASE
    conn = psycopg2.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        database="postgres"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    # Check if the database already exists
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
    exists = cur.fetchone()

    if not exists:
        cur.execute(f'CREATE DATABASE "{DB_NAME}"')
        print(f'[OK] Database "{DB_NAME}" created successfully.')
    else:
        print(f'[INFO] Database "{DB_NAME}" already exists. Skipping creation.')

    cur.close()
    conn.close()

def create_tables():
    # Now connect to TransitOps and create all tables via SQLAlchemy
    import os
    os.environ["DATABASE_URL"] = f"postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB_NAME}"

    # Import models AFTER setting env var so database.py picks it up
    from sqlalchemy import create_engine
    from database import Base
    import models  # ensures all model classes are registered

    engine = create_engine(os.environ["DATABASE_URL"])
    Base.metadata.create_all(bind=engine)
    print(f'[OK] All tables created in "{DB_NAME}".')

if __name__ == "__main__":
    print(f"\n[*] Setting up database: {DB_NAME}")
    create_database()
    create_tables()
    print("\n[DONE] TransitOps database is ready.\n")
