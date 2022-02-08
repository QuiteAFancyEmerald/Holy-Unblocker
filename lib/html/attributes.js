// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const attrs = [
    {
        tag: ['form', 'object', 'a', 'link', 'area', 'base', 'script', 'img', 'audio', 'video', 'input', 'embed', 'iframe', 'track', 'source', 'html', 'table', 'head'],
        attribute: ['src', 'href', 'ping', 'data', 'movie', 'action', 'poster', 'profile', 'background'],
        run: (node, data) => {
            (data.setAttribute || node.setAttribute.bind(node))(`corrosion-attr-${data.attr.name}`, data.attr.value);
            data.attr.value = data.ctx.url.wrap(data.attr.value, data.meta);
        },
    },
    {
        tag: 'iframe',
        attribute: 'srcdoc',
        run: (node, data) => {
            (data.setAttribute || node.setAttribute.bind(node))(`corrosion-attr-${data.attr.name}`, data.attr.value);
            data.attr.value = data.ctx.html.process(data.attr.value, data.meta);
        },
    },
    {
        tag: ['img', 'link', 'source'],
        attribute: ['srcset', 'imagesrcset'],
        run: (node, data) => {
            (data.setAttribute || node.setAttribute.bind(node))(`corrosion-attr-${data.attr.name}`, data.attr.value);
            data.attr.value = data.ctx.html.srcset(data.attr.value, data.meta);
        },
    },
    {
        tag: '*',
        attribute: 'style',
        run: (node, data) => {
            (data.setAttribute || node.setAttribute.bind(node))(`corrosion-attr-${data.attr.name}`, data.attr.value);
            data.attr.value = data.ctx.css.process(data.attr.value, data.meta);
        },
    },
    {
        tag: '*',
        attribute: ['http-equiv', 'integrity', 'nonce', 'crossorigin'],
        run: (node, data) => {
            (data.setAttribute || node.setAttribute.bind(node))(`corrosion-attr-${data.attr.name}`, data.attr.value);
            data.node.removeAttribute(data.attr.name);
        },
    },
];

module.exports = attrs;