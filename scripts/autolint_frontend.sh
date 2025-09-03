#!/bin/bash
# autolint_frontend.sh - Script to automatically fix JavaScript/TypeScript code linting issues

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}=========================================================="
echo "           Frontend Auto-Linting for Survivor"
echo -e "==========================================================${NC}"

# Define frontend path
FRONTEND_DIR="frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Frontend directory does not exist.${NC}"
    exit 1
fi

# Change to frontend directory
cd "$FRONTEND_DIR"

# Check if eslint is available with fix command in package.json
if grep -q "\"lint:fix\"" package.json || grep -q "\"lint.*--fix\"" package.json; then
    echo -e "${YELLOW}Running ESLint fix...${NC}"
    npm run lint:fix || npm run lint -- --fix
else
    echo -e "${YELLOW}ESLint fix not configured in package.json. Adding and running...${NC}"
    # Add lint:fix script to package.json if it doesn't exist
    if [ -f package.json ]; then
        # Ensure eslint is installed
        if ! grep -q "\"eslint\"" package.json; then
            npm install --save-dev eslint
        fi

        # Run eslint with fix option
        echo -e "${YELLOW}Running ESLint fix...${NC}"
        npx eslint . --ext .js,.jsx,.ts,.tsx --fix
    else
        echo -e "${RED}Error: package.json not found.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}=========================================================="
echo "                 Frontend auto-linting completed!"
echo -e "==========================================================${NC}"
