FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts

FROM node:20-alpine AS builder
ENV NODE_ENV build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV production
ENV PORT 3000
WORKDIR /app
COPY --from=deps --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/dist/ ./dist/
COPY --from=builder --chown=node:node ./node_modules/@fastify/swagger-ui/static ./dist/static
EXPOSE 3000
CMD ["npm", "run", "start"]