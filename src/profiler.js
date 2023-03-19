"use strict";
exports.__esModule = true;
var ts = require("typescript");
var fs = require("fs");
function getTypeInfo(fileNames, options) {
    var program = ts.createProgram(fileNames, options);
    var checker = program.getTypeChecker();
    var fnName = "";
    var returnType = "";
    var argType = [];
    var localType = [];
    var byteType = [];
    for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
        var sourceFile = _a[_i];
        if (!sourceFile.isDeclarationFile) {
            console.log(111);
            ts.forEachChild(sourceFile, visit);
        }
    }
    fs.writeFileSync(fileNames[0] + ".ty", "fn: " + fnName + "\n" +
        "args: " + JSON.stringify(argType) + "\n" +
        "return: " + returnType + "\n" +
        "byte: " + JSON.stringify(byteType, undefined, 2));
    return;
    function visit(node) {
        if (!isNodeExported(node)) {
            return;
        }
        if (ts.isFunctionDeclaration(node) && node.name) {
            var symbol = checker.getSymbolAtLocation(node.name);
            if (symbol) {
                fnName = symbol.getName();
                returnType = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));
            }
        }
        else if (ts.isParameter(node) && node.name) {
            var symbol = checker.getSymbolAtLocation(node.name);
            if (symbol) {
                argType.push({
                    name: symbol.getName(),
                    type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
                });
            }
        }
        else if (ts.isVariableDeclaration(node) && node.name) {
            var symbol = checker.getSymbolAtLocation(node.name);
            if (symbol) {
                byteType.push({
                    name: symbol.getName(),
                    type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
                });
            }
        }
        else if (ts.isBinaryExpression(node)) {
            var left = node.left;
            var op = node.operatorToken;
            var right = node.right;
            var type = checker.getTypeAtLocation(node);
            byteType.push({
                name: op.getText(),
                type: checker.typeToString(type)
            });
        }
        ts.forEachChild(node, visit);
    }
    function isNodeExported(node) {
        return ((ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0 ||
            (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile));
    }
}
console.log(process.argv.slice(2));
getTypeInfo(process.argv.slice(2), {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});
