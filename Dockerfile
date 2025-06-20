FROM node:20

WORKDIR /app

# Install Python and build tools for node-gyp
RUN apt-get update && apt-get install -y python3 build-essential

COPY package.json ./

RUN npm config set unsafe-perm true
RUN npm set registry https://registry.npmjs.org/
RUN npm config set fetch-retries 5
RUN npm install --verbose

# Copy the rest of the project files
COPY . .

# Expose the port
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
