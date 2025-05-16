FROM node:18-bookworm-slim AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Use ARG to set environment at build time
ARG VITE_ENV=production
ARG VITE_API_URL
ARG VITE_BASE_PATH=/

# Set environment variables from ARGs
ENV VITE_ENV=${VITE_ENV}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
# Make sure IS_DOCKER is explicitly false for production builds
ENV VITE_IS_DOCKER=false

# Replace API URL with placeholder for runtime configuration
RUN if [ -n "$VITE_API_URL" ]; then \
      echo "Setting API URL placeholder for: $VITE_API_URL"; \
      find src -type f -name "*.jsx" -o -name "*.js" -o -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|${VITE_API_URL}|VITE_API_URL_PLACEHOLDER|g"; \
    fi

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy the built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY admin-nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Add a directory for secrets
RUN mkdir -p /run/secrets

# Create volume mount point
VOLUME /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 