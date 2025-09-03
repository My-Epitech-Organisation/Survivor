# Makefile for Survivor project
# Standardized commands for frontend and backend development

# Frontend commands
fe-install:
	cd frontend && npm install

fe-dev:
	cd frontend && npm run dev

fe-build:
	cd frontend && npm run build

fe-lint:
	cd frontend && npm run lint

fe-test:
	cd frontend && npm test --if-present

# Backend commands
be-install:
	cd backend && pip install -r requirement.txt

be-lint:
	cd backend && ruff check . && black --check .

be-format:
	cd backend && black .

be-test:
	cd backend && DISABLE_SCHEDULER=True pytest -q --disable-warnings --cov=. --cov-report=xml

# Docker commands
docker-build:
	docker compose build

docker-up:
	docker compose up

docker-down:
	docker compose down

# Combined commands
install: fe-install be-install

lint: fe-lint be-lint

test: fe-test be-test

.PHONY: fe-install fe-dev fe-build fe-lint fe-test be-install be-lint be-format be-test docker-build docker-up docker-down install lint test
