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
    for (let line of lines) {
      line = line.replace(/\r|\n/g, "");
      if (line.includes("-- JSFunction")) {
        let ctx = line.split(" ");
        fn.name = ctx[2];
        fn.path = ctx[4];
      }
      else if (line.includes("source ptr:")) {
        let ctx = line.split(" ");
        fn.ptr = ctx[2].replace(",","");
        fn.ln = ctx[4];
      }
      else if (line.includes("arg count:")) {
        let ctx = line.split(" ");
        fn.arg = ctx[2];
      }
      else if (line.includes("stack size:")) {
        let ctx = line.split(" ");
        fn.stack = ctx[2];
      }
      else if (line.includes("Funtion bytecode:")) {
        flag = 1;
        continue;
      }
      else if (line.includes("var count:")) {
        let ctx = line.split(" ");
        fn.var = ctx[2];
        flag = 2;
        continue;
      }
      else if (line.includes("length:")) {
        let ctx = line.split(" ");
        fn.length = ctx[1];

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
          locs: []
        };
      }
      else if (line == "Constant pool") {
        flag = 0;
      }
      else if (flag == 1) { // Record bytecode
        let ctx = line.split(" ").filter(e => e);
        bytecode = {
          type: "any",
          offset: -1,
          item: []
        };
        bytecode.offset = parseInt(ctx[0].substring(0, ctx[0].length - 1));
        bytecode.item = ctx.slice(1);
        for (let i in bytecode.item) bytecode.item[i] = bytecode.item[i].replace(",","");
        fn.bytecodes.push(bytecode);
      }
      else if (flag == 2) { // Record local
        let ctx = line.split(" ").filter(e => e);
        loc = {
          name: "",
          type: [],
        };
        loc.name = ctx[0].substring(0, ctx[0].length - 1);
        loc.type = ctx.slice(1);
        for (let i in loc.type) loc.type[i] = loc.type[i].replace(".","");
        fn.locs.push(loc);
      }
    }
  }

}
// let decoder = new Decoder();
// decoder.decodeBytecode(process.argv[2]);
// console.log(JSON.stringify(decoder.fns));