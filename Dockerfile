FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y python3 build-essential

COPY package.json ./

ENV npm_config_unsafe_perm=true
RUN npm set registry https://registry.npmjs.org/
RUN npm config set fetch-retries 5
RUN npm install --verbose

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
