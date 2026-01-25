<<<<<<< HEAD
# Multi-stage build for Next.js
# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./standalone
COPY --from=builder /app/.next/static ./standalone/.next/static

# Set permissions
RUN chown -R nextjs:nodejs /app
=======
# Quantum Pi Forge Production Dockerfile
# Multi-stage build for Next.js + Express API

# ===========================================
# Stage 1: Frontend Builder (Next.js)
# ===========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/ 2>/dev/null || echo "No client package.json"

# Install dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# ===========================================
# Stage 2: API Builder (Express.js)
# ===========================================
FROM node:18-alpine AS api-builder
WORKDIR /app/api

# Copy API package files
COPY api/package*.json ./

# Install API dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy API source
COPY api/ .

# ===========================================
# Stage 3: Production Runner
# ===========================================
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy built frontend from frontend-builder
COPY --from=frontend-builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=frontend-builder --chown=nextjs:nodejs /app/public ./public
COPY --from=frontend-builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=frontend-builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy API from api-builder
COPY --from=api-builder --chown=nextjs:nodejs /app/api ./api

# Copy production environment template
COPY --chown=nextjs:nodejs .env.production .env.production
>>>>>>> fix/dep-ci-uvicorn-port

# Switch to non-root user
USER nextjs

<<<<<<< HEAD
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if(r.statusCode!==200)throw new Error()})"

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "standalone/server.js"]
=======
# Expose ports
EXPOSE 3000 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start both services
COPY --chown=nextjs:nodejs start.sh .
RUN chmod +x start.sh

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["./start.sh"]
>>>>>>> fix/dep-ci-uvicorn-port
