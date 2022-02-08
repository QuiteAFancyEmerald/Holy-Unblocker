const { Syntax } = require('./esotope');
const { createCallExpression, createIdentifier, createArrayExpression } = require('./node-builder');

function create(type) {
    return {
        type,
        condition: node => {
            for (let param of node.params) {
                if (param.type == Syntax.AssignmentPattern) param = param.left;
                if (param.type == Syntax.ObjectPattern || param.type == Syntax.ArrayPattern) return true;
            };
            return false;
        },
        run: node => {
            let num = 0;
        }
    };
};