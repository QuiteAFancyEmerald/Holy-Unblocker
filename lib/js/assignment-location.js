const { Syntax } = require('./esotope');
const { createCallExpression, createIdentifier, createLiteral, createFunctionExpression, createReturnStatement, createLogicalExpression, createMemberExpression, createThisExpression, createAssignmentExpression, } = require('./node-builder');
const name = '__set$Loc'

module.exports = {
    type: Syntax.AssignmentExpression,
    condition: (node, parent) => { 
        if (node.noRewrite || node.left.type != 'Identifier' || node.left.name != 'location') return false;
        if (parent.type == Syntax.CallExpression && parent.callee.type == Syntax.Identifier && ['__get$Loc', '__get$Top', '__get$Parent', '__set$Loc'].includes(parent.callee.name)) return false;
        return true;
    },
    run: node => {
        const fn = createFunctionExpression(null, [], [ 
            createReturnStatement(
                createLogicalExpression(
                    createCallExpression(createIdentifier(name), [ { ...node.left, noRewrite: true, }, node.right, createLiteral(node.operator), ]),
                    { ...createAssignmentExpression(createIdentifier('location'), node.right), noRewrite: true, },
                )
            )
        ]);
        Object.assign(node, createCallExpression(
            createMemberExpression(fn, createIdentifier('apply')),
            [ createThisExpression() ]
        ));
        node.wrap = true;
        return true;
    },
};