@echo off
title Trapeza Bank Launcher
color 0A

echo ========================================
echo    TRAPEZA BANK - Starting Services
echo ========================================
echo.

echo [1/2] Starting Backend (Spring Boot)...
start "Trapeza Backend" cmd /k "cd /d d:\trapeza-api\trapeza-api && echo Starting Spring Boot... && .\mvnw spring-boot:run"

echo Waiting for backend to initialize...
timeout /t 8 /nobreak > nul

echo.
echo [2/2] Starting Frontend (Port 3000)...
start "Trapeza Frontend" cmd /k "cd /d d:\trapeza-api\trapeza-api && echo Starting Frontend Server... && npx -y serve ./frontend -l 3000"

echo.
echo ========================================
echo    SERVICES STARTED!
echo ========================================
echo.
echo    Backend:  http://localhost:8080
echo    Frontend: http://localhost:3000
echo    Swagger:  http://localhost:8080/swagger-ui.html
echo.
echo ========================================

:: Open browser after a short delay
timeout /t 5 /nobreak > nul
start http://localhost:3000

echo.
echo Press any key to close this window...
pause > nul
