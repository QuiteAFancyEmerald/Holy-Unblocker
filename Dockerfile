FROM node:20-alpine

WORKDIR /

COPY package*.json ./

COPY . .
RUN npm run fresh-install
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "manual-start"]