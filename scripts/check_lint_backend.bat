@echo off
REM check_lint_backend.bat - Wrapper for PowerShell linting check script

echo Running backend linting check...
powershell -ExecutionPolicy Bypass -File "%~dp0check_lint_backend.ps1"
echo Script completed with exit code %ERRORLEVEL%
