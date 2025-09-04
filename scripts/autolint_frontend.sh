#!/bin/bash
# Automatic correction script optimized for the frontend

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${GREEN}=========================================================="
echo "       Optimized Frontend Auto-Linting for Survivor"
echo -e "==========================================================${NC}"

# Define frontend path
FRONTEND_DIR="frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Error: Frontend directory does not exist.${NC}"
    exit 1
fi

# Change to frontend directory
cd "$FRONTEND_DIR"

# Check for required dependencies
if ! npm list eslint-plugin-unused-imports --depth=0 >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing required dependency: eslint-plugin-unused-imports${NC}"
    npm install --save-dev eslint-plugin-unused-imports
fi

if ! npm list ts-prune --depth=0 >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing required dependency: ts-prune${NC}"
    npm install --save-dev ts-prune
fi

# Phase 1: Standard ESLint fixes
echo -e "${BLUE}Phase 1/5: Running standard ESLint fixes...${NC}"
npx eslint . --ext .js,.jsx,.ts,.tsx --fix || true

# Phase 2: Fix unused imports
echo -e "${BLUE}Phase 2/5: Removing unused imports...${NC}"
if grep -q "lint:fix-imports" package.json; then
    npm run lint:fix-imports || true
else
    npx eslint . --ext .js,.jsx,.ts,.tsx --fix --rule 'unused-imports/no-unused-imports:error' || true
fi

# Phase 3: Fix React hook dependencies
echo -e "${BLUE}Phase 3/5: Fixing React hook dependencies...${NC}"
if grep -q "lint:fix-hooks" package.json; then
    npm run lint:fix-hooks || true
else
    npx eslint . --ext .js,.jsx,.ts,.tsx --fix --rule 'react-hooks/exhaustive-deps:error' || true
fi

# Phase 4: Fix specific problematic patterns
echo -e "${BLUE}Phase 4/5: Fixing common problematic patterns...${NC}"

# 4.1 Convert require() to import
find . -type f -name "*.js" -o -name "*.ts" -o -name "*.tsx" | grep -v "node_modules" | grep -v ".next" | while read FILE; do
    if grep -q "require(" "$FILE"; then
        echo -e "${YELLOW}  Converting require() to ES6 imports in $FILE${NC}"

        # Create backup
        cp "$FILE" "${FILE}.bak"

        # Convert common require patterns to ES6 imports
        sed -i 's/const \([a-zA-Z0-9_]*\) = require.*(\(.*\));/import \1 from \2;/g' "$FILE"

        # Check if file was changed
        if ! cmp -s "$FILE" "${FILE}.bak"; then
            echo -e "${GREEN}    ✓ Converted require() to ES6 imports${NC}"
        else
            echo -e "${YELLOW}    ⚠ Could not automatically convert some require() statements${NC}"
        fi

        # Remove backup
        rm "${FILE}.bak"
    fi
done

# 4.2 Fix specific project files with known issues
for FILE in "components/ProjectFilters.tsx" "components/ProjectOverview.tsx"; do
    if [ -f "$FILE" ]; then
        echo -e "${YELLOW}  Checking $FILE for specific issues...${NC}"

        # Fix missing useEffect dependencies
        if grep -q "useEffect.*\[\]" "$FILE"; then
            echo -e "${YELLOW}    Fixing empty useEffect dependencies${NC}"
            # Create backup
            cp "$FILE" "${FILE}.bak"

            # Find variable names used within useEffect and add them to dependency array
            DEPS=$(grep -o -P '(?<=useEffect\(\(\) => \{).*?(?=\}, \[\]\))' "$FILE" | grep -o -P '\b[a-zA-Z0-9_]+\b' | sort | uniq | grep -v "^set" | tr '\n' ',' | sed 's/,$//')

            if [ ! -z "$DEPS" ]; then
                sed -i "s/useEffect(() => {.*}, \[\])/useEffect(() => {}, [$DEPS])/" "$FILE"
                echo -e "${GREEN}    ✓ Added missing dependencies: $DEPS${NC}"
            fi

            # Remove backup
            rm "${FILE}.bak"
        fi

        # Remove unused imports
        if grep -q "import.*from" "$FILE"; then
            echo -e "${YELLOW}    Checking for unused imports${NC}"
            # This will be handled by the ESLint unused-imports plugin
        fi
    fi
done

# Phase 5: Final cleanup and report
echo -e "${BLUE}Phase 5/5: Final cleanup and generating report...${NC}"

# Run a final ESLint fix to catch any remaining fixable issues
npx eslint . --ext .js,.jsx,.ts,.tsx --fix || true

# Generate report of remaining issues
echo -e "${YELLOW}\nRemaining issues after auto-fixing:${NC}"
npx eslint . --ext .js,.jsx,.ts,.tsx || true

# Generate report of unused exports
echo -e "${YELLOW}\nUnused exports in the codebase (informational only):${NC}"
npx ts-prune || true

echo -e "${GREEN}=========================================================="
echo "         Optimized Frontend auto-linting completed!"
echo -e "==========================================================${NC}"
echo -e "${YELLOW}Note: This script has applied all possible automatic fixes.${NC}"
echo -e "${YELLOW}Remaining warnings typically require manual intervention:${NC}"
echo -e "${YELLOW}1. Rename unused variables to start with underscore (e.g., _request)${NC}"
echo -e "${YELLOW}2. Remove unused variables if they are not needed${NC}"
echo -e "${YELLOW}3. Add missing dependencies to useEffect hooks${NC}"