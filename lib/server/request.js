const http = require('http');
const https = require('https');
function createRequestProxy(ctx) {
    return async function onRequest(clientRequest, clientResponse) {
        try {
            if (new RegExp(`^${ctx.prefix}gateway/?`).test(clientRequest.url)) return ctx.gateway(clientRequest, clientResponse);
            if (clientRequest.url.startsWith(`${ctx.prefix}index.js`)) {
                clientResponse.setHeader('Content-Type', 'application/javascript');
                return clientResponse.end(ctx.script);
            };
            const urlData = ctx.url.unwrap(clientRequest.url, { flags: true, leftovers: true, });
            urlData.value = new URL(urlData.value);
            const requestContext = {
                url: urlData.value,
                flags: urlData.flags,
                origin: ((clientRequest.socket.encrypted || ctx.config.forceHttps) ? 'https://' : 'http://') + clientRequest.headers.host,
                body: await getChunks(clientRequest),
                headers: { ...clientRequest.headers },
                method: clientRequest.method, 
                rewrite: ctx,
                agent: new ((urlData.value.protocol == 'https:' || ctx.config.forceHttps) ? https : http).Agent({
                    rejectUnauthorized: false,
                }),
                address: null,
                clientRequest,
                clientResponse,
            };
            for (let i in ctx.config.requestMiddleware) ctx.config.requestMiddleware[i](requestContext);
            if (clientResponse.writableEnded) return;
            ((requestContext.url.protocol == 'https:' || ctx.config.forceHttps) ? https : http).request({
                headers: requestContext.headers,
                method: requestContext.method,
                hostname: requestContext.url.hostname,
                port: requestContext.url.port,
                path: requestContext.url.pathname + requestContext.url.search,
                agent: requestContext.agent,
                localAddress: requestContext.address,
                rejectUnauthorized: false,
            }, async remoteResponse => {
                const responseContext = {
                    url: requestContext.url,
                    flags: requestContext.flags,
                    origin: requestContext.origin,
                    body: await getChunks(remoteResponse),
                    headers: { ...remoteResponse.headers },
                    statusCode: remoteResponse.statusCode,
                    agent: requestContext.agent,
                    address: requestContext.address,
                    method: requestContext.method,
                    rewrite: ctx,
                    clientRequest,
                    clientResponse,
                    remoteResponse,
                }; 
                for (let i in ctx.config.responseMiddleware) ctx.config.responseMiddleware[i](responseContext);
                if (clientResponse.writableEnded) return;
                clientResponse.writeHead(responseContext.statusCode, responseContext.headers);
                clientResponse.end((responseContext.body || ''));
            }).on('error', err => {
                if (clientResponse.writableEnded) return;
                clientResponse.setHeader('Content-Type', 'text/plain');
                clientResponse.end(err.toString())
            }).end(requestContext.body);
        } catch(err) {
            if (clientResponse.writableEnded) return;
            clientResponse.setHeader('Content-Type', 'text/plain');
            clientResponse.end(err.toString());
        };  
    };
};

function getChunks(stream) {
    const chunks = [];
    return new Promise(resolve => 
        stream.on('data', chunk => 
            chunks.push(chunk)
        ).on('end', () => 
            chunks.length ? resolve(Buffer.concat(chunks)) : resolve(null)
        )
    );
};

module.exports = createRequestProxy;