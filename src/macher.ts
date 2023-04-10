import * as ts from "typescript";
import * as fs from "fs";

import { Decoder } from "./decoder"
import { Checker } from "./checker"
import { CheckerFn } from "./checker";
import { DecoderFn } from "./decoder";
import { TypeInfo } from "./checker";
import { ByteCode } from "./decoder";

enum Type {
  any = "any",
  never = "never",
  null = "null",
  undefined = "undefined",
  boolean = "bool",
  number = "i32",
  string = "string",
  object = "object"
}

export interface LocInfo extends TypeInfo {
  extend: string[];
}

export interface ByteInfo extends ByteCode {
  opcode: string;
}

export interface FnType {
  name: string;
  path: string;
  ptr: string;
  ln: string;
  arg: string;
  args: TypeInfo[];
  return: string;
  stack: string;
  var: string;
  locs: LocInfo[];
  length: string;
  bytecodes: ByteInfo[];
}

export class Matcher {
  fileName: string;
  checker: Checker;
  decoder: Decoder;
  funcTypes: FnType[];

  init(fileName:string): void {
    this.fileName = fileName;
    this.getChecker();
    this.getDecoder();
    this.funcTypes = [];
  }

  match(): void {
    let length = this.decoder.fns.length;
    let cfns = this.checker.fns;
    let dfns = this.decoder.fns;
    console.log("----------------------CHECKER----------------------");
    console.log(JSON.stringify(cfns, null, 4));
    console.log("----------------------DECODER----------------------");
    console.log(JSON.stringify(dfns, null, 4));
    console.log("----------------------MATHCER----------------------");
    let i = 0;
    for (const dfn of dfns) {
      let fnType:FnType = {
        name: dfn.name,
        path: dfn.path,
        ptr: dfn.ptr,
        ln: dfn.ln,
        arg: dfn.arg,
        args: [],
        return: "",
        stack: dfn.stack,
        var: dfn.var,
        locs: [],
        length: dfn.length,
        bytecodes: [],
      }
      if (dfn.name != "<eval>") {
        let cfn = cfns[i];
        fnType.args = this.generateArg(cfn);
        fnType.return = this.generateRet(cfn);
        fnType.locs = this.generateLoc(dfn, cfn);
        fnType.bytecodes = this.generateByte(dfn, cfn)
        i++;
      } else {
        fnType.return = "any";
        fnType.locs = this.generateLoc(dfn);
        fnType.bytecodes = this.generateByte(dfn);
      }
      this.funcTypes.push(fnType);
    }
  }

  getChecker(): void {
    this.checker = new Checker();
    this.checker.getTypeInfo(this.fileName.concat(".ts"), {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS
    });
  }

  getDecoder(): void {
    this.decoder = new Decoder();
    this.decoder.decodeBytecode(this.fileName.concat(".txt"));
  }

  generateArg(fn: CheckerFn): TypeInfo[] {
    if (fn == undefined) return [];
    let types: TypeInfo[] = [];
    for (const arg of fn.argType) {
      if (arg.type in Type) {
        types.push({
          name: arg.name,
          type: Type[arg.type]
        });
      } else {
        types.push({
          name: arg.name,
          type: Type.any
        })
      }
    }
    return types;
  }

  generateRet(fn: CheckerFn): string {
    if (fn == undefined) return "";
    let type: string | undefined = "any";
    let arr = fn.returnType.split(" ");
    type = arr[arr.length - 1];
    if (type) return type;
    else return "any";
  }

  generateLoc(dFn: DecoderFn, cFn?: CheckerFn): LocInfo[] {
    if (dFn == undefined) return [];

    let types: LocInfo[] = [];
    if (cFn != undefined) {
      for (const loc of dFn.locs) {
        for (const byte of cFn.byteType) {
          if (loc.name == byte.name) {
            types.push({
              type: byte.type,
              name: loc.name,
              extend: loc.type,
            })
          } else if (loc.name == "<ret>") {
            types.push({
              type: "any",
              name: loc.name,
              extend: loc.type
            })
          }
        }
      }
    } else {
      for (const loc of dFn.locs) {
        types.push({
          type: "any",
          name: loc.name,
          extend: loc.type
        })
      }
    }
    return types;
  }

  generateByte(dFn: DecoderFn, cFn?: CheckerFn): ByteInfo[] {
    let types:ByteInfo[] = [];
    for (const byte of dFn.bytecodes) {
      types.push({
        offset: byte.offset,
        type: byte.type,
        opcode: byte.item[0],
        item: byte.item.slice(1)
      })
    }
    // if (cFn != undefined) {
    //   for (const byte of dFn.bytecodes) {
    //     types.push({
    //       offset: byte.offset,
    //       type: byte.type,
    //       opcode: byte.item[0],
    //       item: byte.item.slice(1)
    //     })
    //   }
    // } else {
    //   for (const byte of dFn.bytecodes) {
    //     types.push({
    //       offset: byte.offset,
    //       type: byte.type,
    //       opcode: byte.item[0],
    //       item: byte.item.slice(1)
    //     })
    //   }
    // }
    return types;
  }

  matchByteLoc():void {}
  matchByteArg():void {}
  matchByteRet():void {}
}