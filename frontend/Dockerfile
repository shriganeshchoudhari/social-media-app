# ─────────────────────────────────────────────────────────────────────────────
# ConnectHub Frontend — Dockerfile
#
# Development mode: runs Vite dev server (hot-reload, proxy to backend).
# This is suitable for local Docker Compose use.
#
# For production, switch to the nginx multi-stage build commented at the bottom.
#
# Build locally:
#   docker build -t connecthub-frontend ./frontend
#
# Run locally (without Compose):
#   docker run -p 3001:3001 connecthub-frontend
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3001

# Run Vite dev server, binding to all interfaces so Docker port mapping works
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]


# ─────────────────────────────────────────────────────────────────────────────
# PRODUCTION BUILD (multi-stage with nginx)
# Uncomment this block and comment out everything above for production use.
# ─────────────────────────────────────────────────────────────────────────────
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package.json package-lock.json* ./
# RUN npm install
# COPY . .
# RUN npm run build
#
# FROM nginx:alpine AS runtime
# COPY --from=builder /app/dist /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
