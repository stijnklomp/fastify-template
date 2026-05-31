---
name: development
description: MUST USE when building, running, linting, or deploying this Fastify + Bun + Prisma project. Covers Bun scripts, Docker workflows, environment configuration, Prisma migrations, and code quality tools.
---

# Project Development

This skill describes the development workflow, commands, and tooling for this Fastify + Bun + Prisma project.

## Prerequisites

- Bun
- Docker & Docker Compose (for acceptance tests and external services)
- Node.js (not used directly, but some tools expect it)

## Installation

```bash
bun install --frozen-lockfile
```

If Prisma client is not generated:
```bash
bun run prisma:generate
```

## Environment Configuration

| File | Purpose |
|------|---------|
| `.env.development` | Local development defaults |
| `.env.production` | Production build variables |
| `.env.tests` | Test environment (loaded by `test/setup.ts`) |

Key environment variables:

```bash
# App
API_PORT=3000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL="postgresql://dev:admin123@localhost:5432/fastify?schema=template"

# Cache (Redis)
CACHE_DISABLED=true # Set to false to enable Redis
CACHE_HOST=localhost
CACHE_PORT=6379
CACHE_PASSWORD=admin123

# Queue (RabbitMQ)
RABBIT_DISABLED=true # Set to false to enable RabbitMQ
RABBIT_HOST=localhost
RABBIT_PORT=5672
RABBIT_USER=guest
RABBIT_PASSWORD=guest

# Logs
LOGS=development # development | production | test
LOG_LEVEL=info
```

## Development Commands

### Running the App

```bash
# Development with hot reload
bun run dev

# Production build + run
bun run build && bun run start

# Build only (outputs to dist/)
bun run build
```

### Linting & Formatting

```bash
# Check linting
bun run lint

# Fix linting and auto-sort JSON files
bun run lint:fix

# Sort specific JSON files/directories (GLOB pattern)
bunx jsonsort "./tsconfig.json ./test/tsconfig.json"
```

ESLint uses `stijnklomp-linting-formatting-config` with strict TypeScript rules. Key custom rules:

- `camelCase` for variables and functions
- `PascalCase` for types/classes
- Leading underscore allowed for unused parameters
- Object literal numeric properties exempt from naming

### Testing

```bash
# Unit tests
bun run test
bun run test:unit
bun run test:coverage

# Feature tests
bun run test:feature

# Acceptance tests (Docker required)
bun run test:acceptance
bun run test:acceptance:coverage

# Show logs during any test
SHOW_LOGS=true bun run test

# Integrity check (lint + unit coverage + acceptance)
bun run integrity
```

### Prisma & Database

```bash
# Generate Prisma client
bun run prisma:generate

# Deploy migrations
bun run migrate

# Create a new migration (development)
bunx --bun prisma migrate dev --name <migration_name>
```

### Documentation

```bash
# Generate TypeDoc
bun run doc
```

## Docker Compose Workflows

The project includes a full Docker Compose setup with profiles:

### Profiles

| Profile | Services | Purpose |
|-----------|----------|---------|
| `dev` | dev, db, cache, rabbitmq, db-migration | Local development with hot reload |
| `local` | local, db, cache, rabbitmq, db-migration | Build and run production image locally |
| `test` | local, db, cache, rabbitmq, db-migration, acceptance-once | Run acceptance tests once |

### Start Development Environment

```bash
docker compose --profile dev up --build
```

This mounts the current directory into the container and runs `bun run dev`.

### Run Acceptance Tests in Docker

```bash
# One-shot (exits with test exit code)
docker compose --profile test up --build --attach acceptance-once --exit-code-from acceptance-once

# Or run interactively
docker compose --profile dev up --build -d
docker compose --profile dev exec -ti dev sh -c "bun run test:acceptance"
```

### Services in Docker Compose

- `db` — PostgreSQL with healthcheck
- `cache` — Valkey/Redis with password
- `rabbitmq` — RabbitMQ with healthcheck
- `db-migration` — Runs Prisma migrations after DB is healthy
- `dev` / `local` — The Fastify app
- `acceptance` / `acceptance-once` — Test runners

## Build Configuration

### TypeScript Config (`tsconfig.json`)

- `target`: ESNext
- `module`: Preserve (Bun handles it)
- `moduleResolution`: Bundler
- `verbatimModuleSyntax`: true (no implicit `type` imports)
- `strict`: true + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- Import aliases defined in `paths`

### Bun Build

```bash
bun build src/app.ts --outdir dist --target bun --format esm --external @prisma/client --minify
```

- Outputs to `dist/`
- Targets Bun runtime
- `@prisma/client` is external (must be in node_modules at runtime)
- Minified for production

### Dockerfile

Multi-stage build:
1. **deps** — Install dependencies with lockfile
2. **builder** — Generate Prisma client and build
3. **runner** — Copy only dist, generated, and .env; run `bun dist/app.js`

## Git Hooks (Husky)

Pre-commit runs `lint-staged` with `.lintstagedrc.json`:

```json
{
  "*.{js,cjs,mjs,ts,json,yml,yaml}": ["prettier --write"]
}
```

All staged JS/TS/JSON/YAML files are auto-formatted with Prettier on commit.

## OpenAPI Spec Generation

The app auto-generates `openapi.yaml` on startup (unless `NODE_ENV=production` or `writeOpenapi=false`). This is driven by the TypeBox schemas registered on routes.

Swagger config is in `src/app.ts`. Tags and metadata are hardcoded there — update them when adding new domain areas.

## Troubleshooting

### "Cache client not initialized"
- Set `CACHE_DISABLED=true` in your `.env` for local dev without Redis
- Or start the cache service: `docker compose up cache -d`

### "RabbitMQ connection refused"
- Set `RABBIT_DISABLED=true` in your `.env` for local dev without RabbitMQ
- Or start the queue service: `docker compose up rabbitmq -d`

### "DATABASE_URL environment variable is not defined"
- Ensure `.env.development` or `.env.tests` exists and is loaded
- The `prisma.config.ts` auto-detects `.env` first, then falls back to `.env.development`

### Prisma client not found
- Run `bun run prisma:generate` to generate the client to `generated/prisma/`
- The alias `@/prismaClient` points to `generated/prisma/client.ts`

### Bun lockfile out of sync
- Delete `bun.lock` and run `bun install --frozen-lockfile`
- Or just run `bun install` to update the lockfile

### Linting fails after editing JSON files
- Run `bun run lint:fix` — it auto-sorts JSON files
- Or run `bunx jsonsort "<path>"` for specific files
