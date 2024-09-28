FROM node:20

WORKDIR /app

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


# Build and Run Commands

# docker build -t holyunblocker .
# docker run -p 8080:8080 holyunblocker