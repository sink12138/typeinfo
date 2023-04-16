"use strict";
exports.__esModule = true;
exports.Checker = void 0;
var ts = require("typescript");
var Checker = /** @class */ (function () {
    function Checker() {
    }
    Checker.prototype.getTypeInfo = function (fileName, options) {
        this.fns = [];
        this.eva = [];
        var program = ts.createProgram([fileName], options);
        var checker = program.getTypeChecker();
        var argType = [];
        var byteType = [];
        var fn = {
            fnName: "",
            returnType: "",
            argType: [],
            byteType: []
        };
        var fns = this.fns;
        var eva = this.eva;
        var posList = [];
        var endList = [];
        var flag = 0; // <eval> or function
        for (var _i = 0, _a = program.getSourceFiles(); _i < _a.length; _i++) {
            var sourceFile = _a[_i];
            if (!sourceFile.isDeclarationFile) {
                posList = [];
                endList = [];
                for (var _b = 0, _c = sourceFile.statements; _b < _c.length; _b++) {
                    var statement = _c[_b];
                    posList.push(statement.pos);
                    endList.push(statement.end);
                }
                ts.forEachChild(sourceFile, visit);
            }
        }
        fn.argType = argType;
        fn.byteType = byteType;
        fns.push(fn);
        return;
        function visit(node) {
            var pos = node.pos;
            var end = node.end;
            for (var i = 0; i < posList.length; i++) {
                if (pos == posList[i] && end == endList[i])
                    flag = 0;
            }
            if (ts.isFunctionDeclaration(node) && node.name) {
                flag = 1;
                if (fn.fnName != "") {
                    fn.argType = argType;
                    fn.byteType = byteType;
                    fns.push(fn);
                    argType = [];
                    byteType = [];
                    fn = {
                        fnName: "",
                        returnType: "",
                        argType: [],
                        byteType: []
                    };
                }
                var symbol = checker.getSymbolAtLocation(node.name);
                if (symbol) {
                    fn.fnName = symbol.getName();
                    fn.returnType = checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration));
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
                    if (flag == 1)
                        byteType.push({
                            name: symbol.getName(),
                            type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration))
                        });
                    else if (flag == 0)
                        eva.push({
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
                if (flag == 1)
                    byteType.push({
                        name: op.getText(),
                        type: checker.typeToString(type)
                    });
                else if (flag == 0)
                    eva.push({
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
    };
    return Checker;
}());
exports.Checker = Checker;
// getTypeInfo (process.argv.slice(2), {
//   target: ts.ScriptTarget.ES5,
//   module: ts.ModuleKind.CommonJS
// });
