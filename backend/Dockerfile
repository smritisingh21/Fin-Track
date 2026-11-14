# Use official Node.js LTS image based on Alpine Linux for minimal image size
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package manifests for efficient layer caching
COPY package*.json ./

# Install dependencies (fallback to npm install if package-lock has optional differences)
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Ensure uploads directory exists for file attachments & avatar images
RUN mkdir -p uploads

# Expose backend port (default: 8000)
EXPOSE 8000

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=8000

# Start the Express server
CMD ["node", "server.js"]

