FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .
ENV NODE_ENV build
RUN npm run build \
    && npm prune --omit=dev

FROM node:20-alpine AS runner
ENV NODE_ENV production
WORKDIR /app
COPY --from=builder --chown=node:node /app/dist/ ./dist/
COPY --from=builder --chown=node:node /app/node_modules/ ./node_modules/
EXPOSE 3000
ENV PORT 3000
CMD ["node", "dist/app.js"]