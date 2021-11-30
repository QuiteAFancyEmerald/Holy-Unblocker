// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------
const { parse } = require('acorn-hammerhead');
const { generate } = require('./esotope');

class JSRewriter {
    constructor(ctx) {
        this.parseOptions = { 
            allowReturnOutsideFunction: true, 
            allowImportExportEverywhere: true, 
            ecmaVersion: 2021, 
        };
        this.generationOptions = {
            format: {
                quotes: 'double',
                escapeless: true,
                compact: true,
            },
        };
        this.rewrite = ['location', 'parent', 'top'];
        this.map = [
            {
                type: 'MemberExpression',
                handler: (node, parent) => {
                    let rewrite = false;
                    if (parent.type == 'UnaryExpression' && parent.operator == 'delete') return;
                    if (parent.type == 'NewExpression' && parent.callee == node) return;
                    if (parent.type === 'CallExpression' && parent.callee === node) return;
                    if (node.preventRewrite) return;
                    switch(node.property.type) {
                        case 'Identifier':
                            //if (node.computed) rewrite = true;
                            if (!node.computed && this.rewrite.includes(node.property.name)) {
                                node.property = this.createLiteral(node.property.name);
                                rewrite = true;
                            };
                            break;
                        case 'Literal':
                            if (this.rewrite.includes(node.property.name)) rewrite = true;
                            break;
                        case 'TemplateLiteral':
                            rewrite = true;
                            break;
                        default:
                            if (node.computed) rewrite = true;
                    };
                    if (rewrite) {
                        let identifier = '$corrosionGet$m';
                        let nodeToRewrite = node;
                        const args = [
                            node.object,
                            node.property,
                        ];
                        if (node.computed) args[1].preventRewrite = true;
                        if (parent.type == 'AssignmentExpression' && parent.left == node) {
                            identifier = '$corrosionSet$m';
                            nodeToRewrite = parent;
                            args.push(parent.right, this.createLiteral(parent.operator));
                        };
                        if (parent.type == 'CallExpression' && parent.callee == node) {
                            identifier = '$corrosionCall$m';
                            nodeToRewrite = parent;
                            args.push(this.createArrayExpression(...parent.arguments))
                        };
                        if (parent.type == 'UpdateExpression') {
                            identifier = '$corrosionSet$m';
                            nodeToRewrite = parent;
                            args.push(this.createLiteral(null), this.createLiteral(parent.operator));
                        };
                        Object.assign(nodeToRewrite, this.createCallExpression({ type: 'Identifier', name: identifier, }, args));
                    };
                },
            },
            {
                type: 'Identifier',
                handler: (node, parent) => {
                    if (parent.type == 'MemberExpression' && parent.property == node) return; // window.location;
                    if (parent.type == 'LabeledStatement') return; // { location: null, };
                    if (parent.type == 'VariableDeclarator' && parent.id == node) return;
                    if (parent.type == 'Property' && parent.key == node) return;
                    if (parent.type == 'MethodDefinition') return;
                    if (parent.type == 'ClassDeclaration') return;
                    if (parent.type == 'RestElement') return;
                    if (parent.type == 'ExportSpecifier') return;
                    if (parent.type == 'ImportSpecifier') return;
                    if ((parent.type == 'FunctionDeclaration' || parent.type == 'FunctionExpression' || parent.type == 'ArrowFunctionExpression') && parent.params.includes(node)) return;
                    if ((parent.type == 'FunctionDeclaration' || parent.type == 'FunctionExpression') && parent.id == node) return;
                    if (parent.type == 'AssignmentPattern' && parent.left == node) return;
                    if (!this.rewrite.includes(node.name)) return;
                    if (node.preventRewrite) return;
                    let identifier = '$corrosionGet$';
                    let nodeToRewrite = node;
                    const args = [
                        this.createIdentifier(node.name, true),
                    ];

                    if (parent.type == 'AssignmentExpression' && parent.left == node) {
                        identifier = '$corrosionSet$';
                        nodeToRewrite = parent;
                        args.push(parent.right);
                        args.push(this.createLiteral(parent.operator));
                    };

                    Object.assign(nodeToRewrite, this.createCallExpression({ type: 'Identifier', name: identifier }, args));
                },
            },
            {
                type: 'ImportDeclaration',
                handler: (node, parent, url) => {
                    if (node.source.type != 'Literal' || !url) return;
                    node.source = this.createLiteral(ctx.url.wrap(node.source.value, { base: url, }));      
                },
            },
            {
                type: 'ImportExpression',
                handler: (node, parent) => {
                    node.source = this.createCallExpression(this.createMemberExpression(this.createMemberExpression(this.createIdentifier('$corrosion'), this.createIdentifier('url')), this.createIdentifier('wrap')), [ 
                        node.source,
                        this.createMemberExpression(this.createIdentifier('$corrosion'), this.createIdentifier('meta')),
                    ]);
                },
            },  
        ];
        this.ctx = ctx;
    };
    process(source, url) {
        try {
            const ast = parse(source, this.parseOptions);
            this.iterate(ast, (node, parent) => {
                const fn = this.map.find(entry => entry.type == (node || {}).type);
                if (fn) fn.handler(node, parent, url);
            });
            return (url ? this.createHead(url) : '') + generate(ast, this.generationOptions);
        } catch(e) {
            return source;
        };
    };
    createHead(url) {
        return `
        if (!self.$corrosion && self.importScripts) {
            importScripts(location.origin + '${this.ctx.prefix}index.js');
            self.$corrosion = new Corrosion({ url: '${url}', codec: '${this.ctx.config.codec || 'plain'}', serviceWorker: true,  window: self, prefix: '${this.ctx.prefix || '/service/'}', ws: ${this.ctx.config.ws || true}, cookies: ${this.ctx.config.cookies || false}, title: '${this.ctx.config.title}', }); $corrosion.init();
        };\n`;
    };
    iterate(ast, handler) {
        if (typeof ast != 'object' || !handler) return;
        walk(ast, null, handler);
        function walk(node, parent, handler) {
            if (typeof node != 'object' || !handler) return;
            handler(node, parent, handler);
            for (const child in node) {
                if (Array.isArray(node[child])) {
                    node[child].forEach(entry => walk(entry, node, handler));
                } else {
                    walk(node[child], node, handler);
                };
            };
        };
    };
    createCallExpression(callee, args) {
        return { type: 'CallExpression', callee, arguments: args, optional: false, };
    };
    createArrayExpression(...elements) {
        return {
            type: 'ArrayExpression',
            elements,
        };
    };
    createMemberExpression(object, property) {
        return {
            type: 'MemberExpression',
            object,
            property,
        };
    };
    createLiteral(value) {
        return {
            type: 'Literal',
            value,
        }
    };
    createIdentifier(name, preventRewrite) {
        return { type: 'Identifier', name, preventRewrite: preventRewrite || false,  };
    };
};

module.exports = JSRewriter;
