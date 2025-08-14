FROM node:20.17.0-bookworm-slim

WORKDIR /

COPY package*.json ./

RUN npm config set unsafe-perm true \
    && npm set registry https://registry.npmjs.org/ \
    && npm config set fetch-retries 5 \
    && npm install --verbose

COPY . .

EXPOSE 8080

CMD ["npm", "run", "fresh-start"]
