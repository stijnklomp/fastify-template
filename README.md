# Fastify template

<p align="center">This project template serves as a starting point for building efficient and scalable server-side applications with <a href="https://fastify.dev/" target="_blank">Fastify</a>, <a href="https://www.typescriptlang.org/" target="_blank">TypeScript</a>, and best practices in place. It comes pre-configured with essential tools to ensure code quality, maintainability, and a streamlined development workflow.</p>
<p align="center">
<img src="https://img.shields.io/github/license/stijnklomp/fastify-template?style=flat" alt="Package License" />
</p>

## Features

- Fastify: A fast and low overhead web framework for Node.js.
- TypeScript: Static typing with TypeScript, enhancing code quality and developer productivity.
- Prettier & ESLint: Automatic code formatting and linting for consistent code style and adherence to best practices.
- Bun: Runtime environment, bundler and unit, feature, and acceptance tests.
- Husky: Git hooks for running linting and tests before commits, ensuring code quality standards are met.
- TypeDoc: Automatic generation of TypeScript documentation for improved code clarity and collaboration.

## Installation

```sh
bun install --frozen-lockfile
bun run prisma:generate
```

## Running the app

By default the "API" mode is used. Set `DEPLOYMENT_MODE` to `worker` at runtime to use the worker mode.

```sh
# Development (hot reload)
bun run dev                        # API
DEPLOYMENT_MODE=worker bun run dev # Worker

# Production
bun run build && bun run start                        # API
bun run build && DEPLOYMENT_MODE=worker bun run start # Worker
```

### With Docker

```sh
docker build -t fastify-template .

# API
docker run --rm -p 3000:3000 fastify-template

# Worker
docker run --rm -e DEPLOYMENT_MODE=worker fastify-template
```

## Logging

Two environment variables control log verbosity independently:

- `REQUEST_LOG_LEVEL` — HTTP request logs from Fastify (every endpoint hit). Default: `info`.
- `CUSTOM_LOG_LEVEL`  — High-level event logs. Default: `info`.

Set either to `debug` for more verbosity:

```sh
REQUEST_LOG_LEVEL=info bun run dev # Show all endpoint hits
CUSTOM_LOG_LEVEL=debug bun run dev # Show debug-level custom events
```

## Test

### Lint

Eslint is used as a linter and uses Prettier to format code.

```sh
# ESLint
bun run lint

# ESLint and fix (also sorts JSON files)
# Prefix with `EXCLUDE_PATHS="<file_1> <file_2>"` to exclude files/directories (using GLOB pattern) from being auto-sorted
bun run lint:fix

# Sort a specific JSON file and/or directory
# Important: Don't run this command without a specified file/directory (using GLOB pattern)
bunx jsonsort "<file_1> <file_2>"
```

### Unit & Feature tests

```sh
# Unit tests
bun run test
bun run test:coverage

# Feature tests
bun run test:feature

# Prefix either command with `SHOW_LOGS=true` to show logs
```

Bun currently doesn't support HTML as a test coverage reporter. Therefore, a Dockerfile is provided which uses genhtml to generate the HTML coverage report. This can be run using:

```sh
bun run test:unit:coverage:html
```

You can then open `test/unit/coverage/html/index.html` to view the results:

```sh
xdg-open test/unit/coverage/html/index.html
```

### Acceptance tests

```sh
bun run test:acceptance
bun run test:acceptance:coverage
```

#### With Docker Compose

```sh
# Run once and exit
docker compose --profile test up --build --attach acceptance-once --exit-code-from acceptance-once

# Run multiple times
# There are multiple profiles that can be run for the acceptance tests:
# dev
# local
docker compose --profile <PROFILE> up --build -d && docker compose --profile <PROFILE> exec -ti dev sh -c "bun run test:acceptance"
```

### Integrity

Run this after a Bun install to verify that everything still works.

```sh
bun run integrity
```

## License

This project is licensed under the MIT License. Feel free to customize and use it for your own projects.