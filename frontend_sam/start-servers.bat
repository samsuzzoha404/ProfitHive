@echo off
echo Starting Retail Smart Demand Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Node.js version:
node --version

REM Start backend server
echo.
echo Starting backend server...
start "Backend Server" cmd /k "cd /d backend && node server.js"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo Starting frontend server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080
echo.
echo Press any key to close this window...
pause