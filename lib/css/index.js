// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const csstree = require('css-tree');
const rawMap = [
    require('./import'),
    require('./url-string'),
    require('./url-raw'),
];

class CSSRewriter {
    constructor(ctx) {
        this.ctx = ctx;
        this.map = new Map();
        rawMap.forEach(({ type, ...keys }) => {
            if (!this.map.has(type)) this.map.set(type, []);
            this.map.get(type).push(keys);
        });
    };
    process(source, config = {}) {
        try {
            const ast = csstree.parse(source, { 
                context: config.context || 'stylesheet',
                parseCustomProperty: true, 
            });
            csstree.walk(ast, node => {
                if (this.map.has(node.type)) {
                    const data = {
                        ctx: this.ctx,
                        meta: config.meta || {},
                    }
                    const transformers = this.map.get(node.type);
                    for (const transformer of transformers) {
                        if (!transformer.condition || transformer.condition(node, data)) {
                            if (transformer.rewrite) transformer.rewrite(node, data);
                        };  
                    };
                };
            });
            return csstree.generate(ast);
        } catch(e) {
            return source;
        };
    };
    source(processed, config = {}) {
        const ast = csstree.parse(processed, { 
            context: config.context || 'stylesheet',
            parseCustomProperty: true, 
        });
        csstree.walk(ast, node => {
            if (this.map.has(node.type)) {
                const data = {
                    ctx: this.ctx,
                    meta: config.meta || {},
                }
                const transformers = this.map.get(node.type);
                for (const transformer of transformers) {
                    if (!transformer.condition || transformer.condition(node, data)) {
                        console.log(transformer)
                        if (transformer.source) transformer.source(node, data);
                    };  
                };
            };
        });
        return csstree.generate(ast);
    };  
};

module.exports = CSSRewriter;
