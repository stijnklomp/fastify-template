---
name: testing
description: MUST USE when writing, running, or debugging tests in this Fastify + Bun + Prisma project. Covers Bun test patterns, mocking conventions, test utilities, and the three test levels (unit, feature, acceptance).
---

# Project Testing

This skill describes the testing strategy, utilities, and patterns used in this Fastify + Bun + Prisma project.

## Test Framework

- **Runner**: Bun's built-in test runner (`bun:test`)
- **Assertion style**: `expect` from `bun:test` (Jest-like API)
- **Mocking**: `mock`, `spyOn`, `mock.module` from `bun:test`

## Test Levels

### 1. Unit Tests (`test/unit/`)

Test individual functions/modules in isolation. Heavy mocking of external dependencies.

- Test each layer independently (controller, service, repository, infrastructure)
- Mock external dependencies (Prisma, Redis, RabbitMQ, logger, file system)
- Use `test/context.ts` mocks for Prisma
- Use `test/utils/http.ts` for mock Fastify request/response objects

### 2. Feature Tests (`test/feature/`)

Test the full API stack without external services. The app is built but external infra is mocked.

- Use `startApp()` from `@/utils/process` to build the Fastify instance
- Mock cache and queue clients to avoid real connections
- Use `app.inject()` to make HTTP requests without starting the server
- Prisma is mocked via `test/context.ts`

### 3. Acceptance Tests (`test/acceptance/`)

Black-box tests against a running server with real external services (DB, cache, queue).

- Run via Docker Compose: `docker compose --profile test up --build --attach acceptance-once --exit-code-from acceptance-once`
- Or run against a locally running server with real services
- Use real HTTP requests (not `app.inject()`)

## Test Configuration

Configured in `bunfig.toml`:

```toml
[test]
coverageDir = "test/unit/coverage"
coverageSkipTestFiles = true
coverageThreshold = 1
coveragePathIgnorePatterns = [
  "test/**",
  "dist/**",
  "prisma/*.",
  "generated/**",
  "src/config/**",
  "src/models/types/**",
  "src/common/logger.ts"
]
preload = ["test/setup.ts", "test/context.ts"]
```

- `test/setup.ts` runs first: loads `.env.tests`, mocks the logger
- `test/context.ts` runs second: mocks Prisma and Fastify, resets Prisma mock before each test

## Key Test Utilities

### Mock Logger (`test/setup.ts`)

All tests get a mocked logger automatically. Use `loggerMocks` to assert log calls:

```typescript
import { loggerMocks } from "test/setup"

expect(loggerMocks.info).toHaveBeenCalledWith("Server listening on port 3000")
expect(loggerMocks.error).toHaveBeenCalledWith(expect.any(Error))
```

Set `SHOW_LOGS=true` env var to print mocked logs to console.

### Mock Prisma (`test/context.ts`)

Provides `prismaMock` (a fully mocked Prisma client) and `newPrismaMock` (basic connection mocks). Reset before each test:

```typescript
import { prismaMock, newPrismaMock } from "@/context"

beforeEach(() => {
  prismaMock._reset()
})

// In a test:
prismaMock.note.findMany.mockResolvedValue([noteDb])
const notes = await getNotesRepo({ page: 1, perPage: 10 })
expect(prismaMock.note.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 })
```

### Mock HTTP Objects (`test/utils/http.ts`)

For unit testing controllers without Fastify:

```typescript
import { createMockRequest, createMockResponse } from "@/utils/http"

const req = createMockRequest({ query: { page: "1", perPage: "10" } })
const { reply, statusCode, payload } = createMockResponse()

await getNotesHandler(req, reply)

expect(statusCode()).toBe(200)
```

### Process Utilities (`test/utils/process.ts`)

```typescript
import { startApp, processExitMock, restoreProcessExitMock, restoreEnvVars } from "@/utils/process"

// Start app for feature tests
const app = await startApp()

// Mock process.exit (REQUIRED: call restoreProcessExitMock after)
const exitMock = processExitMock()
// ... test ...
restoreProcessExitMock()

// Restore env vars mutated in tests
restoreEnvVars()
```

## Mocking Patterns

### Mock a Module

```typescript
const mockCacheClient = mock()

await mock.module("@/infrastructure/cache", () => ({
  cacheClient: { init: mockCacheClient },
}))
```

### Mock External Package

```typescript
await mock.module("redis", () => ({
  createClient: mockCreateClient,
}))
```

### Spy and Restore

```typescript
const spy = spyOn(process, "exit").mockImplementation(() => undefined as never)
// ... test ...
spy.mockRestore()
```

## Running Tests

```bash
# Unit tests
bun run test
bun run test:unit
bun run test:coverage # with coverage
bun run test:unit:coverage # text coverage

# Feature tests
bun run test:feature

# Acceptance tests (requires Docker)
bun run test:acceptance

# Show logs during tests
SHOW_LOGS=true bun run test
```

## Writing a New Unit Test

Template for a new controller unit test:

```typescript
import { describe, test, beforeEach, afterEach, expect, mock } from "bun:test"
import { prismaMock } from "@/context"
import { createMockRequest, createMockResponse } from "@/utils/http"
import { myHandler } from "@/controllers/myFeature"
import { loggerMocks } from "test/setup"

describe("MyFeature controller", () => {
  beforeEach(() => {
    prismaMock._reset()
  })

  afterEach(() => {
    mock.clearAllMocks()
  })

  test("should do something", async () => {
    prismaMock.note.findMany.mockResolvedValue([])

    const req = createMockRequest()
    const { reply, statusCode } = createMockResponse()

    await myHandler(req, reply)

    expect(statusCode()).toBe(200)
  })
})
```

## Code Coverage Rules

- Minimum threshold: 1 (configured in `bunfig.toml`)
- Coverage directory: `test/unit/coverage`
- HTML coverage requires Docker because Bun doesn't support HTML reporter natively:
  ```bash
  bun run test:unit:coverage:html
  # Then open test/unit/coverage/html/index.html
  ```
- Ignored from coverage: tests, dist, prisma, generated, config, types, and logger

## Important Testing Conventions

1. **Always reset `prismaMock._reset()` in `beforeEach`** to avoid test pollution
2. **Always call `mock.clearAllMocks()` in `afterEach`**
3. **Always restore `process.exit` mocks** with `restoreProcessExitMock()`
4. **Always restore env vars** with `restoreEnvVars()` if you mutated them
5. **Use `startApp()` for feature tests**, not `start()` directly
6. **Mock cache and queue clients** in feature tests to avoid connection errors
7. **Use `app.inject()` for feature tests** instead of real HTTP requests
8. **Never commit tests with `SHOW_LOGS=true`** — it's for local debugging only
