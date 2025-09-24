FROM node:20-alpine

WORKDIR /app

LABEL org.opencontainers.image.title="Holy Unblocker LTS" \
      org.opencontainers.image.description="An effective, privacy-focused web proxy service" \
      org.opencontainers.image.version="6.9.3" \
      org.opencontainers.image.authors="Holy Unblocker Team" \
      org.opencontainers.image.source="https://github.com/QuiteAFancyEmerald/Holy-Unblocker/"

RUN apk add --no-cache tor bash

COPY . .

RUN npm run fresh-install
RUN npm run build

EXPOSE 8080 9050 9051

COPY serve.sh /serve.sh
RUN chmod +x /serve.sh

CMD ["/serve.sh"]
