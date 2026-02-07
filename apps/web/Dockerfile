# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies (--ignore-scripts avoids postinstall failures from dev tools like @railway/cli)
RUN npm ci --ignore-scripts

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

# Build args for environment variables
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
WORKDIR /app/apps/web
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Limit nginx workers to 2 (default 'auto' spawns one per vCPU which is excessive on Railway)
# Use a regex-compatible sed to handle any whitespace between 'worker_processes' and 'auto'
RUN sed -i 's/worker_processes.*auto;/worker_processes 2;/' /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
