# -------------------------------------------------------
#  Base image
# -------------------------------------------------------
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies required for builds
RUN apk add --no-cache libc6-compat

# -------------------------------------------------------
#  Dependencies stage
# -------------------------------------------------------
FROM base AS deps

# Copy package files
COPY package*.json ./

# Install dependencies (use production flag for smaller image)
RUN npm ci --only=production && npm cache clean --force

# -------------------------------------------------------
#  Builder stage
# -------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies (for build)
COPY package*.json ./
RUN npm install

# Copy all project files into the image
COPY . .

# Build-time environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_WS_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_LANGUAGE

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_WS_BASE_URL=$NEXT_PUBLIC_WS_BASE_URL
ENV NEXT_PUBLIC_DEFAULT_LANGUAGE=$NEXT_PUBLIC_DEFAULT_LANGUAGE

# Build the Next.js app
RUN npm run build

# -------------------------------------------------------
#  Runner (Production) stage
# -------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Set up directories and permissions
RUN mkdir -p .next && chown nextjs:nodejs .next

# Copy only the necessary build output for production
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public folder if it exists (safe fallback)
RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/public ./public || true
RUN chmod -R 755 ./public || true

# Use non-root user
USER nextjs

# Expose app port
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js standalone server
CMD ["node", "server.js"]

# # Use Node 20 for better compatibility with Next.js 15 and React 19
# FROM node:20-alpine AS base

# # Install dependencies only when needed
# FROM base AS deps
# RUN apk add --no-cache libc6-compat
# WORKDIR /app

# # Copy package files
# COPY package.json ./
# # Install dependencies based on the preferred package manager
# RUN npm install --only=production && npm cache clean --force

# # Rebuild the source code only when needed
# FROM base AS builder
# WORKDIR /app
# COPY package.json ./
# RUN npm install

# COPY . .

# # Build-time environment variables (for NEXT_PUBLIC_ variables)
# ARG NEXT_PUBLIC_API_BASE_URL
# ARG NEXT_PUBLIC_WS_BASE_URL
# ARG NEXT_PUBLIC_DEFAULT_LANGUAGE

# ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
# ENV NEXT_PUBLIC_WS_BASE_URL=$NEXT_PUBLIC_WS_BASE_URL
# ENV NEXT_PUBLIC_DEFAULT_LANGUAGE=$NEXT_PUBLIC_DEFAULT_LANGUAGE

# # Build the application
# RUN npm run build

# # Production image, copy all the files and run next
# FROM base AS runner
# WORKDIR /app

# ENV NODE_ENV=production
# # Disable telemetry during runtime
# ENV NEXT_TELEMETRY_DISABLED=1

# # Create non-root user
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# # Set the correct permission for prerender cache
# RUN mkdir .next
# RUN chown nextjs:nodejs .next

# # Automatically leverage output traces to reduce image size
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# # Copy public directory with proper permissions (for static assets)
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# # Ensure public directory has correct permissions
# RUN chmod -R 755 ./public

# USER nextjs

# EXPOSE 3000

# ENV PORT=3000
# ENV HOSTNAME="0.0.0.0"

# CMD ["node", "server.js"]
