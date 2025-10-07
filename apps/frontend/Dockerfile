# -------------------------------
# 1. Base image
# -------------------------------
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# -------------------------------
# 2. Dependencies (install only needed)
# -------------------------------
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy only the package files to install deps efficiently
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

# -------------------------------
# 3. Builder (build Next.js app)
# -------------------------------
FROM base AS builder
WORKDIR /app

# Copy dependency files and install full dependencies (for build)
COPY package*.json ./
RUN npm install

# Copy the full source code
COPY . .

# Build-time environment variables for NEXT_PUBLIC_* values
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_WS_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_LANGUAGE

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_WS_BASE_URL=$NEXT_PUBLIC_WS_BASE_URL
ENV NEXT_PUBLIC_DEFAULT_LANGUAGE=$NEXT_PUBLIC_DEFAULT_LANGUAGE

# Build the Next.js app
RUN npm run build

# -------------------------------
# 4. Runner (production container)
# -------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public assets only if the folder exists
RUN mkdir -p ./public
COPY --from=builder --chown=nextjs:nodejs /app/public ./public || true

USER nextjs

EXPOSE 3000

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
