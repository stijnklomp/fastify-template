#!/bin/bash

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