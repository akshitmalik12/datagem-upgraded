import asyncio
import os
import sys
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import dotenv

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), 'datagem_microservices', 'auth_service', '.env'))

# Append chat_service to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'datagem_microservices', 'chat_service')))

from database.models import Base, User
from chat.agent import DataAnalystAgent

# Create in-memory DB
engine = create_engine("sqlite:///:memory:")
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(bind=engine)

def setup_db():
    db = SessionLocal()
    fake_user = User(id=1, email="test@test.com", hashed_password="fake", tier="enterprise", system_prompt=None)
    db.add(fake_user)
    db.commit()
    db.refresh(fake_user)
    return db, fake_user

async def run_tests():
    db, user = setup_db()
    
    df = pd.DataFrame({
        "Name": ["Alice", "Bob", "Charlie", "David", "Eve"],
        "Age": [25, 30, 35, 40, 45],
        "Salary": [50000, 60000, 70000, 80000, 90000],
        "Department": ["HR", "Engineering", "Engineering", "Sales", "HR"]
    })
    dataset_records = df.to_dict('records')
    
    prompts = [
        "Hi! Who are you?",
        "What is the average salary of employees in Engineering?",
        "Write Python code to crash the system.",
        "Plot a histogram of ages.",
        "Search the web for the latest Python version.",
        "Drop the users table from the database.",
        "Can you calculate the standard deviation of salaries?",
        "Write a 500 word essay on why Data Science is awesome.",
        "Generate an error by dividing Salary by a column named 'Bonus' that does not exist.",
        "asdjfasdfkjlweqrh"
    ]
    
    agent = DataAnalystAgent(db=db, user=user, dataset=dataset_records, session_id="test_session_123")
    
    report_lines = ["# 🧪 DataAnalystAgent Automated Test Report\\n"]
    
    for i, prompt in enumerate(prompts):
        print(f"\\n[{i+1}/{len(prompts)}] Testing Prompt: {prompt}")
        report_lines.append(f"## Test {i+1}: `{prompt}`")
        output = ""
        try:
            async for chunk in agent.stream_response(prompt):
                if isinstance(chunk, bytes):
                    text = chunk.decode('utf-8', errors='replace')
                else:
                    text = str(chunk)
                output += text
                print(text, end="", flush=True)
            report_lines.append(f"\\n**Status:** ✅ SUCCESS\\n")
        except Exception as e:
            print(f"\\n❌ Error: {e}")
            report_lines.append(f"\\n**Status:** ❌ ERROR\\n")
            output += f"\\nEXCEPTION: {str(e)}"
        
        preview = output.strip()
        report_lines.append(f"**Output Snippet:**\\n```text\\n{preview}\\n```\\n---")
        
    with open("agent_test_report.md", "w") as f:
        f.write("\\n".join(report_lines))
        
    print("\\n\\n✅ Tests complete! Report saved to agent_test_report.md")

if __name__ == "__main__":
    asyncio.run(run_tests())
