@echo off
echo ========================================
echo   YouTube Clone - Quick Start
echo ========================================
echo.

REM Check if backend .env exists
if not exist "backend\chai-backend\.env" (
    echo [WARNING] Backend .env file not found!
    echo Please copy .env.example to .env and configure:
    echo   - MongoDB URI
    echo   - Cloudinary credentials
    echo   - JWT secrets
    echo.
    echo Press any key to continue anyway...
    pause > nul
)

echo [1/3] Starting MongoDB...
echo Make sure MongoDB is running on localhost:27017
echo.

echo [2/3] Starting Backend Server...
start "YouTube Backend" cmd /k "cd /d backend\chai-backend && npm run dev"
timeout /t 3 /nobreak > nul

echo [3/3] Starting Frontend Server...
start "YouTube Frontend" cmd /k "cd /d frontend && npm run dev"
timeout /t 2 /nobreak > nul

echo.
echo ========================================
echo   Servers Started!
echo ========================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open frontend in browser...
pause > nul
start http://localhost:5173
