#!/bin/bash
# check_lint_frontend.sh - Script to check JavaScript/TypeScript code linting without making changes

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}=========================================================="
echo "           Frontend Linting Check for Survivor"
echo -e "==========================================================${NC}"

# Define frontend path
FRONTEND_DIR="frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Frontend directory does not exist.${NC}"
    exit 1
fi

# Change to frontend directory
cd "$FRONTEND_DIR"

# Check if eslint is available in package.json
if grep -q "\"eslint\"" package.json || grep -q "\"lint\"" package.json; then
    echo -e "${YELLOW}Running ESLint checks...${NC}"
    npm run lint
else
    echo -e "${YELLOW}ESLint not configured in package.json. Installing and running basic check...${NC}"
    npm install --save-dev eslint
    npx eslint . --ext .js,.jsx,.ts,.tsx
fi

echo -e "${GREEN}=========================================================="
echo "                 Frontend check completed!"
echo -e "==========================================================${NC}"
