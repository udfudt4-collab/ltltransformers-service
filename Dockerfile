# -------------------------------------------------------------------
# Multi-stage Dockerfile for LTL Transformer Management Portal (TanStack Start / Nitro)
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

# Copy compiled production output (server + static assets)
COPY --from=builder /app/.output ./.output

# Expose standard web port
EXPOSE 8080

# Start compiled high-performance Node server
CMD ["node", ".output/server/index.mjs"]

