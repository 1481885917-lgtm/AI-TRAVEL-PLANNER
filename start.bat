@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist node_modules (
  echo [1/2] First run - installing dependencies...
  call npm install
)

netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo [2/2] Server is already running - opening browser...
  start "" http://localhost:3000
  exit /b 0
)

echo [2/2] Starting dev server at http://localhost:3000
echo         Keep this window open. Press Ctrl+C to stop.
start "" http://localhost:3000
call npm run dev
pause
