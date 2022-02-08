const { Syntax } = require('./esotope');
const { createCallExpression, createIdentifier, createArrayExpression } = require('./node-builder');

module.exports = {
    type: Syntax.CallExpression,
    condition: node => {
        if (node.callee.type == Syntax.MemberExpression && node.callee.computed && node.callee.object.type != Syntax.Super && node.callee.property.type != Syntax.Literal) return true;
        return false;
    },
    run: node => { 
        Object.assign(node, createCallExpression(createIdentifier('__call$'), [ node.callee.object, node.callee.property, createArrayExpression(...node.arguments) ]));
    },
};