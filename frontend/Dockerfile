FROM node:18-bookworm-slim as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code (this should include .env but it might be excluded from the build context)
COPY . .

# Use ARG to set environment at build time
ARG REACT_APP_ENV=production
ENV REACT_APP_ENV=${REACT_APP_ENV}

# Set environment variables directly without depending on .env file
ENV REACT_APP_API_URL=https://159.65.230.12:4443
ENV REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51POLLYP4vWrJMwjYSab2mjfjTHapAaoMKrHderrbS8aOyuykkduvF0sPdBB6VpulZCmMxGfRd3NpmGHFE3D9RAEK0038a5wjiI

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