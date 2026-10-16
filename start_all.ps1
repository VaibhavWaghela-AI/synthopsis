# Synthopsis Complete Multi-Service Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  SYNTHOPSIS AUTONOMOUS AI AGENT PLATFORM" -ForegroundColor Green
Write-Host "  Launching Backend, WhatsApp Service, and Frontend..." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python main.py"

# Start WhatsApp Service in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd whatsapp-service; npm start"

# Start Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nAll 3 services launched in separate windows!" -ForegroundColor Green
Write-Host "  1. Backend API        : http://127.0.0.1:8000 (Swagger: /docs)" -ForegroundColor White
Write-Host "  2. WhatsApp QR Bridge : http://127.0.0.1:3006/qr" -ForegroundColor White
Write-Host "  3. Frontend Dashboard : http://localhost:3000" -ForegroundColor White
Write-Host "`nScan the QR code in WhatsApp or via http://localhost:3006/qr to pair your phone!" -ForegroundColor Yellow
