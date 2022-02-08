const { Syntax } = require('./esotope');
const { createCallExpression, createIdentifier } = require('./node-builder');
const map = { 
    location: '__get$Loc', 
    top: '__get$Top', 
    parent: '__get$Parent' 
};

module.exports = {
    type: Syntax.Identifier,
    condition: (node, parent) => {
        if (node.noRewrite ||  !map[node.name] || !parent) return false;
        if (parent.type == Syntax.VariableDeclarator && parent.id == node) return false;
        if ((parent.type == Syntax.AssignmentExpression || parent.type == Syntax.AssignmentPattern) && parent.left == node) return false;
        if ((parent.type == Syntax.FunctionExpression || parent.type == Syntax.FunctionDeclaration) && parent.id == node) return false;
        if (parent.type == Syntax.MemberExpression && parent.property == node) return false;
        if (parent.type == Syntax.Property && parent.key == node) return false;
        if (parent.type == Syntax.Property && parent.value == node && parent.shorthand) return false;
        if (parent.type == Syntax.UpdateExpression && (parent.operator == '++' || parent.operator == '--')) return false;
        if ((parent.type == Syntax.FunctionExpression || parent.type == Syntax.FunctionDeclaration || parent.type == Syntax.ArrowFunctionExpression) && parent.params.indexOf(node) !== -1) return false;
        if (parent.type == Syntax.CallExpression && parent.callee.type == Syntax.Identifier && ['__get$Loc', '__get$Top', '__get$Parent', '__set$Loc'].includes(parent.callee.name)) return false;
        if (parent.type == Syntax.MethodDefinition) return false;
        if (parent.type == Syntax.ClassDeclaration) return false;
        if (parent.type == Syntax.RestElement) return false;
        if (parent.type == Syntax.ExportSpecifier) return false;
        if (parent.type == Syntax.ImportSpecifier) return false;
        return true;
    },
    run: node => { 
        Object.assign(node, createCallExpression(createIdentifier(map[node.name]), [ createIdentifier(node.name) ]))
        node.noRewrite = true;
    },
};