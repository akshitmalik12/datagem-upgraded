# DataGem - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Backend Documentation](#backend-documentation)
5. [Frontend Documentation](#frontend-documentation)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Dependencies](#dependencies)
9. [Process Flow](#process-flow)
10. [Configuration](#configuration)
11. [Deployment](#deployment)

---

## 🎯 Project Overview

**DataGem** is an AI-powered data analysis platform that enables users to interact with datasets using natural language. Built with Google's Gemini 2.0 Flash AI model, it provides conversational data analysis, automated visualizations, and intelligent insights.

### Key Features

- **Natural Language Interface**: Ask questions about your data in plain English
- **Automated Code Generation**: AI generates and executes Python code for analysis
- **Interactive Visualizations**: Smart charts with drill-down capabilities
- **Advanced Data Tables**: Sortable, filterable, and exportable tables
- **Real-time Streaming**: Responses stream from backend to frontend
- **Dataset Profiling**: Automatic dataset overview and statistics
- **Modern UI**: Beautiful, responsive interface with dark mode support

### Technology Stack

- **Backend**: FastAPI, Python 3.12, SQLAlchemy, Google Gemini AI
- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Data Processing**: Pandas, NumPy, Matplotlib, Seaborn, Scikit-learn

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React Frontend (Port 5188)                   │   │
│  │  - Chat Interface                                    │   │
│  │  - Dataset Upload & Preview                         │   │
│  │  - Visualizations & Tables                          │   │
│  │  - Real-time Streaming                              │   │
│  └──────────────────┬───────────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────┘
                      │ HTTP/WebSocket
                      │ (CORS-enabled)
┌─────────────────────┼───────────────────────────────────────┐
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │      FastAPI Backend (Port 8000)                     │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │  Chat Router (/chat/)                        │    │   │
│  │  │  - Receives user messages                    │    │   │
│  │  │  - Streams responses                         │    │   │
│  │  └──────────────┬───────────────────────────────┘    │   │
│  │                 │                                     │   │
│  │  ┌──────────────▼───────────────────────────────┐    │   │
│  │  │  DataAnalystAgent                            │    │   │
│  │  │  - Manages Gemini AI interaction             │    │   │
│  │  │  - Handles tool calls                        │    │   │
│  │  │  - Generates summaries                       │    │   │
│  │  └──────────────┬───────────────────────────────┘    │   │
│  │                 │                                     │   │
│  │  ┌──────────────▼───────────────────────────────┐    │   │
│  │  │  Tools Module                                │    │   │
│  │  │  - run_python_code: Executes Python          │    │   │
│  │  │  - google_search: Web search (mock)          │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────┬───────────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────────┐
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  Google Gemini API                                   │   │
│  │  - Natural language understanding                    │   │
│  │  - Code generation                                   │   │
│  │  - Text summarization                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────────────────┐
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │  SQLite Database                                     │   │
│  │  - Users table                                       │   │
│  │  - Chat history table                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Input**: User types a question in the frontend chat interface
2. **Frontend Processing**: 
   - Validates input
   - Prepares request with dataset (if loaded)
   - Sends POST request to `/chat/` endpoint
3. **Backend Processing**:
   - Receives request at FastAPI endpoint
   - Creates/retrieves DataAnalystAgent instance
   - Sends message to Gemini AI with context and tools
4. **AI Processing**:
   - Gemini analyzes the request
   - Decides if tool calls are needed (e.g., run Python code)
   - Generates response or calls tools
5. **Tool Execution** (if needed):
   - Python code executed in isolated subprocess
   - Results captured and formatted
   - Visualizations encoded as base64
6. **Response Streaming**:
   - Backend streams response chunks to frontend
   - Frontend parses and displays in real-time
7. **Final Summary**:
   - AI generates text summary with insights
   - Formatted with markdown tables and emojis
   - Displayed in chat interface

---

## 📁 Project Structure

```
datagem/
├── datagem_backend/              # Backend Python application
│   ├── main.py                   # FastAPI application entry point
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables (API keys, etc.)
│   │
│   ├── auth/                     # Authentication module
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication logic
│   │   ├── models.py            # Auth-related models
│   │   └── security.py          # Password hashing, JWT tokens
│   │
│   ├── chat/                     # Chat and AI agent module
│   │   ├── __init__.py
│   │   ├── chat.py              # Chat API endpoints
│   │   ├── agent.py             # DataAnalystAgent class (main AI logic)
│   │   ├── models.py            # Chat request/response models
│   │   └── tools.py             # Tool implementations (Python execution, search)
│   │
│   ├── database/                 # Database module
│   │   ├── __init__.py
│   │   ├── database.py          # Database connection and session management
│   │   ├── models.py            # SQLAlchemy ORM models (User, ChatHistory)
│   │   └── crud.py              # Database CRUD operations
│   │
│   ├── data/                     # Data storage directory
│   │   └── datagem.db           # SQLite database file
│   │
│   ├── venv/                     # Python virtual environment
│   └── create_sample_user.py    # Utility script to create test users
│
├── datagem_frontend/             # Frontend React application
│   ├── package.json             # Node.js dependencies and scripts
│   ├── vite.config.js           # Vite build configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── index.html               # HTML entry point
│   │
│   ├── src/
│   │   ├── main.jsx             # React application entry point
│   │   ├── App.jsx              # Main App component with routing
│   │   ├── App.css              # Global styles
│   │   ├── index.css            # Base styles and Tailwind imports
│   │   │
│   │   ├── components/          # React components
│   │   │   ├── Chat.jsx         # Main chat interface component
│   │   │   ├── About.jsx        # About page component
│   │   │   ├── Login.jsx        # Login form component
│   │   │   ├── Signup.jsx       # Signup form component
│   │   │   ├── ProtectedRoute.jsx # Route protection wrapper
│   │   │   ├── CodeBlock.jsx    # Syntax-highlighted code display
│   │   │   ├── InteractiveChart.jsx # Interactive chart component
│   │   │   ├── EnhancedTableViewer.jsx # Advanced table component
│   │   │   ├── PromptSuggestions.jsx # Suggested prompts component
│   │   │   ├── LoadingSkeleton.jsx # Loading state components
│   │   │   └── ErrorBoundary.jsx # Error handling component
│   │   │
│   │   ├── contexts/            # React Context providers
│   │   │   ├── ThemeContext.jsx # Dark/light theme management
│   │   │   └── AuthContext.jsx  # Authentication state management
│   │   │
│   │   ├── services/            # API service layer
│   │   │   └── api.js           # Axios instance and API functions
│   │   │
│   │   └── utils/               # Utility functions
│   │       └── parseMarkdownTable.js # Markdown table parser
│   │
│   ├── public/                  # Static assets
│   │   └── vite.svg
│   │
│   └── dist/                    # Production build output
│
└── Documentation files
    ├── PROJECT_DOCUMENTATION.md # This file
    ├── FUTURE_ENHANCEMENTS.md   # Planned features
    └── INDUSTRY_FEATURES.md     # Industry-grade feature ideas
```

---

## 🔧 Backend Documentation

### Main Application (`main.py`)

**Purpose**: FastAPI application entry point, middleware configuration, and server startup.

**Key Components**:

1. **FastAPI App Initialization**:
   ```python
   app = FastAPI(
       title="DataGem AI Analyst Backend",
       description="API for the DataGem project",
       version="1.0.0"
   )
   ```

2. **CORS Middleware** (`CORSOptionsMiddleware`):
   - Handles OPTIONS preflight requests
   - Allows localhost and local network IPs (192.168.x.x, 10.x.x.x, 172.x.x.x)
   - Sets appropriate CORS headers for streaming responses
   - Ensures `X-Accel-Buffering: no` for proper streaming

3. **Router Registration**:
   - `/chat` router from `chat.chat` module

4. **Database Initialization**:
   - Creates all database tables on startup using SQLAlchemy metadata

5. **Server Configuration**:
   - Runs on `127.0.0.1:8000`
   - Auto-reload enabled for development
   - Watches only source directories (excludes venv)

### Chat Module (`chat/`)

#### `chat.py` - API Endpoints

**Endpoint**: `POST /chat/`

**Request Schema**:
```python
class ChatRequest(BaseModel):
    message: str
    dataset: list[dict] | None = None
```

**Response**: StreamingResponse (Server-Sent Events format)

**Process**:
1. Receives user message and optional dataset
2. Gets or creates database session
3. Creates DataAnalystAgent instance
4. Streams response from agent
5. Saves chat history to database

#### `agent.py` - DataAnalystAgent Class

**Purpose**: Manages interaction with Google Gemini AI, handles tool calls, and generates responses.

**Key Methods**:

1. **`__init__(self, db, user, dataset)`**:
   - Initializes Gemini model with tools
   - Creates separate text-only model for summaries
   - Sets up system instructions

2. **`stream_response(self, user_message, dataset)`**:
   - Main method that processes user messages
   - Sends message to Gemini with context
   - Handles tool calls (Python execution, search)
   - Streams responses back to frontend
   - Generates final text summary

3. **System Instructions**:
   - Defines AI behavior and rules
   - Specifies available libraries and tools
   - Provides formatting guidelines
   - Instructs on visualization creation

**Tool Integration**:
- `run_python_code`: Executes Python code in subprocess
- `google_search`: Simulates web search (mock implementation)

**Response Format**:
- Code blocks: Wrapped in markdown code fences
- Visualizations: Base64-encoded images with `PLOT_IMG_BASE64:` prefix
- Text summaries: Markdown formatted with tables and emojis

#### `tools.py` - Tool Implementations

**1. `run_python_code(code: str) -> str`**:

**Purpose**: Executes Python code in an isolated subprocess.

**Process**:
1. Creates subprocess with Python interpreter from venv
2. Sets up environment variables (PYTHONUNBUFFERED=1)
3. Executes code with 30-second timeout
4. Captures stdout and stderr
5. Returns formatted output

**Pre-imported Libraries**:
- `pandas` as `pd`
- `matplotlib.pyplot` as `plt`
- `seaborn` as `sns`
- `numpy` as `np`
- `sklearn` (all modules)
- `io`, `base64`, `json`

**Error Handling**:
- Timeout exceptions
- Syntax errors
- Runtime errors
- All errors returned in output for AI to handle

**2. `google_search(query: str) -> str`**:

**Purpose**: Mock Google search for educational purposes.

**Returns**: Simulated search results as formatted string.

### Database Module (`database/`)

#### `database.py` - Database Connection

**Purpose**: Manages database connection and session creation.

**Components**:
- SQLAlchemy engine creation
- SessionLocal class for database sessions
- Dependency function `get_db()` for FastAPI dependency injection

**Database URL**: Configurable via environment variable or defaults to SQLite.

#### `models.py` - ORM Models

**1. User Model**:
```python
class User(Base):
    id: Integer (Primary Key)
    email: String (Unique, Indexed)
    full_name: String (Nullable)
    hashed_password: String
    chat_history: Relationship (One-to-Many with ChatHistory)
```

**2. ChatHistory Model**:
```python
class ChatHistory(Base):
    id: Integer (Primary Key)
    user_id: Integer (Foreign Key -> User.id)
    role: String ("user" or "model")
    content: Text
    timestamp: DateTime (Auto-generated)
    owner: Relationship (Many-to-One with User)
```

#### `crud.py` - Database Operations

**Functions**:
- `get_user_by_email(db, email)`: Retrieve user by email
- `create_user(db, user)`: Create new user
- `create_chat_history(db, chat_history)`: Save chat message
- Additional CRUD operations as needed

### Authentication Module (`auth/`)

**Purpose**: Handles user authentication and authorization.

**Components**:
- Password hashing (bcrypt)
- JWT token generation and validation
- User authentication logic
- Security utilities

---

## 🎨 Frontend Documentation

### Entry Point (`main.jsx`)

**Purpose**: React application entry point.

**Process**:
1. Imports React and ReactDOM
2. Imports global CSS
3. Renders App component into `#root` element
4. Wraps in StrictMode for development warnings

### Main App (`App.jsx`)

**Purpose**: Root component with routing and context providers.

**Structure**:
```jsx
<ErrorBoundary>
  <ThemeProvider>
    <Router>
      <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/about" element={<About />} />
        <Route path="/" element={<Navigate to="/chat" />} />
      </Routes>
    </Router>
  </ThemeProvider>
</ErrorBoundary>
```

**Features**:
- React Router for navigation
- Theme context for dark/light mode
- Error boundary for error handling
- Future flags for React Router v7 compatibility

### Chat Component (`components/Chat.jsx`)

**Purpose**: Main chat interface component.

**Key Features**:

1. **State Management**:
   - Messages array
   - Input text
   - Loading state
   - Dataset and dataset profile
   - Expanded code blocks/outputs
   - Execution step tracking

2. **Dataset Handling**:
   - CSV file upload via PapaParse
   - Dataset profiling (shape, columns, statistics)
   - Preview display
   - LocalStorage persistence

3. **Message Display**:
   - User and assistant messages
   - Code blocks with syntax highlighting
   - Output tables with enhanced viewer
   - Images/visualizations
   - Markdown text rendering

4. **Streaming Response Handling**:
   - Reads Server-Sent Events stream
   - Parses code blocks, images, and text
   - Updates UI in real-time
   - Handles errors gracefully

5. **Response Parsing**:
   - Extracts code blocks (```python ... ```)
   - Extracts images (PLOT_IMG_BASE64:...)
   - Extracts output text
   - Parses markdown tables

6. **UI Components**:
   - Sidebar with dataset info
   - Message bubbles with animations
   - Code block viewer
   - Enhanced table viewer
   - Interactive charts
   - Prompt suggestions

### Component Library

#### `CodeBlock.jsx`
- Syntax highlighting with Prism
- Line numbers toggle
- Copy to clipboard
- Language detection
- Theme-aware styling

#### `InteractiveChart.jsx`
- Multiple chart types (line, bar, area, pie, scatter)
- Chart type switching
- Fullscreen mode
- Download functionality
- Interactive legends (show/hide series)
- Brush for zooming
- Statistics summary
- Theme-aware colors

#### `EnhancedTableViewer.jsx`
- Built on @tanstack/react-table
- Sorting by column
- Global search/filtering
- Column visibility toggle
- Row selection
- Pagination
- CSV export
- Column resizing
- Responsive design

#### `PromptSuggestions.jsx`
- Categorized prompts (Analysis, Visualization, Modeling, Contextual)
- Recent prompts (localStorage)
- Favorite prompts (localStorage)
- Contextual prompts based on dataset
- Smooth animations

#### `LoadingSkeleton.jsx`
- MessageSkeleton: Animated skeleton for messages
- CodeBlockSkeleton: Skeleton for code blocks
- ProgressIndicator: Step-by-step progress (Analyzing → Executing → Summarizing)

#### `ErrorBoundary.jsx`
- Catches React rendering errors
- Displays user-friendly error message
- Shows error details in collapsible section
- Reload button

### Context Providers

#### `ThemeContext.jsx`
- Manages dark/light theme
- Persists theme preference in localStorage
- Applies theme class to document root
- Provides `theme` and `toggleTheme` to components

#### `AuthContext.jsx`
- Manages authentication state
- Handles login/logout
- Token management
- Protected route logic

### Services

#### `api.js`
- Axios instance configuration
- Base URL: `http://127.0.0.1:8000`
- Request/response interceptors
- `streamChat()`: Handles streaming chat requests
- Error handling and formatting

### Utilities

#### `parseMarkdownTable.js`
- Parses markdown table strings
- Extracts headers and rows
- Converts to JavaScript objects
- Handles number parsing
- Returns structured data for table viewer

---

## 🗄️ Database Schema

### Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique user identifier |
| email | String | Unique, Indexed, Not Null | User email address |
| full_name | String | Nullable | User's full name |
| hashed_password | String | Not Null | Bcrypt hashed password |

**Relationships**:
- One-to-Many with ChatHistory (cascade delete)

### Chat History Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique message identifier |
| user_id | Integer | Foreign Key → users.id, Not Null | Reference to user |
| role | String | Not Null | "user" or "model" |
| content | Text | Not Null | Message content |
| timestamp | DateTime | Auto-generated | Message creation time |

**Relationships**:
- Many-to-One with User

### Database File

- **Location**: `datagem_backend/data/datagem.db`
- **Type**: SQLite (development)
- **Production**: Can be switched to PostgreSQL by changing DATABASE_URL

---

## 🔌 API Documentation

### Base URL

- **Development**: `http://127.0.0.1:8000`
- **Production**: Configurable

### Endpoints

#### `GET /`

**Description**: Root endpoint, returns welcome message.

**Response**:
```json
{
  "message": "Welcome to the DataGem AI Backend! Visit /docs for API details."
}
```

#### `POST /chat/`

**Description**: Main chat endpoint, streams AI responses.

**Request Body**:
```json
{
  "message": "What are the correlations between columns?",
  "dataset": [
    {"column1": "value1", "column2": "value2"},
    ...
  ]
}
```

**Response**: `StreamingResponse` (text/event-stream)

**Response Format**:
```
data: {"type": "text", "content": "Here's the analysis..."}

data: {"type": "code", "content": "import pandas as pd\n..."}

data: {"type": "image", "content": "base64_encoded_image_data"}

data: {"type": "done"}
```

**Error Responses**:
- `400`: Bad request (invalid message format)
- `500`: Server error (AI processing failed)

### API Documentation (Auto-generated)

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 📦 Dependencies

### Backend Dependencies (`requirements.txt`)

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | Latest | Web framework for API |
| uvicorn[standard] | Latest | ASGI server |
| sqlalchemy | Latest | ORM for database |
| psycopg2-binary | Latest | PostgreSQL adapter |
| python-jose[cryptography] | Latest | JWT token handling |
| passlib[bcrypt] | Latest | Password hashing |
| python-dotenv | Latest | Environment variable management |
| google-generativeai | Latest | Google Gemini AI SDK |
| pillow | Latest | Image processing |
| python-multipart | Latest | File upload support |
| email-validator | Latest | Email validation |
| pandas | Latest | Data manipulation |
| numpy | Latest | Numerical computing |
| matplotlib | Latest | Plotting library |
| seaborn | Latest | Statistical visualizations |
| scikit-learn | Latest | Machine learning |

### Frontend Dependencies (`package.json`)

#### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1.1 | UI library |
| react-dom | ^19.1.1 | React DOM renderer |
| react-router-dom | ^6.28.0 | Client-side routing |
| axios | ^1.7.7 | HTTP client |
| framer-motion | ^11.18.2 | Animation library |
| react-markdown | ^10.1.0 | Markdown rendering |
| remark-gfm | ^4.0.1 | GitHub Flavored Markdown |
| recharts | ^2.15.4 | Chart library |
| @tanstack/react-table | ^8.21.3 | Table component |
| react-syntax-highlighter | ^16.1.0 | Code syntax highlighting |
| papaparse | ^5.5.3 | CSV parsing |
| prismjs | ^1.30.0 | Syntax highlighting engine |
| prism-react-renderer | ^2.4.1 | Prism React wrapper |

#### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^7.1.7 | Build tool and dev server |
| @vitejs/plugin-react | ^5.0.4 | Vite React plugin |
| tailwindcss | ^3.4.13 | Utility-first CSS framework |
| postcss | ^8.4.47 | CSS processing |
| autoprefixer | ^10.4.20 | CSS vendor prefixing |
| eslint | ^9.36.0 | Code linting |
| @types/react | ^19.1.16 | TypeScript types for React |
| @types/react-dom | ^19.1.9 | TypeScript types for React DOM |

---

## 🔄 Process Flow

### Complete User Interaction Flow

```
1. USER ACTION
   └─> User types question in chat input
       └─> User clicks "Send" or presses Enter

2. FRONTEND PROCESSING
   └─> Chat.jsx: handleSubmit()
       ├─> Validates input
       ├─> Sets loading state
       ├─> Prepares request payload:
       │   ├─> message: user's question
       │   └─> dataset: current dataset (if loaded)
       └─> Calls api.streamChat()

3. API REQUEST
   └─> api.js: streamChat()
       ├─> Creates POST request to http://127.0.0.1:8000/chat/
       ├─> Sets Content-Type: application/json
       └─> Sends JSON payload

4. BACKEND RECEIVING
   └─> main.py: CORS middleware
       ├─> Handles OPTIONS preflight (if needed)
       └─> Adds CORS headers
       └─> chat.py: chat_endpoint()
           ├─> Parses request body
           ├─> Gets database session
           ├─> Creates DataAnalystAgent instance
           └─> Calls agent.stream_response()

5. AI PROCESSING
   └─> agent.py: stream_response()
       ├─> Prepares system context:
       │   ├─> Dataset information
       │   ├─> Available tools
       │   └─> System instructions
       ├─> Sends message to Gemini AI
       └─> Gemini processes:
           ├─> Analyzes user intent
           ├─> Decides if tools needed
           └─> Generates response or calls tools

6. TOOL EXECUTION (if needed)
   └─> Gemini calls run_python_code tool
       └─> tools.py: run_python_code()
           ├─> Creates Python subprocess
           ├─> Executes code with timeout (30s)
           ├─> Captures stdout/stderr
           ├─> Handles errors
           └─> Returns formatted output
       └─> Agent receives tool result
           └─> Sends result back to Gemini
           └─> Gemini generates follow-up response

7. RESPONSE STREAMING
   └─> agent.py: stream_response()
       ├─> Yields response chunks:
       │   ├─> Text chunks
       │   ├─> Code blocks
       │   └─> Image data (base64)
       └─> Generates final summary:
           ├─> Uses text-only model
           ├─> Formats with markdown
           └─> Includes tables and insights

8. FRONTEND STREAMING
   └─> api.js: streamChat()
       └─> Returns ReadableStream
       └─> Chat.jsx: handleSubmit()
           ├─> Creates reader from stream
           ├─> Reads chunks in loop:
           │   ├─> Parses JSON chunks
           │   ├─> Updates currentResponse state
           │   └─> Triggers re-render
           └─> On completion:
               ├─> Parses final response
               ├─> Extracts code, images, text
               ├─> Adds to messages array
               └─> Clears loading state

9. UI UPDATE
   └─> React re-renders Chat component
       ├─> Displays new message bubble
       ├─> Shows code blocks (collapsed by default)
       ├─> Renders images/visualizations
       ├─> Displays markdown text with tables
       └─> Scrolls to bottom

10. DATABASE SAVING
    └─> chat.py: chat_endpoint()
        └─> Saves chat history:
            ├─> User message → ChatHistory
            └─> AI response → ChatHistory
```

### Dataset Upload Flow

```
1. USER ACTION
   └─> User selects CSV file
       └─> File input onChange event

2. FILE PROCESSING
   └─> Chat.jsx: handleFileUpload()
       ├─> Uses PapaParse to read CSV
       ├─> Converts to array of objects
       └─> Sets dataset state

3. DATASET PROFILING
   └─> Chat.jsx: profileDataset()
       ├─> Calculates shape (rows, columns)
       ├─> Identifies numeric columns
       ├─> Computes statistics:
       │   ├─> Min, Max, Mean, Median
       │   └─> For each numeric column
       ├─> Creates preview (first 5 rows)
       └─> Sets datasetProfile state

4. PERSISTENCE
   └─> Saves to localStorage:
       ├─> Dataset data
       └─> Dataset profile

5. UI UPDATE
   └─> Sidebar displays:
       ├─> Dataset shape
       ├─> Column list
       ├─> Statistics cards
       └─> Preview table
```

---

## ⚙️ Configuration

### Environment Variables

Create `datagem_backend/.env`:

```env
# Required
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional (defaults shown)
DATABASE_URL=sqlite:///./datagem.db
```

### Backend Configuration

**Port**: `8000` (configurable in `main.py`)

**Host**: `127.0.0.1` (development), `0.0.0.0` (production)

**CORS**: Configured in `main.py` to allow:
- `localhost:*`
- `127.0.0.1:*`
- `192.168.*.*` (local network)
- `10.*.*.*` (private network)
- `172.*.*.*` (private network)

### Frontend Configuration

**Port**: `5188` (configurable in `vite.config.js`)

**API URL**: `http://127.0.0.1:8000` (configurable in `src/services/api.js`)

**Vite Config** (`vite.config.js`):
- React plugin
- Port: 5188
- Strict port: true
- Host: true (accessible from network)

**Tailwind Config** (`tailwind.config.js`):
- Dark mode: class-based
- Custom colors (primary, accent)
- Custom animations (shimmer, fade-in)

---

## 🚀 Deployment

### Development

```bash
# Backend
cd datagem_backend
source venv/bin/activate
python main.py

# Frontend (new terminal)
cd datagem_frontend
npm run dev
```

### Production Build

```bash
# Backend - no build needed
# Just ensure dependencies are installed
cd datagem_backend
pip install -r requirements.txt

# Frontend - build static files
cd datagem_frontend
npm run build
# Output in dist/ directory
```

### Docker Deployment

See Docker documentation for containerized deployment options.

---

## 🔍 Key Design Decisions

### Why FastAPI?

- **Async support**: Handles streaming responses efficiently
- **Auto documentation**: Built-in Swagger/ReDoc
- **Type safety**: Pydantic models for validation
- **Performance**: One of the fastest Python frameworks

### Why React 19?

- **Latest features**: Improved concurrent rendering
- **Better performance**: Optimized re-renders
- **Modern hooks**: Better state management

### Why Vite?

- **Fast HMR**: Instant hot module replacement
- **Optimized builds**: Faster production builds
- **Modern tooling**: ES modules, native ESM

### Why Streaming?

- **Better UX**: Users see responses immediately
- **Perceived performance**: Feels faster than waiting
- **Progressive rendering**: Code/images appear as generated

### Why Separate Text Model?

- **Cost optimization**: Text-only model is cheaper
- **Faster summaries**: No tool overhead
- **Better formatting**: Focused on text generation

---

## 🐛 Common Issues & Solutions

### Backend Issues

**Port already in use**:
```bash
lsof -ti:8000 | xargs kill -9
```

**CORS errors**:
- Check CORS middleware configuration
- Verify frontend URL is in allowed origins
- Check browser console for specific error

**Gemini API errors**:
- Verify API key in .env file
- Check API quota/limits
- Verify internet connection

### Frontend Issues

**Port already in use**:
```bash
lsof -ti:5188 | xargs kill -9
```

**Module not found**:
```bash
cd datagem_frontend
rm -rf node_modules package-lock.json
npm install
```

**Blank page**:
- Check browser console for errors
- Verify ErrorBoundary is catching errors
- Check network tab for failed requests

### Connection Issues

**ERR_BLOCKED_BY_CLIENT**:
- Disable browser extensions (ad blockers)
- Disable Brave Shields for localhost
- Try different browser

**Failed to fetch**:
- Verify backend is running
- Check backend logs
- Verify CORS configuration
- Check firewall settings

---

## 📊 Performance Considerations

### Backend

- **Streaming**: Reduces memory usage for large responses
- **Subprocess timeout**: Prevents hanging on infinite loops
- **Database sessions**: Properly closed to prevent leaks
- **Caching**: Consider adding Redis for frequently accessed data

### Frontend

- **Code splitting**: Vite automatically splits code
- **Lazy loading**: Components loaded on demand
- **Virtual scrolling**: For large message lists (future)
- **Image optimization**: Base64 images could be optimized
- **Memoization**: React.memo for expensive components

---

## 🔐 Security Considerations

### Current Implementation

- **Password hashing**: Bcrypt with salt
- **CORS**: Restricted to localhost/local network
- **Input validation**: Pydantic models
- **SQL injection**: Protected by SQLAlchemy ORM
- **XSS**: React automatically escapes content

### Production Recommendations

- **HTTPS**: Use SSL/TLS certificates
- **Rate limiting**: Prevent abuse
- **Authentication**: JWT tokens with expiration
- **API key rotation**: Regular key updates
- **Input sanitization**: Additional validation
- **Error messages**: Don't expose sensitive info

---

## 📈 Future Enhancements

See `FUTURE_ENHANCEMENTS.md` for comprehensive list of planned features including:

- Multi-model AI support
- Advanced visualizations
- Machine learning integration
- Collaboration features
- Mobile app
- And much more...

---

## 📝 Code Style & Conventions

### Backend (Python)

- **Style**: PEP 8
- **Type hints**: Used where applicable
- **Docstrings**: Google style
- **Naming**: snake_case for functions/variables

### Frontend (JavaScript/React)

- **Style**: ESLint configured
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Hooks**: Functional components with hooks
- **State**: useState, useContext for state management

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👥 Authors

DataGem Development Team

---

## 🙏 Acknowledgments

- Google Gemini AI for powerful language model
- FastAPI for excellent web framework
- React team for amazing UI library
- All open-source contributors

---

*Last Updated: November 2025*
*Documentation Version: 1.0*

