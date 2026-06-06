---
name: dependency-management
description: MUST USE when upgrading dependencies in this Fastify + Bun + Prisma project. Covers dependency update workflows, post-upgrade verification via integrity checks, and common breaking-change fixes after version bumps.
---

# Dependency Management & Upgrades

This skill describes how to safely update project dependencies and verify the project still works afterward, regardless of whether you update one package or many.

## Philosophy

Always verify dependency changes with the full integrity suite before committing. The `bun run integrity` command is the safety net — it catches type errors, test failures, and runtime issues that version bumps can introduce.

## Pre-Upgrade Safety

Before touching dependencies, ensure you can revert:

```bash
# Check for uncommitted changes
git status

# If dirty, commit or stash first
git add -A && git commit -m "chore: pre-upgrade checkpoint"
```

The `bun.lock` file is your revert point. If the upgrade breaks things irreparably, restore it:

```bash
git checkout bun.lock
rm -rf node_modules
bun install --frozen-lockfile
```

## Upgrade Workflow

### Step 1: Update Dependencies

Choose the approach that fits your needs:

**Option A: Update all dependencies at once**

```bash
# Updates all dependencies to the latest version within their
# SEMVER range in package.json, then regenerates bun.lock
bun update

# To update across major versions (ignores SEMVER ranges)
bun update --latest
```

`bun update` respects the version ranges in `package.json`. For example, if `package.json` has `"fastify": "^5.0.0"`, `bun update` will update to the latest `5.x.x` but NOT to `6.0.0`.

To upgrade across major version boundaries, use `--latest`.

> **Note on `minimumReleaseAge`**: `bunfig.toml` sets `minimumReleaseAge = 259200` (3 days). This means `bun update` will not install releases newer than 3 days old as a security precaution. If the user needs the absolute latest versions regardless of age, they must manually lower or remove this value in `bunfig.toml` themselves. The agentic AI must not modify this setting.

**Option B: Update a specific package**

```bash
# Update one package to the latest version within its SEMVER range
bun update <package-name>

# Example: update Fastify within its current major version
bun update fastify

# To update across major versions for a specific package
bun update <package-name> --latest
```

**Option C: Update a package to a specific version**

```bash
# Install an exact version
bun add <package-name>@<version>

# Example: downgrade or pin a specific version
bun add fastify@4.28.0
```

### Major Version Upgrades — Always Check Official Migration Docs

When upgrading across a **major version boundary** (e.g., `fastify` 5 → 6, `prisma` 6 → 7, `typescript-eslint` 8 → 9), the official migration guide is the primary source of truth for what needs to change in the project.

**Before running any upgrade command**, search for the package's official migration documentation:

1. **Check the package's official docs** — Look for a "Migration" or "Upgrading" page in the project's documentation site (e.g., `fastify.dev`, `prisma.io`, `typescript-eslint.io`, `eslint.org`).
2. **Check the GitHub releases page** — Major version releases often include a detailed migration guide or breaking changes section.
3. **Check the changelog** — Look for `BREAKING CHANGES` or `Migration` headings.

**What to do with the migration guide:**

- Read the migration guide **before** making any changes.
- Follow the guide's instructions exactly — they often include required config changes, renamed rules, removed APIs, or new peer dependencies.
- The migration guide dictates what needs to be updated in the project (e.g., updating route handlers for Fastify, regenerating Prisma client, updating TypeBox schemas, etc.).
- Do **not** guess what needs to change — always follow the official migration guide.

**Example workflow for a major version upgrade:**

```bash
# 1. Read the migration guide for the package
# 2. Follow the guide's instructions to update the project code
# 3. Update the package version
bun add <package-name>@<new-major-version>

# 4. Continue with the verification steps below
```

### Step 2: Reinstall from Lockfile

After updating the lockfile, reinstall to ensure `node_modules` matches:

```bash
bun install
```

### Step 3: Regenerate Prisma Client

Prisma's generated client must be rebuilt after any `@prisma/client` or `prisma` version change:

```bash
bun run prisma:generate
```

If Prisma itself was upgraded, also verify the schema is still compatible:

```bash
bunx --bun prisma validate
```

### Step 4: Fix Code Formatting

Dependency upgrades can shift formatting rules (especially Prettier and ESLint plugins). Auto-fix everything:

