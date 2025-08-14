FROM node:20-alpine

WORKDIR /

# Copy files needed for a fresh install
COPY package*.json ./
COPY ./lib/rammerhead/package*.json ./lib/rammerhead/

RUN npm run fresh-install

COPY . .

RUN npm run build

COPY . .

EXPOSE 8080

CMD ["node", "backend.js"]