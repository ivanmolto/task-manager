#!/bin/sh
set -e

echo "🔐 [Auth Service] Running database migrations..."
npx prisma migrate deploy

echo "🟢 [Auth Service] Starting application..."
exec node dist/main.js