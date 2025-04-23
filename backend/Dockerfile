FROM node:18-bookworm-slim

# Create a non-root user
RUN useradd -ms /bin/bash -u 1001 app
USER app

WORKDIR /app

# Install deps first
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY --chown=app:app . .

CMD ["npm", "run", "dev"]
