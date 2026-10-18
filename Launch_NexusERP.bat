@echo off
title NexusERP Full System Launcher
color 0B
cls

set "ROOT_DIR=%~dp0"
set "PYTHON_EXE=%ROOT_DIR%.venv\Scripts\python.exe"

echo =====================================================================
echo                     NEXUSERP - FULL SYSTEM LAUNCHER
echo =====================================================================
echo.
echo  [1/3] Starting Backend API (FastAPI) on port 8000...
start "NexusERP Backend (FastAPI)" cmd /k "cd /d "%ROOT_DIR%01_Project\backend" && "%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo  [2/3] Starting Frontend Web App (Vite React) on port 5173...
start "NexusERP Frontend (Vite)" cmd /k "cd /d "%ROOT_DIR%01_Project\frontend" && npm run dev"

echo  [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo.
echo  Opening NexusERP in your default web browser...
start http://localhost:5173/

echo.
echo =====================================================================
echo                     NEXUSERP IS NOW RUNNING!
echo =====================================================================
echo.
echo   * Web Application:   http://localhost:5173/
echo   * Backend API:       http://127.0.0.1:8000/
echo   * Interactive Docs:  http://127.0.0.1:8000/docs
echo.
echo   * Default Login:     admin  /  admin123
echo.
echo =====================================================================
echo  Direct Browser Link:  http://localhost:5173/
echo.
echo  (Servers are running in background windows. You can minimize this)
echo  Press any key to close this launcher window...
echo =====================================================================
pause >nul
