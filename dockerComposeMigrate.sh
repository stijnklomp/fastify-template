#!/bin/sh
export DATABASE_URI="postgresql://$DATABASE_USERNAME:$DATABASE_PASSWORD@db:$DATABASE_PORT/$DATABASE_DB?schema=template"

# Install dependencies if node_modules is missing
if [ ! -d node_modules ]; then
  npm ci --force
fi

# Wait for PostgreSQL to be available
while ! nc -z db 5432; do
  echo "Waiting for Postgres..."
  sleep 5
done

echo "Postgres is up - running migrations"

# Run migrations
npm run migrate
