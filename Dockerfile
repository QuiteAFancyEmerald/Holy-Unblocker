FROM node:20-alpine

WORKDIR /app

LABEL org.opencontainers.image.title="SCBypass" \
      org.opencontainers.image.description="Secure web proxy / unblocker" \
      org.opencontainers.image.version="6.9.4" \
      org.opencontainers.image.authors="holy.nik.offz"

RUN apk add --no-cache \
    tor bash git python3 py3-pip make g++ wget \
    && npm install -g pnpm@9 \
    && rm -rf /var/cache/apk/*

COPY . .

RUN pnpm install --shamefully-hoist --ignore-scripts

RUN pnpm run build || true

EXPOSE 8080 9050 9051

COPY serve.sh /serve.sh
RUN chmod +x /serve.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["/serve.sh"]
