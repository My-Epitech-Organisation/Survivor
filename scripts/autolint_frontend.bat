@echo off
REM autolint_frontend.bat - Wrapper for PowerShell auto-linting script

echo Running frontend auto-linting...
powershell -ExecutionPolicy Bypass -File "%~dp0autolint_frontend.ps1"
echo Script completed with exit code %ERRORLEVEL%
