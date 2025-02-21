# Controller, service, repository pattern
## Benefits

- Reusability: The repository can be reused across different parts of the application
- Testability: Makes unit testing easier by mocking repositories instead of dealing with the database directly
- Scalability: If the data source changes (e.g., switching from SQL to NoSQL), only the repository layer needs modification

## Directory structure usage
### When to use `common/` vs `middleware/`

#### Common
Use `common/` for shared utilities, helper functions, and reusable logic that can be used anywhere in the application. This includes:
- Custom error handlers
- Logging utilities
- Response formatters
- General-purpose functions (e.g., data transformation, formatting)
- Custom Fastify decorators (`app.decorate`)

#### Middleware
Use `middleware/` for logic that directly interacts with the request/response lifecycle before reaching the controllers. This includes:
- Authentication & authorization
- Logging (if applied globally to requests)
- Request modification (e.g., adding headers)
- Global Fastify hooks (e.g., `onRequest`, `onResponse`)

If a function **modifies or processes a request before it reaches a controller**, it belongs in `middleware/`. If it's **a general-purpose utility used across multiple parts of the application**, it belongs in `common/`.
