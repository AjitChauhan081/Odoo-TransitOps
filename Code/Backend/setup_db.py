import sys
from database import engine, Base
import models

def init_db():
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
