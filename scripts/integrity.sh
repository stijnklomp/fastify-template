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
bun run lint

# Run unit tests
bun run test:coverage

# Run feature tests
# bun run test:feature

# Run acceptance tests
docker compose --profile test up --build --attach acceptance-once --exit-code-from acceptance-once