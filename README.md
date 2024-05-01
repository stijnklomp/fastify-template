# Fastify template

<p align="center">This project template serves as a starting point for building efficient and scalable server-side applications with <a href="https://fastify.dev/" target="_blank">Fastify</a>, <a href="https://www.typescriptlang.org/" target="_blank">TypeScript</a>, and best practices in place. It comes pre-configured with essential tools to ensure code quality, maintainability, and a streamlined development workflow.</p>
<p align="center">
<img src="https://img.shields.io/github/license/stijnklomp/fastify-template?style=flat" alt="Package License" />
</p>

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
docker build -t fastify-template . && docker run fastify-template
```

### With Docker Compose

```sh
# There are multiple profiles that can be run
# dev -> Mounts the current directory to the container and runs the service in watch mode
# local -> Builds and runs the application image from the current code
docker compose --profile=PROFILE up --build
```

#### Database

The database can be accessed via a browser by navigating to `API_URL:8080` when running Docker Compose with the `dev` profile.

Note that you may need to run `npx prisma migrate dev --name init` in your terminal if you haven't already initialized the database.

## Endpoints documentation (API specification)

Once the app is running, documentation will be available at `API_URL:PORT/docs`.

## Test

```sh
# Unit tests
npm run test

# Test coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

## License

This project is licensed under the MIT License. Feel free to customize and use it for your own projects.