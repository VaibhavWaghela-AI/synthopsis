@echo off
title Synthopsis - Server Launcher
color 0A

echo ========================================================
echo    SYNTHOPSIS // CYBERCORE - LAUNCHING BOTH SERVERS
echo ========================================================
echo.

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

:: 1. Launch FastAPI Backend on Port 8000
echo [1/3] Launching FastAPI Backend on http://localhost:8000 ...
start "Synthopsis - Backend (Port 8000)" cmd /k "cd /d "%PROJECT_DIR%\backend" && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

:: 2. Launch WhatsApp Service on Port 3006
echo [2/3] Launching WhatsApp Real Phone Gateway on http://localhost:3006 ...
start "Synthopsis - WhatsApp Bridge (Port 3006)" cmd /k "cd /d "%PROJECT_DIR%\whatsapp-service" && npm start"

:: Small buffer delay
timeout /t 2 /nobreak >nul

:: 3. Launch Next.js Frontend on Port 3000
echo [3/3] Launching Next.js Frontend on http://localhost:3000 ...
start "Synthopsis - Frontend (Port 3000)" cmd /k "cd /d "%PROJECT_DIR%\frontend" && npm run dev"

echo.
echo ========================================================
echo  [OK] All 3 servers have been launched in separate windows!
echo  - Frontend:        http://localhost:3000
echo  - Backend API:     http://localhost:8000
echo  - WhatsApp QR:     http://localhost:3006/qr
echo  - Swagger Docs:    http://localhost:8000/docs
echo ========================================================
echo.
pause
