// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
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

function iterate(ast, fn) {
    fn(new Parse5Wrapper(ast), null);
    if (ast.childNodes) for (let i in ast.childNodes) iterate(ast.childNodes[i], fn);
};

module.exports = { Parse5Wrapper, iterate };