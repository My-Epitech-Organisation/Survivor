# autolint_backend.ps1 - Script to automatically fix Python code linting issues

# Colors for output
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red

# Banner
Write-Host "==========================================================" -ForegroundColor $Green
Write-Host "           Backend Auto-Linting for Survivor" -ForegroundColor $Green
Write-Host "==========================================================" -ForegroundColor $Green

# Check if Ruff is installed
try {
    python -c "import ruff" 2>$null
    $RuffInstalled = $?
} catch {
    $RuffInstalled = $false
}

if (-not $RuffInstalled) {
    Write-Host "Ruff is not installed. Installing..." -ForegroundColor $Red
    pip install ruff
}

# Check if Black is installed
try {
    python -c "import black" 2>$null
    $BlackInstalled = $?
} catch {
    $BlackInstalled = $false
}

if (-not $BlackInstalled) {
    Write-Host "Black is not installed. Installing..." -ForegroundColor $Red
    pip install black
}

# Define backend path
$BackendDir = "backend"

if (-not (Test-Path $BackendDir)) {
    Write-Host "Error: Backend directory does not exist." -ForegroundColor $Red
    exit 1
}

# Create Ruff config file if it doesn't exist
$RuffConfig = "pyproject.toml"
if (-not (Test-Path $RuffConfig)) {
    Write-Host "Creating default Ruff configuration in $RuffConfig" -ForegroundColor $Yellow
    @"
[tool.ruff]
# Enable Pyflakes ('F'), pycodestyle ('E'), isort ('I')
select = ["E", "F", "I", "W", "D"]
ignore = []

# Allow autofix for all enabled rules (when '--fix') is provided
fixable = ["ALL"]
unfixable = []

# Exclude a variety of commonly ignored directories
exclude = [
    ".git",
    ".env",
    ".venv",
    "venv",
    "env",
    "migrations",
    "__pycache__",
    "build",
    "dist",
]

# Same as Black
line-length = 88

# Assume Python 3.8
target-version = "py38"

[tool.ruff.mccabe]
# Unlike Flake8, default to a complexity level of 10.
max-complexity = 10

[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'
exclude = '''
/(
    \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | _build
  | buck-out
  | build
  | dist
  | migrations
)/
'''
"@ | Out-File -FilePath $RuffConfig -Encoding utf8
    Write-Host "Ruff configuration created." -ForegroundColor $Green
}

Write-Host "Auto-fixing code in $BackendDir with Ruff..." -ForegroundColor $Yellow
ruff check $BackendDir --fix --statistics

Write-Host "Formatting code with Black..." -ForegroundColor $Yellow
black $BackendDir

Write-Host "==========================================================" -ForegroundColor $Green
Write-Host "                 Backend auto-linting completed!" -ForegroundColor $Green
Write-Host "==========================================================" -ForegroundColor $Green
