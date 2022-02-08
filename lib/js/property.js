const { Syntax } = require('./esotope');
const { createCallExpression, createIdentifier, createLiteral } = require('./node-builder');
const { shouldRewriteProperty } = require('./utils');

module.exports = {
    type: Syntax.MemberExpression,
    condition: (node, parent) => {
        if (parent.type == 'UpdateExpression' && ['--', '++'].includes(parent.operator)) return false;
        if (parent.type == 'UnaryExpression' && parent.operator == 'delete') return false;
        if (parent.type == 'NewExpression' && parent.callee == node) return false;
        if (parent.type === 'CallExpression' && parent.callee === node) return false;
        if (parent.type == 'AssignmentExpression' && parent.left == node) return false;
        if (node.object.type == 'Super') return false;
        return shouldRewriteProperty(node);
    },
    run: node => {
        let key = node.property;
        if (key.type == 'Identifier' && !node.computed) key = createLiteral(key.name);
        Object.assign(node, createCallExpression(createIdentifier('__get$'), [ node.object, key, ]));
        return true;
    },
};