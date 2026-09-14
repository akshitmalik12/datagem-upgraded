import os
import re

with open(".env", "r") as f:
    env_content = f.read()

# Uncomment DATABASE_URL
env_content = re.sub(r'#\s*DATABASE_URL=', 'DATABASE_URL=', env_content)

with open(".env", "w") as f:
    f.write(env_content)

# Update database.py to support postgres
with open("database/database.py", "r") as f:
    db_content = f.read()

find_str = """# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./datagem.db")
SQLALCHEMY_DATABASE_URL = "sqlite:///./datagem.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)"""

replace_str = """SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./datagem.db")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL doesn't need check_same_thread
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)"""

db_content = db_content.replace(find_str, replace_str)
with open("database/database.py", "w") as f:
    f.write(db_content)

