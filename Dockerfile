FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]

# Build and Run Commands

# docker build -t holyunblocker .
# docker run -p 8080:8080 holyunblocker