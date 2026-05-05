@echo off
echo Starting CV Analyzer services...
echo.

echo Starting backend (in new window)...
cd backend
start "CV Analyzer Backend" cmd /k "call venv\Scripts\activate && uvicorn app.main:app --reload"

cd ..\frontend
echo Starting frontend...
start "CV Analyzer Frontend" cmd /k "npm run dev"

echo.
echo Two windows should have opened:
echo   - CV Analyzer Backend (port 8080)
echo   - CV Analyzer Frontend (port 5173)
echo.
pause