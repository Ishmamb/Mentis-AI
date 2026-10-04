@echo off
setlocal
cd /d "%~dp0"
echo ==========================================
echo        MENTIS AI - DEMO SETUP
echo ==========================================
where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker was not found. Install Docker Desktop first.
  pause
  exit /b 1
)
if not exist apps\api\.env copy apps\api\.env.demo apps\api\.env >nul
if not exist apps\mobile\.env copy apps\mobile\.env.demo apps\mobile\.env >nul
echo [1/5] Starting PostgreSQL...
docker compose up -d --wait
if errorlevel 1 goto :fail
echo [2/5] Installing Node packages...
call npm install
if errorlevel 1 goto :fail
echo [3/5] Generating Prisma client...
call npm run db:generate
if errorlevel 1 goto :fail
echo [4/5] Creating database schema...
call npm run db:push
if errorlevel 1 goto :fail
echo [5/5] Loading faculty demo data...
call npm run db:seed
if errorlevel 1 goto :fail
echo.
echo SETUP COMPLETE.
echo Demo login: demo@mentis.app / Mentis123!
echo Now run START_BACKEND.bat and START_MOBILE.bat in separate terminals.
pause
exit /b 0
:fail
echo.
echo [ERROR] Setup stopped. Read README_FIRST.md for troubleshooting.
pause
exit /b 1
