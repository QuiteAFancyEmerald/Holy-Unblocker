# ────────────────────────────────────────────────
# Base image: lightweight Node 20 on Alpine
# ────────────────────────────────────────────────
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Metadata / OCI labels – SCBypass branding
LABEL org.opencontainers.image.title="SCBypass" \
      org.opencontainers.image.description="Secure, fast web proxy / unblocker – bypass filters with strong privacy & evasion features" \
      org.opencontainers.image.version="6.9.4" \
      org.opencontainers.image.authors="holy.nik.offz" \
      org.opencontainers.image.source="https://www.tiktok.com/@holy.nik.offz" \
      org.opencontainers.image.url="https://discord.gg/TnPCzYWZAP"

# Install runtime + build dependencies
RUN apk add --no-cache \
    tor \
    bash \
    git \
    python3 \
    py3-pip \
    make \
    g++ \
    wget \
    && rm -rf /var/cache/apk/*

# Copy project files
COPY . .

# Install ALL dependencies (Rammerhead, UV, Scramjet, Fastify, etc.)
RUN npm install --legacy-peer-deps

# Build SCBypass (ignore build errors if optional)
RUN npm run build || true

# Expose main proxy port + Tor ports
EXPOSE 8080 9050 9051

# Copy startup script
COPY serve.sh /serve.sh
RUN chmod +x /serve.sh

# Healthcheck – Fly.io uses this to detect readiness
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

# Start command
CMD ["/serve.sh"]
