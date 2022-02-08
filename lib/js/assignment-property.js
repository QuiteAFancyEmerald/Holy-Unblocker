const { Syntax } = require('./esotope');
const { createCallExpression, createIdentifier, createLiteral } = require('./node-builder');
const { shouldRewriteProperty } = require('./utils');

module.exports = {
    type: Syntax.AssignmentExpression,
    condition: node => {
        const { left } = node;
        if (left.type != Syntax.MemberExpression) return false;
        if (left.object.type == Syntax.Super) return false;
        return shouldRewriteProperty(left);
    },
    run: node => {
        const { left } = node;
        let key = left.property;
        if (key.type == 'Identifier' && !left.computed) key = createLiteral(key.name);
        Object.assign(node, createCallExpression(createIdentifier('__set$'), [ left.object, key, node.right, createLiteral(node.operator), ]));
        return true;
    },
};