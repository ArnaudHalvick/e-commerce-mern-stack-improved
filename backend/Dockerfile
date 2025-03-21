FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create and set permissions for logs directory
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["node", "server.js"] 