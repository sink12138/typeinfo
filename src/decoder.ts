import * as fs from "fs";

export interface DecoderFn {
  name: string;
  path: string;
  ptr: string;
  ln: string;
  arg: string;
  stack: string;
  var: string;
  length: string;
  bytecodes: ByteCode[];
  locs: LocVar[];
  rootmap?: Map<number, string>;
}

export interface ByteCode {
  type: string;
  offset: number;
  item: string[];
}

export interface LocVar {
  name: string;
  type: string[];
}

export class Decoder {
  fns: DecoderFn[];

  decodeBytecode(fileName: string): void {
    this.fns = [];
    let fn: DecoderFn = {
      name: "",
      path: "",
      ptr: "",
      ln: "",
      arg: "",
      stack: "",
      var: "",
      length: "",
      bytecodes: [],
      locs: []
    };;
    let bytecode: ByteCode = {
      type: "any",
      offset: -1,
      item: []
    };
    let loc: LocVar = {
      name: "",
      type: [],
    };
    let data = fs.readFileSync(fileName, "utf-8");
    let lines = data.split("\n");
    let flag: number = 0;
    let k = 0;  //index of line
    for (const line of lines) {
      let l = line.replace(/\r|\n/g, "");
      if (l.includes("-- JSFunction")) {
        let ctx = l.split(" ");
        fn.name = ctx[2];
        fn.path = ctx[4];
      }
      else if (l.includes("source ptr:")) {
        let ctx = l.split(" ");
        fn.ptr = ctx[2].replace(",", "");
        fn.ln = ctx[4];
      }
      else if (l.includes("arg count:")) {
        let ctx = l.split(" ");
        fn.arg = ctx[2];
      }
      else if (l.includes("stack size:")) {
        let ctx = l.split(" ");
        fn.stack = ctx[2];
      }
      else if (l.includes("Funtion bytecode:")) {
        flag = 1;
      }
      else if (l.includes("var count:")) {
        let ctx = l.split(" ");
        fn.var = ctx[2];
        flag = 2;
      }
      else if (l.includes("length:")) {
        let ctx = l.split(" ");
        fn.length = ctx[1];
        // record root map
        if (fn.name == "<eval>") {
          fn.rootmap = new Map();
          let root = lines[k + 1].split(" ").filter(e => (e != ""));
          for (let i = 0; i < root.length; i++) {
            if (root[i] == "ptr") {
              let idx = parseInt(root[i - 1].replace(":", ""));
              let ptr = root[i + 1].replace(/\r|\n/g, "");
              fn.rootmap.set(idx, ptr);
            }
          }
        }
        // funtion end
        flag = 0;
        this.fns.push(fn);
        fn = {
          name: "",
          path: "",
          ptr: "",
          ln: "",
          arg: "",
          stack: "",
          var: "",
          length: "",
          bytecodes: [],
          locs: [],
        };
      }
      else if (l == "Constant pool") {
        flag = 0;
      }
      else if (flag == 1) { // Record bytecode
        let ctx = l.split(" ").filter(e => e);
        bytecode = {
          type: "any",
          offset: -1,
          item: []
        };
        bytecode.offset = parseInt(ctx[0].substring(0, ctx[0].length - 1));
        bytecode.item = ctx.slice(1);
        for (let i in bytecode.item) bytecode.item[i] = bytecode.item[i].replace(",", "");
        fn.bytecodes.push(bytecode);
      }
      else if (flag == 2) { // Record local
        let ctx = l.split(" ").filter(e => e);
        loc = {
          name: "",
          type: [],
        };
        loc.name = ctx[0].substring(0, ctx[0].length - 1);
        loc.type = ctx.slice(1);
        for (let i in loc.type) loc.type[i] = loc.type[i].replace(".", "");
        fn.locs.push(loc);
      }
      k++;
    }
  }

}