#!/bin/bash

# Script to run Django tests locally
# Author: Survivor Team
# Description: Runs all Django tests with proper environment setup

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Header
echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    🧪 DJANGO TEST RUNNER 🧪                  ║"
echo "║                     JEB Incubator Project                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_info "Starting Django test suite..."
echo ""

# Change to backend directory
print_step "Navigating to backend directory..."
cd backend || { print_error "Failed to navigate to backend directory"; exit 1; }
print_success "Backend directory reached"
echo ""

# Check if virtual environment exists and activate it
if [ -d "venv" ]; then
    print_step "Activating virtual environment..."
    source venv/bin/activate || { print_error "Failed to activate virtual environment"; exit 1; }
    print_success "Virtual environment activated"
else
    print_warning "No virtual environment found, using system Python"
fi
echo ""

# Install dependencies if requirements.txt exists
if [ -f "requirement.txt" ]; then
    print_step "Installing/updating dependencies..."
    pip install -r requirement.txt > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_warning "No requirements.txt found"
fi
echo ""

# Check if migrations are needed
print_step "Checking for pending migrations..."
if DISABLE_SCHEDULER=True DISABLE_SIGNALS=True python manage.py showmigrations --settings=backend.settings 2>/dev/null | grep -q "\[ \]"; then
    print_warning "Pending migrations found"
    print_step "Running database migrations..."
    DISABLE_SCHEDULER=True DISABLE_SIGNALS=True python manage.py migrate --settings=backend.settings > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Migrations completed successfully"
    else
        print_error "Failed to run migrations"
        exit 1
    fi
else
    print_success "No pending migrations found"
fi
echo ""

# Run the tests
print_info "🚀 Starting test execution..."
echo -e "${WHITE}══════════════════════════════════════════════════════════════${NC}"

# Run tests and filter out warnings while keeping important output
DISABLE_SCHEDULER=True DISABLE_SIGNALS=True python manage.py test --settings=backend.settings 2>&1 | grep -v "UserWarning\|WARNING\|pkg_resources" | grep -v "staticfiles" || true

TEST_EXIT_CODE=${PIPESTATUS[0]}

echo -e "${WHITE}══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "🎉 All tests passed successfully!"
    echo -e "${GREEN}✅ Test suite completed with no failures${NC}"
else
    print_error "❌ Some tests failed"
    echo -e "${RED}⚠️  Please review the test output above${NC}"
fi

echo ""
echo -e "${PURPLE}══════════════════════════════════════════════════════════════${NC}"
print_info "Test execution completed"
echo -e "${PURPLE}══════════════════════════════════════════════════════════════${NC}"

exit $TEST_EXIT_CODE
