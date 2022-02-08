// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const parse5 = require('parse5');
const rawAttrs = require('./attributes');
const { iterate } = require('./parse5');

class HTMLRewriter {
    constructor(ctx) {
        const master = this;
        this.ctx = ctx;
        this.attrs = new Map();
        rawAttrs.forEach(({ tag, attribute, run }) => {
            if (Array.isArray(tag)) {
                for (const entry of tag) processAttribute(entry, attribute, run);
            } else {
                processAttribute(tag, attribute, run);
            };
        });
        function processAttribute(tag, attribute, run) {
            if (!master.attrs.has(tag)) master.attrs.set(tag, {});
            if (Array.isArray(attribute)) {
                for (const entry of attribute) master.attrs.get(tag)[entry] = run;
            } else {
                master.attrs.get(tag)[attribute] = run;
            };
        };
    };
    process(source, config = {}) {
        try {
            const ast = parse5[config.document ? 'parse' : 'parseFragment'](source);
            let head = null;
            iterate(ast, node => {
                if (!node.tagName) return false;
                if (!!node.textContent) {
                    switch(node.nodeName) {
                        case 'title':
                            if (this.ctx.config.title) {
                                node.setAttribute('corrosion-text', node.textContent);
                                node.textContent = this.ctx.config.title;
                            };
                            break;
                        case 'script':
                            node.textContent = this.ctx.js.process(node.textContent);
                            break;
                        case 'style':
                            node.textContent = this.ctx.css.process(node.textContent, { meta: config.meta });
                            break;
                        case 'noscript':
                            node.textContent = this.process(node.textContent, { meta: config.meta || {}, });
                            break;
                    
                    };
                };
                if (config.document && node.tagName == 'HEAD') head = node;
                for (const attr of node.attrs) {
                    let data = {
                        ctx: this.ctx,
                        attr,
                        node,
                        meta: config.meta,
                        delete: false,
                    };
                    if (this.attrs.get('*')[attr.name]) this.attrs.get('*')[attr.name](node, data);
                    if (this.attrs.has(node.nodeName) && this.attrs.get(node.nodeName)[attr.name]) this.attrs.get(node.nodeName)[attr.name](node, data);
                };
            });
            if (config.document && head) {
                head.childNodes.unshift(
                    { 
                        nodeName: 'title', 
                        tagName: 'title', 
                        childNodes: [ 
                            {
                                nodeName: '#text',
                                value: this.ctx.config.title || '',
                            } 
                        ], 
                        attrs: [],
                    },
                    { 
                        nodeName: 'script', 
                        tagName: 'script', 
                        childNodes: [], 
                        attrs: [
                            {
                                name: 'src',
                                value: this.ctx.prefix + 'index.js',
                            },
                        ],
                    },
                    { 
                        nodeName: 'script', 
                        tagName: 'script', 
                        childNodes: [
                            {
                                nodeName: '#text',
                                value: `window.$corrosion = new Corrosion({ window, codec: '${this.ctx.config.codec || 'plain'}',  prefix: '${this.ctx.prefix}', ws: ${this.ctx.config.ws}, cookie: ${this.ctx.config.cookie}, title: ${typeof this.ctx.config.title == 'boolean' ? this.ctx.config.title : '\'' + this.ctx.config.title + '\''}, }); $corrosion.init(); document.currentScript.remove();`
                            },
                        ], 
                        attrs: [],
                    }
                )
            };
            return parse5.serialize(ast);
        } catch(e) {
            return source;
        };
    };
    source(processed, config = {}) {
        const ast = parse5[config.document ? 'parse' : 'parseFragment'](processed);
        iterate(ast, node => {
            if (node.nodeName == 'noscript') node.textContent = this.source(node.textContent);
            for (const attr of node.attrs) {
                if (attr.name.startsWith('corrosion-attr-')) { 
                    node.setAttribute(attr.name.slice('corrosion-attr-'.length), attr.value);
                    node.removeAttribute(attr.name);
                };
                if (attr.name.startsWith('corrosion-text')) {
                    node.textContent = attr.value;
                    node.removeAttribute(attr.name);
                };
            };
        });
        return parse5.serialize(ast);
    };
    srcset(val, meta = {}) {
        return val.split(',').map(src => {
            const parts = src.trimStart().split(' ');
            if (parts[0]) parts[0] = this.ctx.url.wrap(parts[0], meta);
            return parts.join(' ');
        }).join(', ');
    };
    unsrcset(val, meta = {}) {
        return val.split(',').map(src => {
            const parts = src.trimStart().split(' ');
            if (parts[0]) parts[0] = this.ctx.url.unwrap(parts[0], meta);
            return parts.join(' ');
        }).join(', ');
    };
}

module.exports = HTMLRewriter;