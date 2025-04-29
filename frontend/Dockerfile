FROM node:18-bookworm-slim AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Use ARG to set environment at build time
ARG REACT_APP_ENV=production
ARG REACT_APP_API_URL
ARG REACT_APP_STRIPE_PUBLISHABLE_KEY

# Set environment variables from ARGs
ENV REACT_APP_ENV=${REACT_APP_ENV}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_STRIPE_PUBLISHABLE_KEY=${REACT_APP_STRIPE_PUBLISHABLE_KEY}

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Create the cache directory for nginx
RUN mkdir -p /var/cache/nginx/images

# Copy the built app
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configurations
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

# Add healthcheck to make orchestration more robust
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"] 