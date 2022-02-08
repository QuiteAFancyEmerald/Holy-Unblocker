// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const { parseScript } = require('meriyah');
const { generate } = require('./esotope');
const { iterate } = require('./utils');
const rawMap = [
    require('./property'),
    require('./assignment-property'),
    require('./assignment-location'),
    //require('./method-call'),
    require('./identifier'),
    require('./eval'),
];

class JSRewriter {
    constructor(ctx) {
        this.parseOptions = { 
            ranges: true,
            globalReturn: true,
        };
        this.generationOptions = {
            format: {
                quotes: 'double',
                escapeless: true,
                compact: true,
            },
        };
        this.map = new Map();
        rawMap.forEach(({ type, condition, run }) => {
            if (!this.map.has(type)) this.map.set(type, []);
            this.map.get(type).push({ condition, run, });
        });
    };
    process(source, config) {
        try {
            let slice = 0;
            const ast = parseScript(source, this.parseOptions);
            const changes = [];
            const output = [];
            iterate(ast, (node, parent) => {
                if (!node) return;
                if (parent && !!parent.inTransformer) node.inTransformer = true;
                if (this.map.has(node.type)) {
                    const transformers = this.map.get(node.type);
                    for (const transformer of transformers) {
                        if (!transformer.condition || transformer.condition(node, parent)) {
                            transformer.run(node, parent);
                            if (!node.inTransformer) {
                                changes.push({
                                    node,
                                    start: node.start,
                                    end: node.end,
                                    parentType: parent.type,
                                });
                                node.inTransformer = true;
                            };
                        };  
                    };
                };
            }); 
            changes.sort((a, b) => (a.start - b.start) || (a.end - b.end));
            for (const change of changes) {
                const parentheses = change.node.wrap || (change.node.type == 'SequenceExpression '&& change.parentType != 'ExpressionStatement' && change.parentType != 'SequenceExpression');
                output.push(source.slice(slice, change.start));
                output.push(parentheses ? '(' : ' ');
                output.push(generate(change.node, this.generationOptions));
                output.push(parentheses ? ')' : ' ');
                slice = change.end;
            };
            output.push(source.slice(slice));
            return output.join('');
        } catch(e) {
            return source;
        };
    };
};

module.exports = JSRewriter;
