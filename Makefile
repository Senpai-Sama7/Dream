.PHONY: help install dev build test clean smoke-test docker-up docker-down docker-logs k8s-deploy k8s-status k8s-delete contracts-gen

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install: ## Install all dependencies
	@echo "Installing dependencies..."
	npm install
	cd packages/frontend && npm install
	cd packages/backend && npm install
	cd packages/sandbox && npm install
	cd packages/planner && npm install

dev: ## Start all services in development mode
	@echo "Starting all services..."
	npm run dev

build: ## Build all packages
	@echo "Building all packages..."
	npm run build

test: ## Run all tests
	@echo "Running tests..."
	npm run test

lint: ## Run linters
	@echo "Running linters..."
	npm run lint

clean: ## Clean build artifacts and dependencies
	@echo "Cleaning..."
	rm -rf node_modules packages/*/node_modules
	rm -rf packages/*/dist packages/*/build
	find . -name "*.log" -delete

smoke-test: ## Run smoke test for CSV viewer
	@echo "Running smoke test for CSV viewer..."
	cd packages/backend && npm run test:smoke

docker-up: ## Start all services with Docker Compose
	@echo "Starting services with Docker Compose..."
	docker compose -f dev/compose/docker-compose.yml up -d

docker-down: ## Stop all Docker Compose services
	@echo "Stopping Docker Compose services..."
	docker compose -f dev/compose/docker-compose.yml down

docker-logs: ## View Docker Compose logs
	@echo "Viewing Docker Compose logs..."
	docker compose -f dev/compose/docker-compose.yml logs -f

docker-build: ## Build Docker images
	@echo "Building Docker images..."
	docker compose -f dev/compose/docker-compose.yml build

k8s-deploy: ## Deploy to Kubernetes
	@echo "Deploying to Kubernetes..."
	kubectl apply -k deploy/k8s/base/

k8s-status: ## Check Kubernetes deployment status
	@echo "Checking Kubernetes status..."
	kubectl get pods -n dream
	kubectl get services -n dream

k8s-delete: ## Delete Kubernetes deployment
	@echo "Deleting Kubernetes deployment..."
	kubectl delete -k deploy/k8s/base/

contracts-gen: ## Generate code from protobuf contracts
	@echo "Generating contracts..."
	cd packages/contracts && make gen
