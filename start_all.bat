@echo off
echo ==========================================================
echo   SYNTHOPSIS AUTONOMOUS AI AGENT PLATFORM
echo   Launching Backend, WhatsApp Service, and Frontend...
echo ==========================================================

start "Synthopsis Backend (Port 8000)" cmd /k "cd backend && python main.py"
start "Synthopsis WhatsApp Service (Port 3006)" cmd /k "cd whatsapp-service && npm start"
start "Synthopsis Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo All 3 services launched in separate windows!
echo   1. Backend API        : http://127.0.0.1:8000 (Swagger: /docs)
echo   2. WhatsApp QR Bridge : http://127.0.0.1:3006/qr
echo   3. Frontend Dashboard : http://localhost:3000
echo.
echo Scan the QR code in WhatsApp or via http://localhost:3006/qr to pair your phone!
pause
