FROM node:20-alpine

WORKDIR /

# Copy files needed for a fresh install
COPY package*.json ./
COPY ./lib/rammerhead/package*.json ./

RUN npm run fresh-install

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "manual-start"]