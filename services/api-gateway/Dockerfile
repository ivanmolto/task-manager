FROM node:20-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS deps
COPY package.json ./
# Using standard npm here bypasses all monorepo symlink issues!
RUN npm install

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# The standard build command will now find NestJS perfectly
RUN npm run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Install ONLY production dependencies
COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER nestjs

EXPOSE 4000

CMD ["node", "dist/main.js"]