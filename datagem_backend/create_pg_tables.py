from database.database import engine, Base
from database import models
from auth import models as auth_models

print("Creating tables in Postgres...")
try:
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    print(f"Error creating tables: {e}")
