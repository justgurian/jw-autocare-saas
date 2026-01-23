# Simplified Dockerfile that works standalone
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies
RUN npm install

# Copy source
COPY src ./src/
COPY tsconfig.json ./

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start with tsx (no build needed)
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx src/app.ts"]
