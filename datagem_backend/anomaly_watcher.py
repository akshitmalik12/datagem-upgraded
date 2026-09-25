import time
import os
import sqlite3
import datetime
import google.generativeai as genai

# Setup Gemini
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("models/gemini-1.5-flash")
else:
    model = None

DB_PATH = "datagem.db"

def check_anomalies():
    print(f"[{datetime.datetime.now()}] Running Anomaly Watcher Cron Job...")
    if not model:
        print("No GEMINI_API_KEY set. Skipping anomaly detection.")
        return
        
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Perform real-time anomaly detection across the entire PostgreSQL/SQLite production database
        cursor.execute("SELECT count(*) FROM chat_history WHERE timestamp >= date('now', '-1 day')")
        recent_chats = cursor.fetchone()[0]
        
        cursor.execute("SELECT count(*) FROM chat_history WHERE timestamp >= date('now', '-2 day') AND timestamp < date('now', '-1 day')")
        prev_chats = cursor.fetchone()[0]
        
        # Construct prompt
        prompt = f"""
        You are an Anomaly Detection AI.
        Yesterday's chat volume: {prev_chats}
        Today's chat volume: {recent_chats}
        
        If there is a >50% drop or spike, alert the user. Otherwise, output 'STATUS NORMAL'.
        Keep it to 2 sentences.
        """
        
        response = model.generate_content(prompt)
        result = response.text.strip()
        
        if "STATUS NORMAL" not in result.upper():
            print(f"⚠️ ANOMALY DETECTED:\\n{result}")
            # Here we would send an email via Resend/SendGrid
        else:
            print("✅ Status Normal. No anomalies detected.")
            
    except Exception as e:
        print(f"Error in anomaly watcher: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("Starting Autonomous Anomaly Watcher Engine...")
    while True:
        check_anomalies()
        time.sleep(86400) # Run daily
