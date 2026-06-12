---
name: development
description: MUST USE when building, running, linting, or deploying this Fastify + Bun + Prisma project. Provides project-specific context for Docker Compose workflows, environment configuration, Prisma migrations, and code quality tools. All execution defaults to Docker Compose; host-level execution is a last resort.
---

# Project Development

This skill describes the development workflow, commands, and tooling for this Fastify + Bun + Prisma project.

## Philosophy

**Docker Compose is the primary development environment.** All commands should be run inside containers via Docker Compose profiles. The host should only be used as a last resort when no Docker configuration exists in the project.

## Prerequisites

- Docker & Docker Compose
- Bun (only needed if running outside containers — avoid this)
- Node.js (not used directly, but some tools expect it)

## Installation

Inside a Docker Compose container:

```bash
docker compose --profile dev run --rm dev bun install --frozen-lockfile
```

If Prisma client is not generated inside the container:

```bash
docker compose --profile dev run --rm dev bun run prisma:generate
```

## Environment Configuration

| File               | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `.env.development` | Local development defaults                   |
| `.env.production`  | Production build variables                   |
| `.env.tests`       | Test environment (loaded by `test/setup.ts`) |

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

All commands should be run inside a Docker Compose container. The preferred pattern is:

```bash
docker compose --profile <PROFILE> run --rm <SERVICE> <COMMAND>
```

Or, for long-running processes, start the profile and execute commands inside the running container:

```bash
docker compose --profile <PROFILE> up --build -d
docker compose --profile <PROFILE> exec <SERVICE> <COMMAND>
```

### Running the App

**Preferred — Docker Compose:**

```bash
# Development with hot reload (mounts current directory into container)
docker compose --profile dev up --build

# Production build + run (uses the local profile with a built image)
docker compose --profile local up --build
```

**Fallback — only if no Docker configuration exists:**

```bash
# Development with hot reload
bun run dev

# Production build + run
bun run build && bun run start

# Build only (outputs to dist/)
bun run build
```

### Linting & Formatting

Inside a Docker Compose container:

```bash
# Check linting
docker compose --profile dev run --rm dev bun run lint

# Fix linting and auto-sort JSON files
docker compose --profile dev run --rm dev bun run lint:fix

# Sort specific JSON files/directories (GLOB pattern)
docker compose --profile dev run --rm dev bunx jsonsort "./tsconfig.json ./test/tsconfig.json"
```

ESLint uses `stijnklomp-linting-formatting-config` with strict TypeScript rules. Key custom rules:

- `camelCase` for variables and functions
- `PascalCase` for types/classes
- Leading underscore allowed for unused parameters
- Object literal numeric properties exempt from naming

### Testing

**Preferred — Docker Compose:**

```bash
# Unit tests
docker compose --profile dev run --rm dev bun run test
docker compose --profile dev run --rm dev bun run test:unit
docker compose --profile dev run --rm dev bun run test:coverage

# Feature tests
docker compose --profile dev run --rm dev bun run test:feature

# Acceptance tests
docker compose --profile test up --build --attach acceptance-once --exit-code-from acceptance-once

# Or run interactively inside the dev container
docker compose --profile dev up --build -d
docker compose --profile dev exec -ti dev sh -c "bun run test:acceptance"

# Integrity check (lint + unit coverage + acceptance)
docker compose --profile test run --rm acceptance-once bun run integrity

# Show logs during any test
SHOW_LOGS=true docker compose --profile dev run --rm dev bun run test
```

**Fallback — only if no Docker configuration exists:**

```bash
# Unit tests
bun run test
bun run test:unit
bun run test:coverage

# Feature tests
bun run test:feature

# Acceptance tests
bun run test:acceptance
bun run test:acceptance:coverage

# Integrity check
bun run integrity
```

### Prisma & Database

Inside a Docker Compose container (migrations run automatically via the `db-migration` service):

```bash
# Generate Prisma client
docker compose --profile dev run --rm dev bun run prisma:generate

# Deploy migrations
docker compose --profile dev run --rm dev bun run migrate

# Create a new migration (development)
docker compose --profile dev run --rm dev bunx --bun prisma migrate dev --name <migration_name>
```

**Fallback — only if no Docker configuration exists:**

```bash
# Generate Prisma client
bun run prisma:generate

# Deploy migrations
bun run migrate

# Create a new migration (development)
bunx --bun prisma migrate dev --name <migration_name>
```

### Documentation

Inside a Docker Compose container:

```bash
# Generate TypeDoc
docker compose --profile dev run --rm dev bun run doc
```

**Fallback:**

```bash
bun run doc
```

## Docker Compose Workflows

**Docker Compose is the primary execution environment.** The project includes a full Docker Compose setup with profiles. All development, testing, and build operations should use these profiles.

### Profiles

| Profile | Services                                                  | Purpose                                |
| ------- | --------------------------------------------------------- | -------------------------------------- |
| `dev`   | dev, db, cache, rabbitmq, db-migration                    | Local development with hot reload      |
| `local` | local, db, cache, rabbitmq, db-migration                  | Build and run production image locally |
| `test`  | local, db, cache, rabbitmq, db-migration, acceptance-once | Run acceptance tests once              |

### Start Development Environment

```bash
docker compose --profile dev up --build
```

This mounts the current directory into the container and runs `bun run dev`.

To run subsequent commands inside the already-running container:

```bash
docker compose --profile dev exec dev <COMMAND>
```

### Run Acceptance Tests in Docker

```bash
# One-shot (exits with test exit code)
docker compose --profile test up --build --attach acceptance-once --exit-code-from acceptance-once

# Or run interactively inside the dev container
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

**Run inside a Docker Compose container:**

```bash
docker compose --profile dev run --rm dev bun build src/app.ts --outdir dist --target bun --format esm --external @prisma/client --minify
```

### Dockerfile

Multi-stage build:

1. **deps** — Install dependencies with lockfile
2. **builder** — Generate Prisma client and build
3. **runner** — Copy only dist, generated, and .env; run `bun dist/app.js`

**Always prefer building via Docker Compose profiles** (`dev` or `local`) over running `docker build` directly, as the profiles handle the full service stack (database, cache, etc.).

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

- Inside Docker: `docker compose --profile dev run --rm dev bun run prisma:generate`
- Fallback: `bun run prisma:generate`
- The alias `@/prismaClient` points to `generated/prisma/client.ts`

### Bun lockfile out of sync

- Inside Docker: Delete `bun.lock` and run `docker compose --profile dev run --rm dev bun install --frozen-lockfile`
- Fallback: Delete `bun.lock` and run `bun install --frozen-lockfile`
- Or just run `bun install` to update the lockfile

### Linting fails after editing JSON files

- Inside Docker: `docker compose --profile dev run --rm dev bun run lint:fix`
- Fallback: `bun run lint:fix`
- Or run `bunx jsonsort "<path>"` for specific files
