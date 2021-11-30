const http = require('http');
const https = require('https');

function createWebSocketProxy(ctx) {
    return function onUpgrade(clientRequest, clientSocket, clientHead) {
        try {
            const urlData = ctx.url.unwrap(clientRequest.url, { flags: true, });
            urlData.value = new URL(urlData.value);
            const requestContext = {
                url: urlData.value,
                flags: urlData.flags,
                body: null,
                headers: { ...clientRequest.headers },
                method: clientRequest.method, 
                rewrite: ctx,
                agent: new ((urlData.value.protocol == 'https:' || ctx.config.forceHttps) ? https : http).Agent({
                    rejectUnauthorized: false,
                }),
                address: null,
                clientRequest,
                clientSocket,
                clientHead,
            };
            ctx.config.requestMiddleware.forEach(fn => fn(requestContext));
            ((requestContext.url.protocol == 'https:' || ctx.config.forceHttps) ? https : http).request({
                headers: requestContext.headers,
                method: requestContext.method,
                hostname: requestContext.url.hostname,
                port: requestContext.url.port,
                path: requestContext.url.pathname + requestContext.url.search,
                agent: requestContext.agent,
                localAddress: requestContext.address,
            }).on('upgrade', (remoteResponse, remoteSocket, remoteHead) => {
                let handshake = 'HTTP/1.1 101 Web Socket Protocol Handshake\r\n';
                for (let key in remoteResponse.headers) {
                    handshake += `${key}: ${remoteResponse.headers[key]}\r\n`;
                };
                handshake += '\r\n';
                clientSocket.write(handshake);
                clientSocket.write(remoteHead);
                remoteSocket.on('close', () => clientSocket.end());
                clientSocket.on('close', () => remoteSocket.end());
                remoteSocket.on('error', () => clientSocket.end());
                clientSocket.on('error', () => remoteSocket.end());
                remoteSocket.pipe(clientSocket);
                clientSocket.pipe(remoteSocket);
            }).on('error', () => {
                clientSocket.end()
            }).end();
        } catch(err) {
            clientSocket.end();
        };  
    };
};

module.exports = createWebSocketProxy;