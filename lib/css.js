// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const csstree = require('css-tree');

class CSSRewriter {
    constructor(ctx) {
        this.ctx = ctx;
    };
    process(source, config = {}) {
        const ast = csstree.parse(source, { 
            context: config.context || 'stylesheet',
            parseCustomProperty: true, 
        });
        const urls = csstree.findAll(ast, node => 
            node.type == 'Url'
        );
        const imports = csstree.findAll(ast, node => 
            node.type == 'Atrule' && node.name == 'import' && node.prelude && node.prelude.type == 'AtrulePrelude' && node.prelude.children.head.data.type == 'String'
        );
        urls.forEach(({ value }) => {
            switch(value.type) {
                case 'String':
                    const quote =  value.value.substring(0, 1);
                    value.value = quote + this.ctx.url.wrap(value.value.slice(1).slice(0, -1), config) + quote;
                    break;
                case 'Raw':
                    value.value = this.ctx.url.wrap(value.value, config);
                    break;
            };
        });
        imports.forEach(({ prelude }) => {
            const { data } = prelude.children.head;
            const quote =  data.value.substring(0, 1);
            data.value = quote + this.ctx.url.wrap(data.value.slice(1).slice(0, -1), config) + quote;
        });
        return csstree.generate(ast);
    };
    source(processed, config = {}) {
        const ast = csstree.parse(processed, { 
            context: config.context || 'stylesheet',
            parseCustomProperty: true, 
        });
        const urls = csstree.findAll(ast, node => 
            node.type == 'Url'
        );
        const imports = csstree.findAll(ast, node => 
            node.type == 'Atrule' && node.name == 'import' && node.prelude && node.prelude.type == 'AtrulePrelude' && node.prelude.children.head.data.type == 'String'
        );
        urls.forEach(({ value }) => {
            switch(value.type) {
                case 'String':
                    const quote =  value.value.substring(0, 1);
                    value.value = quote + this.ctx.url.unwrap(value.value.slice(1).slice(0, -1), config) + quote;
                    break;
                case 'Raw':
                    value.value = this.ctx.url.unwrap(value.value, config);
                    break;
            };
        });
        imports.forEach(({ prelude }) => {
            const { data } = prelude.children.head;
            const quote =  data.value.substring(0, 1);
            data.value = quote + this.ctx.url.unwrap(data.value.slice(1).slice(0, -1), config) + quote;
        });
        return csstree.generate(ast);
    };  
};

module.exports = CSSRewriter;
