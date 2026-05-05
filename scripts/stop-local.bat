@echo off
echo Stopping CV Analyzer services...
echo.

echo Stopping Docker containers...
docker compose down

echo.
echo Stopping Python processes (uvicorn, node)...
taskkill /f /im python.exe 2>nul
taskkill /f /im node.exe 2>nul

echo.
echo Done. All services stopped.