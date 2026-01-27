#!/bin/bash
set -e

echo "=== Starting JW Auto Care API ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Current directory: $(pwd)"
echo "Files in directory: $(ls -la)"

echo ""
echo "=== Running Prisma migrations ==="
npx prisma migrate deploy --schema=prisma/schema.prisma

echo ""
echo "=== Starting application with tsx ==="
exec ./node_modules/.bin/tsx src/app.ts
