FROM node:20-alpine

WORKDIR /

COPY package*.json ./

COPY . .
RUN npm run fresh-install

EXPOSE 8080

CMD ["npm", "start"]
