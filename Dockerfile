FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
ENV NODE_ENV build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build \
    && npm prune --omit=dev

FROM node:20-alpine AS runner
ENV NODE_ENV production
WORKDIR /app
COPY --from=deps --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/dist/ ./dist/
COPY --from=builder --chown=node:node /app/node_modules/ ./node_modules/
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "run", "start"]