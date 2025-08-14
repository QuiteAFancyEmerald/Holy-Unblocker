FROM node:20-alpine

WORKDIR /

COPY package*.json ./

RUN npm run fresh-install
RUN npm run build

COPY . .

EXPOSE 8080

CMD ["npm", "run", "manual-start"]