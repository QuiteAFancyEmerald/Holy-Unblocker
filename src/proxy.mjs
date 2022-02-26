import { readFile } from 'fs/promises';
import corrosion from 'corrosion';

const config = JSON.parse(await readFile(new URL('./config.json',
    import.meta.url)));

let blacklist;

const fetch = (...args) =>
    import ('node-fetch').then(({ default: fetch }) => fetch(...args));

fetch("https://blocklistproject.github.io/Lists/alt-version/everything-nl.txt").then(response => response.text()).then(data => {
    blacklist = data.split("\n") && config.blacklist;
});

export const proxy = new corrosion({
    title: config.title,
    prefix: config.prefix || '/service/',
    codec: config.codec || 'xor',
    ws: config.ws,
    requestMiddleware: [
        corrosion.middleware.blacklist(blacklist, 'Service not allowed due to bot protection! Make sure you are not trying to verify on a proxy.'),
    ],
});