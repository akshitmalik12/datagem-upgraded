# 💎 DataGem – AI Conversational Data Analyst

> “Talk to your data like never before.”  
> DataGem is an **AI-powered conversational data analyst** that allows users to explore, visualize, and gain insights from datasets through natural language.  
> Built with **FastAPI**, **React (Vite)**, and **Google Gemini 2.0**, DataGem intelligently interprets user queries, generates and executes Python code, and visualizes insights — all in real time.

---

## 🧠 Overview

DataGem combines **Natural Language Processing, Data Science, and Full-Stack Engineering** to make data analytics interactive and intuitive.  
Users can ask questions like:

> “Show me top 5 products by revenue.”  
> “Visualize monthly sales trends.”  
> “Summarize customer churn rate.”

The system automatically:
1. Understands the question (via **Gemini 2.0 Flash**),
2. Generates Python code dynamically,
3. Executes it safely in a sandbox,
4. Returns both results and visualizations — instantly.

---

## 🏗️ Architecture

Frontend (React, Vite, Tailwind)
|
| (HTTP / WebSocket)
▼
Backend (FastAPI, Python)
├── Chat API (/chat)
├── DataAnalystAgent (Gemini interaction)
├── Tools (Python execution, plotting)
├── Database (SQLite)
▼
Gemini AI Model (Google Generative AI)

yaml
Copy code

This architecture supports:
- ⚡ Real-time AI streaming  
- 🧩 Modular tool execution  
- 📈 Automated visualization  
- 🔒 Scalable backend architecture  

---

## 📂 Project Structure

datagem/
├── datagem_backend/
│ ├── main.py → FastAPI entry point
│ ├── chat/ → Chat endpoints, AI agent, tools
│ ├── database/ → ORM models & CRUD
│ ├── auth/ → JWT-based authentication (coming soon)
│ └── data/datagem.db → SQLite database
│
├── datagem_frontend/
│ ├── src/components/Chat.jsx → Chat interface
│ ├── src/services/api.js → API streaming logic
│ ├── tailwind.config.js → Theme setup
│ └── vite.config.js → Frontend build config
│
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── QUICK_START.sh

yaml
Copy code

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React, Vite, TailwindCSS |
| **Backend** | FastAPI (Python 3.12) |
| **AI Engine** | Google Gemini 2.0 Flash |
| **Database** | SQLite |
| **Deployment** | Docker, Render (Backend), Vercel (Frontend) |

---
akshit malik