```bash
bun run lint:fix
```

This sorts JSON files and runs ESLint with `--fix`.

### Step 5: Run the Integrity Suite

The `integrity` script is the definitive post-upgrade check. It runs linting, unit tests with coverage, and acceptance tests in Docker:

```bash
bun run integrity
```

This executes `scripts/integrity.sh` which performs:

1. **Lint check**: `bun run lint`
2. **Unit tests with coverage**: `bun run test:coverage`
3. **Acceptance tests in Docker**: `docker compose --profile test up --build --attach acceptance-once --exit-code-from acceptance-once`

If all three pass, the upgrade is safe to commit.

## Common Post-Upgrade Failures & Fixes

### TypeScript Compilation Errors

**Symptom**: `tsc` or ESLint reports type errors after upgrading Fastify, Prisma, or TypeScript itself.

**Causes & Fixes**:

| Upgrade | Common Breakage | Fix |
|---------|----------------|-----|
| Fastify major | `FastifyInstance` type changes | Update route handler signatures; check `withTypeProvider<TypeBoxTypeProvider>()` still works |
| Prisma major | Generated client API changes | Run `prisma:generate`, update repository queries for new API |
| TypeScript major | Stricter checks | Fix type errors surfaced by new strictness; `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are already on |
| @sinclair/typebox | Schema API changes | Update `Type.*` calls; check for renamed or removed modifiers |
| ESLint / plugins | Rule renames or new rules | Fix new violations; update `.eslintrc` if needed |

**General approach**:

```bash
# See all type errors at once
npx tsc --noEmit

# Fix the most common ones first
bun run lint:fix
```

### Runtime Errors After Upgrade

**Symptom**: Tests pass but the app crashes on startup.

**Checklist**:
1. Did `prisma:generate` run? (Missing generated client is a common culprit)
2. Are environment variables still valid? (Some libraries change env var names in major versions)
3. Check `src/common/logger.ts` — Pino or pino-pretty upgrades can change serializer APIs
4. Check `src/infrastructure/cache.ts` and `rabbitMQ.ts` — client library major versions often change connection APIs

### Docker / Compose Failures

**Symptom**: Acceptance tests fail in Docker but pass locally.

**Causes**:
- Image base changed (`oven/bun:alpine` or `oven/bun:latest` updated)
- PostgreSQL, Redis, or RabbitMQ image updated with breaking changes
- New Bun version behaves differently in Alpine vs Debian

**Fix**: Check `Dockerfile` and `docker-compose.yml` for image version pins. Update base image tags if needed.

### Lockfile Conflicts

**Symptom**: `bun install --frozen-lockfile` fails after merging branches.

**Fix**:

```bash
# Regenerate from package.json
rm bun.lock
bun install
bun run lint:fix
bun run integrity
```

## Breaking Change Triage Strategy

When `bun run integrity` fails after a version bump, use this priority order:

1. **Read the changelogs** of the upgraded packages (Fastify, Prisma, TypeScript, TypeBox are the most likely culprits when major versions change)
2. **Fix TypeScript errors first** — they usually point to API changes
3. **Fix test failures second** — mocked APIs may have changed (e.g., Prisma client's mock shape)
4. **Fix lint errors last** — usually just formatting or new rule violations
5. **If stuck**, bisect by reverting `bun.lock` and upgrading packages one at a time to identify the culprit

## Committing the Upgrade

Once `bun run integrity` passes:

```bash
git add -A
git commit -m "chore(deps): update dependencies"
```

Include in the commit:
- `package.json` (updated version ranges)
- `bun.lock` (the new resolved lockfile)
- Any code changes required to fix breaking changes

## Important Rules

- **Never commit a broken state** — always run `bun run integrity` before committing
- **Always regenerate Prisma client** after any Prisma-related upgrade
- **Always run `lint:fix`** after upgrading formatting-related packages (Prettier, ESLint, etc.)
- **If upgrading Fastify or TypeBox**, verify the OpenAPI spec still generates correctly by checking `openapi.yaml`
- **When in doubt**, restore `bun.lock` from git and try a more targeted upgrade
- **Never modify `bunfig.toml`'s `minimumReleaseAge`** — this is a security boundary. If the user needs dependencies newer than the configured age limit, the user must manually update this value themselves. The agentic AI is not allowed to change it.
