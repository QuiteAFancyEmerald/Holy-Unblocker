const { Syntax } = require("./esotope");

function createCallExpression(callee, args) {
    return { type: Syntax.CallExpression, callee, arguments: args, optional: false, };
};
function createArrayExpression(...elements) {
    return {
        type: Syntax.ArrayExpression,
        elements,
    };
};
function createMemberExpression(object, property) {
    return {
        type: Syntax.MemberExpression,
        object,
        property,
    };
};
function createLiteral(value) {
    return {
        type: Syntax.Literal,
        value,
    }
};
function createFunctionExpression(id = null, params = [], body = [], async = false) {
    return {
        type: Syntax.FunctionExpression,
        id,
        params,
        body: {
            type: Syntax.BlockStatement,
            body,
        },
        async,
    };
};
function createReturnStatement(argument = null) {
    return {
        type: Syntax.ReturnStatement,
        argument,
    }
};
function createLogicalExpression(left, right) {
    return {
        type: Syntax.LogicalExpression,
        left,
        right,
        operator: '||',
    };
};
function createIdentifier(name) {
    return { type: Syntax.Identifier, name };
};
function createThisExpression() {
    return { type: Syntax.ThisExpression, };
};
function createAssignmentExpression(left, right, operator = '=') {
    return {
        type: Syntax.AssignmentExpression,
        operator,
        left,
        right,
    }
};
module.exports = {  createAssignmentExpression, createThisExpression, createLogicalExpression, createReturnStatement, createFunctionExpression, createCallExpression, createArrayExpression, createMemberExpression, createLiteral, createIdentifier, };