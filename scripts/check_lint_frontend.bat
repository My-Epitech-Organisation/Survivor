@echo off
REM check_lint_frontend.bat - Wrapper for PowerShell linting check script

echo Running frontend linting check...
powershell -ExecutionPolicy Bypass -File "%~dp0check_lint_frontend.ps1"
echo Script completed with exit code %ERRORLEVEL%
