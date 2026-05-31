#!/bin/bash

set -e

cleanup() {
  echo ""
  echo "Integrity checks completed."
}

trap cleanup EXIT

BUN_IMAGE="oven/bun:alpine"
BUN_RUN="docker run --rm -v "$(pwd):/src" -w /src ${BUN_IMAGE}"

# Validation
# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Docker is not installed. Please install Docker first."
  exit 1
fi

# Pull the bun image upfront
docker pull ${BUN_IMAGE} > /dev/null 2>&1

# Check if 'docker compose' is available
if docker compose version &> /dev/null; then
  echo "Docker Compose is installed and available."
else
  echo "Docker Compose is not installed or not accessible."
fi

# Integrity checks
# Run linting
${BUN_RUN} bun run lint

# Run unit tests
${BUN_RUN} bun run test:unit

# Run acceptance tests
docker compose --profile test up --build --attach acceptance-once --exit-code-from acceptance-once