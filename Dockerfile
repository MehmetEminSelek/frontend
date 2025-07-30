# Frontend Dockerfile - Production Ready
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build Vue.js application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy assets separately to ensure they're available
COPY --from=builder /app/src/assets /usr/share/nginx/html/assets
COPY --from=builder /app/src/logos /usr/share/nginx/html/logos

# Create non-root user
RUN addgroup -g 1001 -S frontend
RUN adduser -S frontend -u 1001

# Update nginx to run as non-root
RUN touch /var/run/nginx.pid && \
    chown -R frontend:frontend /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /var/run/nginx.pid

# Switch to non-root user
USER frontend

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"] 