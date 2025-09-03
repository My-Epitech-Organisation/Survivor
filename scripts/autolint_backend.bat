@echo off
REM autolint_backend.bat - Wrapper for PowerShell auto-linting script

echo Running backend auto-linting...
powershell -ExecutionPolicy Bypass -File "%~dp0autolint_backend.ps1"
echo Script completed with exit code %ERRORLEVEL%
