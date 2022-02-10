// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const parse5 = require('parse5');

class HTMLRewriter {
    constructor(ctx) {
        this.ctx = ctx;
        this.attrs = [
            {
                tags: ['form', 'object', 'a', 'link', 'area', 'base', 'script', 'img', 'audio', 'video', 'input', 'embed', 'iframe', 'track', 'source', 'html', 'table', 'head'],
                attrs: ['src', 'href', 'ping', 'data', 'movie', 'action', 'poster', 'profile', 'background'],
                handler: 'url',
            },
            {
                tags: ['iframe'],
                attrs: ['srcdoc'],
                handler: 'html',
            },
            {
                tags: ['img', 'link', 'source'],
                attrs: ['srcset', 'imagesrcset'],
                handler: 'srcset',
            },
            {
                tags: '*',
                attrs: ['style'],
                handler: 'css',
            },
            {
                tags: '*',
                attrs: ['http-equiv', 'integrity', 'nonce', 'crossorigin'],
                handler: 'delete',
            },
        ];
    };
    process(source, config = {}) {
        const ast = parse5[config.document ? 'parse' : 'parseFragment'](source);
        const meta = {
            origin: config.origin,
            base: new URL(config.base),
        };  
        iterate(ast, node => {
            if (!node.tagName) return;
            switch(node.tagName) {
                case 'STYLE':
                    if (node.textContent) node.textContent = this.ctx.css.process(node.textContent, meta);
                    break;
                case 'TITLE':
                    if (node.textContent && this.ctx.config.title) node.textContent = this.ctx.config.title;
                    break;
                case 'SCRIPT':
                    if (node.getAttribute('type') != 'application/json' && node.textContent) node.textContent = this.ctx.js.process(node.textContent);
                    break;
                case 'BASE':
                    if (node.hasAttribute('href')) meta.base = new URL(node.getAttribute('href'), config.base);
                    break;
            };
            node.attrs.forEach(attr => {
                const handler = this.attributeRoute({
                    ...attr,
                    node,
                });
                let flags = [];
                if (node.tagName == 'SCRIPT' && attr.name == 'src') flags.push('js');
                if (node.tagName == 'LINK' && node.getAttribute('rel') == 'stylesheet') flags.push('css');
                switch(handler) {
                    case 'url':
                        node.setAttribute(`corrosion-${attr.name}`, attr.value);
                        attr.value = this.ctx.url.wrap(attr.value, { ...meta, flags });
                        break;
                    case 'srcset':
                        node.setAttribute(`corrosion-${attr.name}`, attr.value);
                        attr.value = this.srcset(attr.value, meta);
                        break;
                    case 'css':
                        attr.value = this.ctx.css.process(attr.value, { ...meta, context: 'declarationList' });
                        break;
                    case 'html':
                        node.setAttribute(`corrosion-${attr.name}`, attr.value);
                        attr.value = this.process(attr.value, { ...config, ...meta });
                        break;
                    case 'delete':
                        node.removeAttribute(attr.name);
                        break;
                };
            });
        });
        if (config.document) {
            for (let i in ast.childNodes) if (ast.childNodes[i].tagName == 'html') ast.childNodes[i].childNodes.forEach(node => {
                if (node.tagName == 'head') { 
                    node.childNodes.unshift(...this.injectHead(config.base));
                };
            });
        };
        return parse5.serialize(ast);
    };
    source(processed, config = {}) {
        const ast = parse5[config.document ? 'parse' : 'parseFragment'](processed);
        iterate(ast, node => {
            if (!node.tagName) return;
            node.attrs.forEach(attr => {
                if (node.hasAttribute(`corrosion-${attr.name}`)) { 
                    attr.value = node.getAttribute(`corrosion-${attr.name}`);
                    node.removeAttribute(`corrosion-${attr.name}`)
                };
            });
        });
        return parse5.serialize(ast);
    };
    injectHead() {
        return [
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
        ];
    }
    attributeRoute(data) {
        const match = this.attrs.find(entry => entry.tags == '*' && entry.attrs.includes(data.name) || entry.tags.includes(data.node.tagName.toLowerCase()) && entry.attrs.includes(data.name));
        return match ? match.handler : false;
    };
    srcset(val, config = {}) {
        return val.split(',').map(src => {
            const parts = src.trimStart().split(' ');
            if (parts[0]) parts[0] = this.ctx.url.wrap(parts[0], config);
            return parts.join(' ');
        }).join(', ');
    };
    unsrcset(val, config = {}) {
        return val.split(',').map(src => {
            const parts = src.trimStart().split(' ');
            if (parts[0]) parts[0] = this.ctx.url.unwrap(parts[0], config);
            return parts.join(' ');
        }).join(', ');
    };
};

class Parse5Wrapper {
    constructor(node){
        this.raw = node || {
            attrs: [],
            childNodes: [],
            namespaceURI: '',
            nodeName: '',
            parentNode: {},
            tagName: '',
        };
    };
    hasAttribute(name){
        return this.raw.attrs.some(attr => attr.name == name);
    };
    removeAttribute(name){
        if (!this.hasAttribute(name)) return;
        this.raw.attrs.splice(this.raw.attrs.findIndex(attr => attr.name == name), 1);
    };
    setAttribute(name, val = ''){
        if (!name) return;
        this.removeAttribute(name);
        this.raw.attrs.push({
            name: name,
            value: val,
        });
    };
    getAttribute(name){
        return (this.raw.attrs.find(attr => attr.name == name) || { value: null }).value;
    };
    get textContent(){
        return (this.raw.childNodes.find(node => node.nodeName == '#text') || { value: '', }).value
    };
    set textContent(val){
        if (this.raw.childNodes.some(node => node.nodeName == '#text')) return this.raw.childNodes[this.raw.childNodes.findIndex(node => node.nodeName == '#text')].value = val;
        this.raw.childNodes.push({
            nodeName: '#text',
            value: val,
        });
    };
    get tagName(){
        return (this.raw.tagName || '').toUpperCase();
    };
    get nodeName(){
        return this.raw.nodeName;
    };
    get parentNode(){
        return this.raw.parentNode;
    };
    get childNodes(){
        return this.raw.childNodes || [];
    };
    get attrs() {
        return this.raw.attrs || [];
    };
};

function iterate(ast, fn = (node = Parse5Wrapper.prototype) => null) {
    fn(new Parse5Wrapper(ast));
    if (ast.childNodes) for (let i in ast.childNodes) iterate(ast.childNodes[i], fn);
};

module.exports = HTMLRewriter;
