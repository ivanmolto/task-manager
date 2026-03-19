#!/bin/sh
set -e

echo "🚀 [Task Service] Running database migrations..."
npx prisma migrate deploy

echo "🟢 [Task Service] Starting application..."
exec node dist/main.js