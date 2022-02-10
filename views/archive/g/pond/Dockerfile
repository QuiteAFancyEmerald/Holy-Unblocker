FROM node:6.6.0

COPY npm-shrinkwrap.json /tmp/
COPY package.json /tmp/
RUN mkdir -p /opt/app && \
    cd /opt/app && \
    cp /tmp/npm-shrinkwrap.json . && \
    cp /tmp/package.json . && \
    npm install --production --unsafe-perm --loglevel warn

COPY . /opt/app

WORKDIR /opt/app

CMD ["npm", "start"]
