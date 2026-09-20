# Workspace Context & Direct Paths

## Core Architecture
- **Backend Root**: `01_Project/backend`
- **Backend Entry Point**: `01_Project/backend/main.py`
- **Frontend Root**: `01_Project/frontend`
- **Database Location**: `01_Project/nexuserp.db`
- **Primary Python Virtual Environment**: `.venv/Scripts/python.exe` (Root directory `.venv`)

## Quick Commands
- **Run Backend**: `& "c:\Projects\Final-Year-Project\.venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000` (cwd: `01_Project/backend`)
- **Run Frontend**: `npm run dev` (cwd: `01_Project/frontend`)

## Credentials & Database Info
- **Default Admin User**: `admin`
- **Default Admin Password**: `admin123`
- **SQLite Database File**: `01_Project/nexuserp.db`

## Search Exclusions
Skip searching in `02_Datasets/`, `dataset/`, `.venv/`, `venv/`, and `node_modules/`.
