# CI/CD Pipeline Documentation

This document explains the continuous integration and continuous deployment (CI/CD) pipelines set up for the Survivor project.

## Workflows Overview

The project uses GitHub Actions for CI/CD with three main workflows:

1. **Frontend CI** - Tests and builds the Next.js frontend application
2. **Backend CI** - Lints and tests the Django backend application
3. **Docker Build** - Builds and pushes Docker images to GitHub Container Registry

## Required Status Checks

When setting up branch protection rules for the `main` branch, include these required status checks:

- `frontend-ci / build-and-test`
- `backend-ci / lint-and-test`

This ensures that code cannot be merged without passing these critical checks.

## Frontend CI

**File**: `.github/workflows/frontend-ci.yml`

**Triggered by**:
- Pull requests (opened, synchronized, reopened) that modify frontend code
- Pushes to `main` that modify frontend code
- Manual triggers via workflow_dispatch

**Steps**:
1. Check out the code
2. Set up Node.js 20 with npm caching
3. Install dependencies
4. Run linting
5. Build the application
6. Run tests (if present)
7. Upload build artifacts

**Artifacts**:
- Frontend build output (`.next` directory and/or `out` directory)

**Caching**:
- Node modules are cached based on the package.json file
- Subsequent runs are faster due to this caching

## Backend CI

**File**: `.github/workflows/backend-ci.yml`

**Triggered by**:
- Pull requests that modify backend code
- Pushes to `main` that modify backend code
- Manual triggers via workflow_dispatch

**Steps**:
1. Check out the code
2. Set up Python 3.12 with pip caching
3. Install dependencies and test tools
4. Lint with Ruff
5. Check formatting with Black
6. Run tests with pytest and generate coverage
7. Upload coverage report

**Artifacts**:
- Test coverage report (coverage.xml)

**Environment**:
- Uses SQLite for testing with appropriate pragmas
- Database file is stored in a temporary directory to avoid locking issues

## Docker Build

**File**: `.github/workflows/docker-build.yml`

**Triggered by**:
- Pushes to `main`
- Tag pushes (v*)
- Manual triggers

**Steps**:
1. Check out the code
2. Verify Dockerfile exists for each component
3. Set up Docker Buildx
4. Log in to GitHub Container Registry
5. Extract metadata for Docker
6. Build and push Docker images

**Image tags**:
- Latest: Applied to images built from the main branch
- Short SHA: Applied to all images for specific commit reference
- Tag version: Applied when building from a Git tag

## Viewing and Managing Runs

### Re-running Jobs

If a job fails, you can re-run it from the GitHub Actions interface:
1. Navigate to the Actions tab in your repository
2. Find the workflow run
3. Click on "Re-run jobs" dropdown and select "Re-run failed jobs" or "Re-run all jobs"

### Viewing Artifacts

Artifacts from workflow runs can be downloaded:
1. Navigate to the specific workflow run
2. Scroll down to the "Artifacts" section
3. Click on the artifact you want to download

## GitHub Container Registry (GHCR)

### Enabling GHCR

GitHub Container Registry is automatically enabled for your organization or personal account. The workflow uses the built-in `GITHUB_TOKEN` for authentication.

### Image Access

Docker images are pushed to:
```
ghcr.io/[owner]/survivor-[component]:[tag]
```

Where:
- `[owner]` is your GitHub username or organization name
- `[component]` is either "frontend" or "backend"
- `[tag]` is either "latest" (for main branch), a short commit SHA, or a version tag

### Pulling Images

To pull an image:
```bash
docker pull ghcr.io/[owner]/survivor-frontend:latest
docker pull ghcr.io/[owner]/survivor-backend:latest
```

## Local Development

For local development and testing, you can use the same commands that are executed in the CI pipelines:

### Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
npm test  # if tests exist
```

### Backend

```bash
cd backend
pip install -r requirement.txt
pip install ruff black pytest pytest-cov
ruff check .
black --check .
pytest -q --cov=.
```

## Troubleshooting

- **Caching Issues**: If you suspect caching problems, you can manually trigger a workflow run with the "workflow_dispatch" event which will refresh caches.
- **Missing Dependencies**: If new dependencies are added, ensure they are properly committed in package.json or requirement.txt.
- **Docker Build Failures**: Check that your Dockerfiles are valid and that all necessary files are included in the build context.
