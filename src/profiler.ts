import * as ts from "typescript";
import * as fs from "fs";

interface TypeInfo {
  name: string;
  type: string;
}

function getTypeInfo(
  fileNames: string[],
  options: ts.CompilerOptions
): void {
  let program = ts.createProgram(fileNames, options);
  let checker = program.getTypeChecker();
  let fnName: string = "";
  let returnType: string = "";
  let argType: TypeInfo[] = [];
  let localType: TypeInfo[] = [];
  let byteType: TypeInfo[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.isDeclarationFile) {
      ts.forEachChild(sourceFile, visit);
    }
  }

  fs.writeFileSync(fileNames[0] + ".ty",
    "fn: " + fnName + "\n" +
    "args: " + JSON.stringify(argType) + "\n" +
    "return: " + returnType + "\n" + 
    "byte: " + JSON.stringify(byteType, undefined, 2)
  );

  return;

  function visit(node: ts.Node) {
    if (!isNodeExported(node)) {
      return;
    }

    if (ts.isFunctionDeclaration(node) && node.name) {
      let symbol = checker.getSymbolAtLocation(node.name);
      if (symbol) {
        fnName = symbol.getName();
        returnType = checker.typeToString(
          checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
        )
      }
    } else if (ts.isParameter(node) && node.name) {
      let symbol = checker.getSymbolAtLocation(node.name);
      if (symbol) {
        argType.push({
          name: symbol.getName(),
          type: checker.typeToString(
            checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
          )
        });
      }
    } else if (ts.isVariableDeclaration(node) && node.name) {
      let symbol = checker.getSymbolAtLocation(node.name);
      if (symbol) {
        byteType.push({
          name: symbol.getName(),
          type: checker.typeToString(
            checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
          )
        });
      }
    } else if (ts.isBinaryExpression(node)) {
      let left = node.left;
      let op = node.operatorToken;
      let right = node.right;
      let type = checker.getTypeAtLocation(node);
      byteType.push({
        name: op.getText(),
        type: checker.typeToString(type)
      })
    }
    ts.forEachChild(node, visit);
  }

  function isNodeExported(node: ts.Node): boolean {
    return (
      (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
      (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
    );
  }
}

getTypeInfo (process.argv.slice(2), {
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
});