# Build stage - use slim instead of alpine to avoid native module issues
FROM --platform=linux/amd64 node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove existing lockfile and reinstall for this platform
RUN rm -f package-lock.json && npm install

# Copy source code (node_modules excluded via .dockerignore)
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx config inline
RUN echo 'server { \n\
    listen 80; \n\
    server_name localhost; \n\
    root /usr/share/nginx/html; \n\
    index index.html; \n\
    \n\
    gzip on; \n\
    gzip_types text/plain text/css application/json application/javascript text/xml; \n\
    \n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ { \n\
        expires 1y; \n\
        add_header Cache-Control "public, immutable"; \n\
        try_files $uri =404; \n\
    } \n\
    \n\
    location / { \n\
        try_files $uri $uri/ /index.html; \n\
    } \n\
    \n\
    location /health { \n\
        access_log off; \n\
        return 200 "healthy\\n"; \n\
        add_header Content-Type text/plain; \n\
    } \n\
}' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
