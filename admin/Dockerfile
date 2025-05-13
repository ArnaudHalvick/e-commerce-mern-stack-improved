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
ARG VITE_BASE_PATH=/admin/

# Set environment variables from ARGs
ENV VITE_ENV=${VITE_ENV}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

# Replace API URL with placeholder for runtime configuration
RUN if [ -n "$VITE_API_URL" ]; then \
      echo "Setting API URL placeholder for: $VITE_API_URL"; \
      find src -type f -name "*.jsx" -o -name "*.js" -o -name "*.tsx" -o -name "*.ts" | xargs sed -i "s|${VITE_API_URL}|VITE_API_URL_PLACEHOLDER|g"; \
    fi

# Build the app
RUN npm run build

# Create volume mount point
VOLUME /app/dist

# Command just to keep container running if needed for development
CMD ["tail", "-f", "/dev/null"] 