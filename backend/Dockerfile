FROM node:18-bookworm-slim

WORKDIR /app

# Install deps first
COPY package*.json ./

RUN npm ci

# Copy rest of the app
COPY . .

CMD ["npm", "run", "prod"]
