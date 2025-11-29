@echo off
echo Starting YouTube Clone Frontend...
echo.
echo Make sure the backend server is running on http://localhost:4000
echo.
cd /d "%~dp0"
npm run dev
