FROM node:20-alpine

WORKDIR /

COPY . .

RUN npm run fresh-install
RUN npm run build

EXPOSE 8080

CMD ["node", "backend.js"]