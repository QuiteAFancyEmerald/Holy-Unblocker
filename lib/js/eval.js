const { Syntax } = require('./esotope');
const { createCallExpression, createIdentifier } = require('./node-builder');

module.exports = {
    type: Syntax.CallExpression,
    condition: node => node.callee.type == 'Identifier' && node.callee.name == 'eval' && node.arguments.length,
    run: node => { 
        node.arguments[0] = createCallExpression(createIdentifier('__processScript'), [ node.arguments[0] ]);
        return true;
    },
};