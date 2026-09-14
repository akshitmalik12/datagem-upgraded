import requests
import json
import sqlite3

def create_admin_user():
    url = "http://127.0.0.1:8000/auth/signup"
    
    user_data = {
        "email": "aakshitmalik@gmail.com",
        "password": "akshitmalik1203",
        "full_name": "Akshit Malik (Admin)"
    }
    
    try:
        # First, let's delete the old one if it exists to reset the password
        conn = sqlite3.connect('datagem.db')
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE email = ?", (user_data["email"],))
        conn.commit()
        conn.close()
        print("Cleared any existing user with that email.")
    except Exception as e:
        print(f"Notice: {e}")
        
    try:
        response = requests.post(url, json=user_data)
        
        if response.status_code == 200:
            user = response.json()
            print("✅ Admin user created successfully!")
            print(f"   Email: {user_data['email']}")
            print(f"   Password: {user_data['password']}")
            return user
        else:
            print(f"❌ Error: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to backend. Make sure it's running on http://127.0.0.1:8000")
        return None

if __name__ == "__main__":
    create_admin_user()
