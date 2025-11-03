# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY api_endpoints/package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY api_endpoints/ ./

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]