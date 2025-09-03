# autolint_frontend.ps1 - Script to automatically fix JavaScript/TypeScript code linting issues

# Colors for output
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red

# Banner
Write-Host "==========================================================" -ForegroundColor $Green
Write-Host "           Frontend Auto-Linting for Survivor" -ForegroundColor $Green
Write-Host "==========================================================" -ForegroundColor $Green

# Define frontend path
$FrontendDir = "frontend"

if (-not (Test-Path $FrontendDir)) {
    Write-Host "Error: Frontend directory does not exist." -ForegroundColor $Red
    exit 1
}

# Change to frontend directory
Set-Location -Path $FrontendDir

# Check if eslint is available with fix command in package.json
$PackageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$HasLintFixScript = $PackageJson.scripts.'lint:fix'
$HasLintScript = $PackageJson.scripts.lint

if ($HasLintFixScript) {
    Write-Host "Running ESLint fix..." -ForegroundColor $Yellow
    npm run lint:fix
}
elseif ($HasLintScript) {
    Write-Host "Lint script found. Attempting to run with --fix..." -ForegroundColor $Yellow
    npm run lint -- --fix
}
else {
    Write-Host "ESLint fix not configured in package.json. Adding and running..." -ForegroundColor $Yellow
    # Ensure eslint is installed
    if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
        Write-Host "Installing ESLint..." -ForegroundColor $Yellow
        npm install --save-dev eslint
    }
    
    # Run eslint with fix option
    Write-Host "Running ESLint fix..." -ForegroundColor $Yellow
    npx eslint . --ext .js,.jsx,.ts,.tsx --fix
}

Write-Host "==========================================================" -ForegroundColor $Green
Write-Host "                 Frontend auto-linting completed!" -ForegroundColor $Green
Write-Host "==========================================================" -ForegroundColor $Green

# Return to the original directory
Set-Location -Path ".."
