FROM node:18-bookworm-slim

WORKDIR /app

# Install deps first
COPY package*.json ./

RUN npm ci

# Copy rest of the app
COPY . .

# Add execute permission to entrypoint script
RUN chmod +x ./docker-entrypoint.sh

# Create required directories
RUN mkdir -p /app/upload/images/placeholders

# Use ARG to accept environment setting at build time
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Expose both HTTP and HTTPS ports
EXPOSE 4000 4443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

# Set the entrypoint to our script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
