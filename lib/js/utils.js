const { Syntax } = require('./esotope');

function iterate(ast, handler) {
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
function canWrapIdentifier(node, parent) {
    if (parent.type != Syntax.CallExpression || parent.callee.type != Syntax.Identifier) return true;
    return !['__get$Loc', '__get$Top', '__get$Parent', '__set$Loc'].includes(parent.callee.name);
};
function shouldRewriteProperty(node) {
    if (node.computed) {
        return node.property.type == 'Literal' ?  ['parent', 'location', 'top'].includes(node.property.value) : true;
    } else {
        return ['parent', 'location', 'top'].includes(node.property.name);
    };
};

module.exports = { iterate, shouldRewriteProperty, canWrapIdentifier, };