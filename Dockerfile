# Stage 1: Build the Node.js application
# Use a slim Node.js base image for smaller final image size
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This allows Docker to cache the npm install step if dependencies haven't changed
COPY package.json package-lock.json ./

# Install Node.js dependencies
# `npm ci` is preferred for CI/CD environments as it uses package-lock.json for exact versions
RUN npm ci --production

# Copy the rest of your application code
# The '.' copies everything from the current directory on your host to /app in the container
COPY . .

# Your application runs on port 3000 as defined in your server.js (process.env.PORT || 3000)
# This instructs Docker that the container will listen on the specified network port at runtime.
EXPOSE 3000

# Command to run the application when the container starts
# Using 'node server.js' directly rather than 'npm start' to ensure proper signal handling
CMD ["node", "server.js"]
