import * as fs from "fs";

interface JSFunction {
  name: string;
  path: string;
  ptr: string;
  ln: string;
  arg: string;
  stack: string;
  var: string;
  length: string;
}

function bytecodeDecoder(
  fileName: string
): void {
  let fns:JSFunction[] = [];
  let fn:JSFunction = {
    name: "",
    path: "",
    ptr: "",
    ln: "",
    arg: "",
    stack: "",
    var: "",
    length: ""
  };

  let data = fs.readFileSync(fileName, "utf-8");
  let lines = data.split("\n");
  let mode:number = 0;
  for (const line of lines) {
    if (line.includes("-- JSFunction")) {
      let ctx = line.split(" ");
      fn.name = ctx[2];
      fn.path = ctx[4];
    }
    else if (line.includes("source ptr:")) {
      let ctx = line.split(" ");
      fn.ptr = ctx[2];
      fn.ln = ctx[4];
    }
    else if (line.includes("arg count:")) {
      let ctx = line.split(" ");
      fn.arg = ctx[2];
    }
    else if (line.includes("stack size:")) {
      let ctx = line.split(" ");
      fn.arg = ctx[2];
    }
    else if (line.includes("Funtion bytecode:")) {
      mode = 1;
      continue;
    }
    else if (line.includes("var count:")) {
      let ctx = line.split(" ");
      fn.var = ctx[2];
      mode = 2;
      continue;
    }
    else if (line.includes("length:")) {
      let ctx = line.split(" ");
      fn.length = ctx[1];
    }
    else if (mode == 1) {

    }
    else if (mode == 2) {
      
    }
  }
}

bytecodeDecoder(process.argv[2])