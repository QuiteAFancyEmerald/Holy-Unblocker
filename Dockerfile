FROM node:20

WORKDIR /app

# Update the label/metadata if you'd like, or keep it as is.

# CHANGE THIS LINE: Use apt-get instead of apk
RUN apt-get update && apt-get install -y tor bash && rm -rf /var/lib/apt/lists/*

COPY . .

# These remain the same
RUN npm run fresh-install
RUN npm run build

EXPOSE 8080 9050 9051

COPY serve.sh /serve.sh
RUN chmod +x /serve.sh

CMD ["/serve.sh"]
