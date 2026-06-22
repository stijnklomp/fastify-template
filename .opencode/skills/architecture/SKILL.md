---
name: architecture
description: MUST USE when working with this Fastify + Bun + Prisma project. Understands the layered architecture, file organization, TypeBox schema patterns, and code conventions. Use when reading, writing, or modifying any source code in this project.
---

# Project Architecture

This skill describes the architecture, patterns, and conventions used in this Fastify + Bun + Prisma project.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Fastify with TypeBox type provider
- **Language**: TypeScript (strict mode, ESNext, Bundler module resolution)
- **ORM**: Prisma with PostgreSQL adapter (@prisma/adapter-pg)
- **Validation**: @sinclair/typebox (schema-first, generates OpenAPI spec)
- **Cache**: Redis (redis package, disabled via CACHE_DISABLED in tests)
- **Queue**: RabbitMQ (amqplib, disabled via RABBIT_DISABLED in tests)
- **Logger**: Pino with pino-pretty in development

## Layered Architecture

The project follows a strict layered architecture. Call direction is always one-way:

```
Routes → Controllers → Services → Repositories
```

Never skip layers or call backwards (e.g., a Service must NOT call a Controller).

### Directory Responsibilities

| Directory             | Purpose                                            | Calls        | Called By           |
| --------------------- | -------------------------------------------------- | ------------ | ------------------- |
| `src/routes/`         | Define HTTP endpoints and wire schemas to handlers | Controllers  | App bootstrap       |
| `src/controllers/`    | Handle HTTP req/res, delegate to services          | Services     | Routes              |
| `src/services/`       | Business logic                                     | Repositories | Controllers         |
| `src/repositories/`   | Database / external data access                    | Prisma/infra | Services            |
| `src/models/schemas/` | TypeBox validation schemas                         | —            | Routes, Controllers |
| `src/models/types/`   | Shared TypeScript types                            | —            | Any layer           |
| `src/infrastructure/` | External system clients (cache, RabbitMQ)          | —            | App bootstrap       |
| `src/middleware/`     | Fastify plugins (helmet, sensible, etc.)           | —            | App bootstrap       |
| `src/common/`         | Shared utilities (logger, prisma client)           | —            | Any layer           |

## Path Aliases

Use these aliases for imports. Do NOT use relative paths (e.g., `../../services/notes`):

- `@/common/*` → `src/common/*`
- `@/config/*` → `src/config/*`
- `@/controllers/*` → `src/controllers/*`
- `@/infrastructure/*` → `src/infrastructure/*`
- `@/middleware/*` → `src/middleware/*`
- `@/models/*` → `src/models/*`
- `@/prismaClient` → `generated/prisma/client.ts`
- `@/repositories/*` → `src/repositories/*`
- `@/routes/*` → `src/routes/*`
- `@/serializers/*` → `src/models/serializers/*`
- `@/services/*` → `src/services/*`
- `@/src/*` → `src/*`
- `@/types/*` → `src/models/types/*`
- `@/validators/*` → `src/models/schemas/*`
- Test-only: `@/context` → `test/context.ts`
- Test-only: `@/utils/*` → `test/utils/*`

## Schema-First Pattern with TypeBox

Every route MUST have a TypeBox schema. Schemas live in `src/models/schemas/` and define:

- `querystring` / `body` / `params` / `headers` for request validation
- `response` with HTTP status code keys for response validation

Example (`src/models/schemas/notes.ts`):

```typescript
import { Type } from "@sinclair/typebox"

const noteBase = Type.Object({
	note: Type.String({ maxLength: 300 }),
	owner: Type.String({ maxLength: 100 }),
})

const noteSchema = Type.Intersect([
	noteBase,
	Type.Object({
		createdAt: Type.String({ format: "date-time" }),
		id: Type.Number(),
		updatedAt: Type.String({ format: "date-time" }),
	}),
])

export const getNotesSchema = {
	querystring: Type.Object({
		page: Type.Number({ minimum: 1 }),
		perPage: Type.Number({ maximum: 100 }),
	}),
	response: {
		200: Type.Object({
			notes: Type.Array(noteSchema),
		}),
		500: { $ref: "HttpError" },
	},
}
```

The `HttpError` reference comes from `@fastify/sensible` (registered in `src/middleware/sensible.ts`).

### RouteHandler Type

Controllers use the custom `RouteHandler<typeof schema>` type from `@/models/types/schemaTypeExtractor` to get fully typed `req`/`res`:

```typescript
import { type RouteHandler } from "@/models/types/schemaTypeExtractor"
import { getNotesSchema } from "@/models/schemas/notes"

export const getNotesHandler: RouteHandler<typeof getNotesSchema> = async (
	req,
	res,
) => {
	// req.query is typed as Static<typeof getNotesSchema.querystring>
	const notes = await getNotesService({ ...req.query })
	await res.code(200).send({ notes })
}
```

## Error Handling Convention

Controllers catch errors, log them, and return a generic 500 message. NEVER leak internal errors to the client:

```typescript
try {
	const note = await createNoteService({ ...req.body })
	await res.code(201).send({ message: "Note Created", note })
} catch (err) {
	logger.error(err)
	await res.code(500).send({ message: "Internal Server Error" })
}
```

## Middleware / Plugins

Middleware files are wrapped with `fastify-plugin` so they are non-encapsulated. Register plugins in `src/middleware/index.ts`.

## Prisma Patterns

- Use the generated client at `@/prismaClient`
- Create the adapter in `src/common/prisma.ts` using `PrismaPg`
- The singleton `prismaClient()` is auto-imported in repositories
- Use `createPrismaClient()` when you need a fresh instance (e.g., health checks)

## Adding a New Endpoint

Follow this exact order when adding a new REST endpoint:

1. **Schema** — Create `src/models/schemas/<feature>.ts` with TypeBox
2. **Repository** — Create `src/repositories/<feature>.ts` with Prisma queries
3. **Service** — Create `src/services/<feature>.ts` with business logic
4. **Controller** — Create `src/controllers/<feature>.ts` with `RouteHandler` types
5. **Route** — Create `src/routes/v1/<feature>.ts` and wire to controller
6. **Register** — Import and register the route in `src/routes/index.ts`
7. **Tests** — Add unit tests for each layer and feature tests for the endpoint

## Code Style

### Arrow Functions

Use arrow functions over `function` declarations everywhere:

```ts
// Correct
const add = (a: number, b: number): number => a + b
const handleRequest = () => { ... }
export const createUser = async () => { ... }

// Incorrect
function add(a: number, b: number): number { return a + b }
function handleRequest() { ... }
export async function createUser() { ... }
```

This applies to all function forms:
- `function name() {}` → `const name = () => {}`
- `async function name() {}` → `const name = async () => {}`
- `export function name() {}` → `export const name = () => {}`

**Exceptions:** Generator functions (`function*`), class methods, and callbacks passed to utilities that bind `this` explicitly.

### ES Modules

The project uses ES Modules exclusively (enforced by `"type": "module"` in `package.json` and `verbatimModuleSyntax` in `tsconfig.json`):

```ts
// Correct
import { foo } from "./bar"
export const baz = () => {}

// Incorrect
const foo = require("./bar")
module.exports = { baz }
```

No `.cjs` or CJS-style files should be added.
