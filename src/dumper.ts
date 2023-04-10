import * as fs from "fs";

import { Matcher } from "./macher";



//typefile dumper
function printTypeFile(fileName: string): void {
  let output: string = "";
  let matcher = new Matcher();
  matcher.init(fileName);
  matcher.match();
  let fns = matcher.funcTypes;
  console.log(JSON.stringify(fns, null, 4));

  for (let i = 0; i < fns.length; i++) {
    let fn = fns[i];
    output = output.concat(`(fn _JS_F${fn.name.length}${fn.name}__${fn.path} \n`);
    output = output.concat(`  ; source ptr: ${fn.ptr}, ln: ${fn.ln}\n`);
    
    // signature
    output = output.concat(`  ; arg count: ${fn.arg}\n`);
    output = output.concat(`  (sig (args any  ; this\n`);
    for (const arg of fn.args) {
      output = output.concat(`      ${arg.type}  ; ${arg.name}\n`);
    }
    output = output.concat("    )\n");
    output = output.concat(`  ${fn.return})  ; return\n`);
    output = output.concat(`  ; stack size: ${fn.stack}\n`);
    
    // local vars
    output = output.concat(`  (locs  ; var count: ${fn.var}\n`);
    for (let j = 0; j < fn.locs.length; j++) {
      let loc = fn.locs[j];
      output = output.concat(`    ${loc.type}  ; ${loc.name}:`);
      for (const e of loc.extend) output = output.concat(` ${e}`);
      output = output.concat("\n");
    }
    output = output.concat("  )\n");
    
    // bytecodes
    output = output.concat("  (bytecodes \n");
    for (const bc of fn.bytecodes) {
      output = output.concat(`    (${bc.offset.toString().padStart(3, " ")} ${bc.type})  ; ${bc.opcode} `);
      for (let j = 0;j < bc.item.length; j++) {
        let item = bc.item[j];
        if (j > 0) output = output.concat(`, ${item}`);
        else output = output.concat(` ${item}`);
      }
      output = output.concat("\n");
    }
    output = output.concat("  )\n");
    
    //other
    output = output.concat("  ; Constant pool\n");
    output = output.concat(`  ; length: ${fn.length}\n`);
    for (let i = 0; i < parseInt(fn.length); i++) {
      output = output.concat(`    ; ${i.toString().padStart(3," ")}: `);
      output = output.concat("\n");
    }
    output = output.concat(")\n");
    output = output.concat("\n");
  }

  fs.writeFileSync(fileName + ".ts.ty", output);

}

printTypeFile(process.argv[2]);