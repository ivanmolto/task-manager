# Base image
FROM node:20-alpine AS base

# Install libc6-compat for SWC/Next.js image optimization
RUN apk add --no-cache libc6-compat

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
# Install dependencies (fallback for monorepos if lockfile is missing)
RUN pnpm install --frozen-lockfile || pnpm install

# Build stage
FROM base AS builder
WORKDIR /app

# COPY ALL SOURCE CODE FIRST
COPY . .

# COPY LINUX NODE_MODULES SECOND
# This forcefully overwrites any broken local node_modules that sneak in
COPY --from=deps /app/node_modules ./node_modules

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

# Set environment variables for build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the application (Standalone mode must be enabled in next.config.ts)
RUN pnpm build

# Production stage
FROM base AS runner
ENV NODE_ENV=production
# Disable Next.js telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]