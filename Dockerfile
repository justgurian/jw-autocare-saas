# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files
COPY apps/web/package*.json ./apps/web/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci

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

# Copy custom nginx config template
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy built files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Use PORT from environment (Railway standard), default to 80
ENV PORT=80

# Expose port
EXPOSE 80

# Create startup script that configures nginx with the correct port
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo 'sed "s/listen 80;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]
