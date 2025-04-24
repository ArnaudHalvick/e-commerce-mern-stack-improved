FROM node:18-bookworm-slim

WORKDIR /app

# Install deps first
COPY package*.json ./

RUN npm ci

# Copy rest of the app
COPY . .

# Use ARG to accept environment setting at build time
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Default command uses the NODE_ENV set at build time
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = \"development\" ]; then npm run dev; else npm run prod; fi"]
