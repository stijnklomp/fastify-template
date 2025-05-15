#!/bin/bash

# Validation
# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Please install Docker first."
  exit 1
fi

# Check if 'docker compose' is available
if docker compose version &> /dev/null; then
  echo "Docker Compose is installed and available."
else
  echo "Docker Compose is not installed or not accessible."
fi

# Integrity checks
# Run linting
npm run lint

# Run test coverage
npm run test:coverage

# Run acceptance tests with Docker Compose
# Check if .env file exists, if not copy from .env.development
if [ ! -f .env ]; then
	echo ".env file not found, copying from .env.development"
	cp .env.development .env
fi

docker compose --profile=test up --build --attach acceptance-once --exit-code-from acceptance-once