import * as ts from "typescript";

export interface TypeInfo {
  name: string;
  type: string;
}

export interface CheckerFn {
  fnName: string;
  returnType: string;
  argType: TypeInfo[];
  byteType: TypeInfo[];
}

export class Checker {

  fns: CheckerFn[];
  eva: TypeInfo[];
  checker: ts.TypeChecker;

  getTypeInfo(
    fileName: string,
    options: ts.CompilerOptions
  ): void {
    this.fns = [];
    this.eva = [];
    let program = ts.createProgram([fileName], options);
    let checker = program.getTypeChecker();

    let argType: TypeInfo[] = [];
    let byteType: TypeInfo[] = [];
    let fn: CheckerFn = {
      fnName: "",
      returnType: "",
      argType: [],
      byteType: []
    }

    let fns = this.fns;
    let eva = this.eva;
    let posList: number[] = [];
    let endList: number[] = [];
    let flag = 0; // <eval> or function

    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        posList = [];
        endList = [];
        for (const statement of sourceFile.statements) {
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

    function visit(node: ts.Node) {

      let pos = node.pos;
      let end = node.end;

      for (let i = 0;i < posList.length; i++) {
        if (pos == posList[i] && end == endList[i]) flag = 0;
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
          }
        }
        let symbol = checker.getSymbolAtLocation(node.name);
        if (symbol) {
          fn.fnName = symbol.getName();
          fn.returnType = checker.typeToString(
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
          if (flag == 1)
            byteType.push({
              name: symbol.getName(),
              type: checker.typeToString(
                checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
              )
            })
          else if (flag == 0)
            eva.push({
              name: symbol.getName(),
              type: checker.typeToString(
                checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!)
              )
            })
        }
      } else if (ts.isBinaryExpression(node)) {
        let left = node.left;
        let op = node.operatorToken;
        let right = node.right;
        let type = checker.getTypeAtLocation(node);
        if (flag == 1) 
          byteType.push({
            name: op.getText(),
            type: checker.typeToString(type)
          })
        else if (flag == 0)
          eva.push({
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

}


// getTypeInfo (process.argv.slice(2), {
//   target: ts.ScriptTarget.ES5,
//   module: ts.ModuleKind.CommonJS
// });