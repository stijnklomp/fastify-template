# Fastify template

<p align="center">This project template serves as a starting point for building efficient and scalable server-side applications with <a href="https://fastify.dev/" target="_blank">Fastify</a>, <a href="https://www.typescriptlang.org/" target="_blank">TypeScript</a>, and best practices in place. It comes pre-configured with essential tools to ensure code quality, maintainability, and a streamlined development workflow.</p>
<p align="center">
<img src="https://img.shields.io/github/license/stijnklomp/fastify-template?style=flat" alt="Package License" />
</p>

## Installation

```sh
npm ci
```

## Running the app

```sh
# Watch mode
npm run dev:watch

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

## Test

```sh
# Unit tests
npm run test

# Test coverage
npm run test:coverage

# E2e tests
npm run test:e2e
```

## License

This project is licensed under the MIT License. Feel free to customize and use it for your own projects.