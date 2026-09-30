# -------------------------------------------------------------------
# Multi-stage Dockerfile for LTL Transformer Management Portal (TanStack Start / Vite)
# -------------------------------------------------------------------

# Stage 1: Build dependencies & production assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* bun.lock* ./

# Install npm dependencies (using clean install where possible)
RUN npm install --legacy-peer-deps

# Copy source code and public assets
COPY . .

# Build application bundle
RUN npm run build

# -------------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# -------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Copy necessary production artifacts from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public

# Copy build outputs (dist / .output / server depending on bundler)
COPY --from=builder /app ./

# Expose standard Fly.io web port
EXPOSE 8080

# Start production server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "8080"]
