FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache \
    tor bash git python3 py3-pip make g++ wget \
    && npm install -g pnpm@9 \
    && rm -rf /var/cache/apk/*

COPY . .

# Install main dependencies
RUN pnpm install --shamefully-hoist

# Install Rammerhead dependencies
RUN cd lib/rammerhead && pnpm install --shamefully-hoist

# Build SCBypass + Rammerhead
RUN pnpm run build || true

EXPOSE 8080 9050 9051

COPY serve.sh /serve.sh
RUN chmod +x /serve.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["/serve.sh"]
