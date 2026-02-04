@echo off
cd /d %~dp0

echo ===============================
echo   Transport System Smoke Test
echo ===============================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0smoke.ps1"

echo.
echo ===============================
echo   DONE
echo ===============================
pause
