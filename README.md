# Fastify template

<p align="center">This project template serves as a starting point for building efficient and scalable server-side applications with <a href="https://fastify.dev/" target="_blank">Fastify</a>, <a href="https://www.typescriptlang.org/" target="_blank">TypeScript</a>, and best practices in place. It comes pre-configured with essential tools to ensure code quality, maintainability, and a streamlined development workflow.</p>
<p align="center">
<img src="https://img.shields.io/github/license/stijnklomp/fastify-template?style=flat" alt="Package License" />
</p>

## Features

- Fastify: A fast and low overhead web framework for Node.js.
- TypeScript: Static typing with TypeScript, enhancing code quality and developer productivity.
- Prettier & ESLint: Automatic code formatting and linting for consistent code style and adherence to best practices.
- Jest: Unit & Feature testing framework for ensuring code quality and functionality.
- Husky: Git hooks for running linting and tests before commits, ensuring code quality standards are met.
- TypeDoc: Automatic generation of TypeScript documentation for improved code clarity and collaboration.

## Installation

```sh
npm ci
```

## Prerequisites

Create a `.env` file in the root directory if one does not already exist and copy the contents of the desired environment file over. (`.env.development` or `.env.production`)

## Running the app

```sh
# Development in watch mode
npm run dev

# Production mode
npm run build && npm run start
```

### With Docker

```sh
docker build -t fastify-template . && docker run --rm fastify-template
```

### With Docker Compose

```sh
# There are multiple profiles that can be run:
# dev -> Mounts the current directory to the container and runs the service in watch mode
# local -> Builds and runs the application image from the current code
docker compose --profile=PROFILE up --build
```

#### Database

You may need to run `npx prisma migrate dev --name init` in your terminal if you haven't already initialized the database. This only needs to be done the first time the database is created. (Or whenever the database has been recreated) This will happen automatically when using any profile in Docker Compose.

## Endpoints documentation (API specification)

Once the app is running, documentation will be available at `API_URL:PORT/docs`.

## Test

### Lint

Eslint is used as a linter and uses Prettier to format code.

```sh
# ESLint
npm run lint

# ESLint and fix (also sorts JSON files)
# Prefix with `EXCLUDE_PATHS="<file_1> <file_2>"` to exclude files/directories (using GLOB pattern)
npm run lint:fix

# Sort a specific JSON file and/or directory
# Important: Don't run this command without a specified file/directory (using GLOB pattern)
npx jsonsort "<file_1> <file_2>"
```

### Unit & Feature tests

```sh
# Unit tests
npm run test
npm run test:unit:coverage

# Feature tests
npm run test:feature
npm run test:feature:coverage

# Test combined coverage of unit and feature tests
npm run test:coverage
```

### Acceptance tests

```sh
npm run test:acceptance
npm run test:acceptance:coverage
```

#### With Docker Compose

```sh
# Run once and exit
docker compose --profile=test up --build --attach acceptance-once --exit-code-from acceptance-once

# Run multiple times
# There are multiple profiles that can be run for the acceptance tests:
# dev
# local
docker compose --profile=PROFILE up --build -d && docker compose --profile=PROFILE exec -ti dev sh -c "npm run test:acceptance"
```

### Integrity

Run this after an npm install to verify that everything still works.

```sh
npm run integrity
```

## License

This project is licensed under the MIT License. Feel free to customize and use it for your own projects.