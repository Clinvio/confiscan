# Multi-stage Dockerfile
# This file should produce ZERO findings
# All sensitive values use environment variable references or placeholder values

# Build stage
FROM node:18-alpine AS builder

# Build arguments
ARG NODE_ENV=production
ARG APP_VERSION=1.0.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@8

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Build arguments
ARG NODE_ENV=production
ARG APP_VERSION=1.0.0
ARG BUILD_DATE
ARG VCS_REF

# Labels
LABEL maintainer="Clinvio"
LABEL org.opencontainers.image.title="My Application"
LABEL org.opencontainers.image.description="A Node.js application"
LABEL org.opencontainers.image.version="${APP_VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@8

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create necessary directories
RUN mkdir -p logs uploads temp

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV APP_VERSION=${APP_VERSION}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

# Development stage
FROM node:18-alpine AS development

# Build arguments
ARG NODE_ENV=development

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@8

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads temp

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000
EXPOSE 9229

# Environment variables
ENV NODE_ENV=development
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application with hot reload
ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "dev"]

# Test stage
FROM node:18-alpine AS test

# Build arguments
ARG NODE_ENV=test

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@8

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads temp coverage

# Environment variables
ENV NODE_ENV=test
ENV PORT=3000

# Run tests
ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "test"]

# Builder stage for CI/CD
FROM node:18-alpine AS ci

# Build arguments
ARG NODE_ENV=test

# Install system dependencies
RUN apk add --no-cache \
  git \
  curl \
  bash

# Install pnpm
RUN npm install -g pnpm@8

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads temp coverage

# Environment variables
ENV NODE_ENV=test
ENV PORT=3000

# Default command
CMD ["pnpm", "test"]