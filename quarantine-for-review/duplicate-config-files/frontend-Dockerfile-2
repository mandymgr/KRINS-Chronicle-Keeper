# React Frontend Dockerfile for KRINS-Chronicle-Keeper
# Multi-stage build for development and production

FROM node:20-slim as base

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Development stage
FROM base as development

# Install all dependencies including dev dependencies
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Development command with hot reload
CMD ["bun", "run", "dev", "--host", "0.0.0.0"]

# Build stage
FROM base as builder

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM nginx:alpine as production

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]