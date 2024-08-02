module.exports = (reqPath) => ((reqPath || '').match(/^(?:[a-z0-9]+:\/\/[^/]+)?\/([a-z0-9]{32})/i) || [])[1];
