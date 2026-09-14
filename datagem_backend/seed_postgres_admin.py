from dotenv import load_dotenv
load_dotenv()

from database.database import SessionLocal
from database.models import User
from auth.security import get_password_hash

db = SessionLocal()
email = "aakshitmalik@gmail.com"

# Check if exists
user = db.query(User).filter(User.email == email).first()
if user:
    user.tier = "enterprise"
    db.commit()
    print("Admin updated.")
else:
    new_user = User(
        email=email,
        hashed_password=get_password_hash("akshitmalik1203"),
        full_name="Akshit Malik (Admin)",
        tier="enterprise"
    )
    db.add(new_user)
    db.commit()
    print("Admin created in Postgres.")
db.close()
