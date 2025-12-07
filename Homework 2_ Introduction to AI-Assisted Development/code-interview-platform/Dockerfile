# Multi-stage Dockerfile for Code Interview Platform
# Combines Next.js frontend and Express backend into a single container

# ============================================
# Stage 1: Build Next.js Frontend
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY next.config.js ./
COPY vitest.config.js ./
COPY vitest.setup.js ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source code
COPY app ./app
COPY components ./components
COPY lib ./lib

# Copy public folder (now exists with .gitkeep)
RUN mkdir -p public
COPY public ./public

# Build Next.js for production (static export)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================
# Stage 2: Setup Backend
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies (production only)
RUN npm ci --only=production

# ============================================
# Stage 3: Final Production Image
# ============================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

# Copy backend dependencies from builder
COPY --from=backend-builder /app/node_modules ./node_modules

# Copy backend package.json (has "type": "module" for ES modules)
COPY backend/package.json ./package.json

# Copy backend source code
COPY backend/server.js ./server.js
COPY backend/RoomManager.js ./RoomManager.js
COPY backend/.env.example ./.env

# Copy Next.js build output from frontend builder
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/node_modules ./frontend_node_modules

# Copy frontend package.json and config for Next.js (stored separately)
COPY --from=frontend-builder /app/package.json ./frontend_package.json
COPY --from=frontend-builder /app/next.config.js ./next.config.js

# Create startup script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose ports
# 3001 - Backend API & WebSocket
# 3000 - Next.js Frontend
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start both frontend and backend
CMD ["./docker-entrypoint.sh"]
