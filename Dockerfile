FROM oven/bun:alpine AS deps
WORKDIR /app
COPY bun.lock package.json ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile --ignore-scripts

FROM oven/bun:latest AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY .env.production .env
COPY . .
RUN bun run prisma:generate
RUN bun run build

FROM oven/bun:latest AS runner
ARG API_PORT=3000
ENV API_PORT=${API_PORT}
WORKDIR /app

COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env .env
COPY package.json ./
EXPOSE ${API_PORT}
CMD ["bun", "dist/app.js"]