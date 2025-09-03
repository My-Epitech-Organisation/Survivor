#!/bin/bash
# check_lint_backend.sh - Script to check Python code linting without making changes

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}=========================================================="
echo "           Backend Linting Check for Survivor"
echo -e "==========================================================${NC}"

# Check if Ruff is installed
if ! command -v ruff &> /dev/null; then
    echo -e "${RED}Ruff is not installed. Installing...${NC}"
    pip install ruff
fi

# Check if Black is installed
if ! command -v black &> /dev/null; then
    echo -e "${RED}Black is not installed. Installing...${NC}"
    pip install black
fi

# Define backend path
BACKEND_DIR="backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Error: Backend directory does not exist.${NC}"
    exit 1
fi

# Create Ruff config file if it doesn't exist
RUFF_CONFIG="pyproject.toml"
if [ ! -f "$RUFF_CONFIG" ]; then
    echo -e "${YELLOW}Creating default Ruff configuration in $RUFF_CONFIG${NC}"
    cat > "$RUFF_CONFIG" << EOF
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
EOF
    echo -e "${GREEN}Ruff configuration created.${NC}"
fi

echo -e "${YELLOW}Checking code in $BACKEND_DIR with Ruff...${NC}"
ruff check "$BACKEND_DIR" --statistics

echo -e "${YELLOW}Checking formatting with Black...${NC}"
black --check "$BACKEND_DIR" || true

echo -e "${GREEN}=========================================================="
echo "                 Backend check completed!"
echo -e "==========================================================${NC}"
