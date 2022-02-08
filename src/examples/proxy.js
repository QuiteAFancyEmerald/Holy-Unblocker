const http = require('http');
const express = require('express');
const corrosion = require('corrosion');
const app = express();
const port = process.env.PORT || 8443;
const server = http.createServer(app);
const examples = ['accounts.google.com', 'example.com'];

let blacklist;
const fetch = (...t) =>
    import ("node-fetch").then(({ default: e }) => e(...t));
fetch("https://blocklistproject.github.io/Lists/alt-version/everything-nl.txt").then(t => t.text()).then(t => { blacklist = t.split("\n") && examples });

const proxy = new corrosion({
    title: 'Untitled Document',
    prefix: '/search/',
    codec: 'xor',
    ws: true,
    requestMiddleware: [
        corrosion.middleware.blacklist(blacklist, 'Service not allowed due to bot protection! Make sure you are not trying to verify on a proxy.'),
    ],
});

proxy.bundleScripts();
server.listen(port);