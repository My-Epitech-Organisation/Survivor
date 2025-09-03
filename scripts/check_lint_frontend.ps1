# check_lint_frontend.ps1 - Script to check JavaScript/TypeScript code linting without making changes

# Colors for output
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Red = [ConsoleColor]::Red

# Banner
Write-Host "==========================================================" -ForegroundColor $Green
Write-Host "           Frontend Linting Check for Survivor" -ForegroundColor $Green
Write-Host "==========================================================" -ForegroundColor $Green

# Define frontend path
$FrontendDir = "frontend"

if (-not (Test-Path $FrontendDir)) {
    Write-Host "Error: Frontend directory does not exist." -ForegroundColor $Red
    exit 1
}

# Change to frontend directory
Set-Location -Path $FrontendDir

# Check if eslint is available in package.json
$PackageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
$HasEslint = $PackageJson.devDependencies.eslint -or $PackageJson.dependencies.eslint
$HasLintScript = $PackageJson.scripts.lint

if ($HasLintScript) {
    Write-Host "Running ESLint checks..." -ForegroundColor $Yellow
    npm run lint
}
elseif ($HasEslint) {
    Write-Host "ESLint found but no lint script. Running directly..." -ForegroundColor $Yellow
    npx eslint . --ext .js,.jsx,.ts,.tsx
}
else {
    Write-Host "ESLint not configured in package.json. Installing and running basic check..." -ForegroundColor $Yellow
    npm install --save-dev eslint
    npx eslint . --ext .js,.jsx,.ts,.tsx
}

Write-Host "==========================================================" -ForegroundColor $Green
Write-Host "                 Frontend check completed!" -ForegroundColor $Green
Write-Host "==========================================================" -ForegroundColor $Green

# Return to the original directory
Set-Location -Path ".."
