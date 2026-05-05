@echo off
echo ====================================
echo  CV Analyzer - Local Setup
echo ====================================
echo.

echo [1/6] Stopping local PostgreSQL on port 5432...
net stop postgresql-x64-16 2>nul
if %errorlevel% neq 0 (
    sc query postgresql-x64-16 2>nul
    if %errorlevel% equ 0 (
        net stop postgresql-x64-16
    ) else (
        echo PostgreSQL service not found or already stopped
    )
)
echo Done.
echo.

echo [2/6] Starting PostgreSQL and Redis via Docker...
docker compose up postgres redis -d
echo Waiting for services...
timeout /t 5 /nobreak >nul
echo Done.
echo.

echo [3/6] Checking backend .env file...
if not exist backend\.env (
    echo Creating backend\.env from example...
    copy backend\.env.example backend\.env
)
echo Done.
echo.

echo [4/6] Setting up Python virtual environment...
cd backend
if not exist venv (
    python -m venv venv
)
echo Done.
echo.

echo [5/6] Activating venv and installing dependencies...
call venv\Scripts\activate
pip install -r requirements.txt >nul 2>&1
echo Done.
echo.

echo [6/6] Creating frontend .env.local if needed...
cd ..\frontend
if not exist .env.local (
    echo VITE_API_URL=http://localhost:8080/api/v1 > .env.local
    echo Created .env.local
) else (
    echo Updating VITE_API_URL in .env.local...
    powershell -Command "(Get-Content .env.local) -replace 'VITE_API_URL=.*', 'VITE_API_URL=http://localhost:8080/api/v1' | Set-Content .env.local"
)
echo Done.
echo.

echo ====================================
echo  Setup complete!
echo ====================================
echo.
echo To start the services, run:
echo.
echo   1. Backend:  cd backend ^&^& call venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo   2. Frontend: cd frontend ^&^& npm run dev
echo.
echo Ports:
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:8080
echo   - API Docs: http://localhost:8080/docs
echo.
pause