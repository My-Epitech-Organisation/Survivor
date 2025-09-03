# Linting Scripts for Survivor Project

This document describes the usage of the automatic code linting and formatting scripts for the Survivor project.

## Available Scripts

The project includes specialized scripts for checking and formatting code in both frontend and backend components:

### Backend Scripts

- `check_lint_backend` - Verifies Python code against Ruff and Black standards without making changes
- `autolint_backend` - Automatically fixes Python code linting issues using Ruff and Black

### Frontend Scripts

- `check_lint_frontend` - Checks JavaScript/TypeScript code against ESLint standards without making changes
- `autolint_frontend` - Automatically fixes JavaScript/TypeScript code linting issues using ESLint

## Usage

### Unix/Linux/macOS

For backend code:
```bash
# Check code without making changes
./scripts/check_lint_backend.sh

# Auto-fix code
./scripts/autolint_backend.sh
```

For frontend code:
```bash
# Check code without making changes
./scripts/check_lint_frontend.sh

# Auto-fix code
./scripts/autolint_frontend.sh
```

### Windows (PowerShell)

For backend code:
```powershell
# Check code without making changes
.\scripts\check_lint_backend.ps1

# Auto-fix code
.\scripts\autolint_backend.ps1
```

For frontend code:
```powershell
# Check code without making changes
.\scripts\check_lint_frontend.ps1

# Auto-fix code
.\scripts\autolint_frontend.ps1
```

### Windows (Command Prompt)

For backend code:
```cmd
# Check code without making changes
.\scripts\check_lint_backend.bat

# Auto-fix code
.\scripts\autolint_backend.bat
```

For frontend code:
```cmd
# Check code without making changes
.\scripts\check_lint_frontend.bat

# Auto-fix code
.\scripts\autolint_frontend.bat
```

## Configuration

### Backend Configuration

The backend scripts use a `pyproject.toml` file in the project root for Ruff and Black configuration. If this file doesn't exist, the scripts will create one with default settings:

- Line length: 88 characters (Black standard)
- Enabled checkers: Pyflakes (F), pycodestyle (E), isort (I), and more
- Excluded directories: migrations, venv, __pycache__, etc.

### Frontend Configuration

The frontend scripts use the ESLint configuration specified in your project:

- If a lint script is defined in package.json, it will be used
- If no lint script exists but ESLint is installed, it will run ESLint directly
- If ESLint is not installed, the script will install it and run with basic settings

## Integration with CI/CD

These scripts are compatible with the CI/CD workflows defined in the project. The backend CI workflow uses the same linting tools (Ruff and Black) with similar configurations to ensure consistency between development and continuous integration environments.

## Prerequisites

The scripts will automatically install required tools if they are not already present:

- **Backend**: Ruff and Black will be installed via pip if needed
- **Frontend**: ESLint will be installed via npm if needed
