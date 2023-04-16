"use strict";
exports.__esModule = true;
exports.printTypeFile = void 0;
var fs = require("fs");
var macher_1 = require("./macher");
//typefile dumper
function printTypeFile(fileName, out) {
    var output = "";
    var matcher = new macher_1.Matcher();
    matcher.init(fileName);
    matcher.match();
    var fns = matcher.funcTypes;
    fs.writeFileSync("fns.txt", JSON.stringify(fns, null, 4));
    for (var i = 0; i < fns.length; i++) {
        var fn = fns[i];
        var root = "";
        if (fn.root != -1)
            root = "." + fn.root.toString();
        output = output.concat("(fn _JS_F".concat(fn.name.length).concat(fn.name, "__root").concat(root, " \n"));
        output = output.concat("  ; source ptr: ".concat(fn.ptr, ", ln: ").concat(fn.ln, "\n"));
        // signature
        output = output.concat("  ; arg count: ".concat(fn.arg, "\n"));
        output = output.concat("  (sig (args any  ; this\n");
        for (var _i = 0, _a = fn.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            output = output.concat("      ".concat(arg.type, "  ; ").concat(arg.name, "\n"));
        }
        output = output.concat("    )\n");
        output = output.concat("  ".concat(fn["return"], ")  ; return\n"));
        output = output.concat("  ; stack size: ".concat(fn.stack, "\n"));
        // local vars
        output = output.concat("  (locs  ; var count: ".concat(fn["var"], "\n"));
        for (var j = 0; j < fn.locs.length; j++) {
            var loc = fn.locs[j];
            output = output.concat("    ".concat(loc.type, "  ; ").concat(loc.name, ":"));
            for (var _b = 0, _c = loc.extend; _b < _c.length; _b++) {
                var e = _c[_b];
                output = output.concat(" ".concat(e));
            }
            output = output.concat("\n");
        }
        output = output.concat("  )\n");
        // bytecodes
        output = output.concat("  (bytecodes \n");
        for (var _d = 0, _e = fn.bytecodes; _d < _e.length; _d++) {
            var bc = _e[_d];
            output = output.concat("    (".concat(bc.offset.toString().padStart(3, " "), " ").concat(bc.type, ")  ; ").concat(bc.opcode, " "));
            for (var j = 0; j < bc.item.length; j++) {
                var item = bc.item[j];
                if (j > 0)
                    output = output.concat(", ".concat(item));
                else
                    output = output.concat(" ".concat(item));
            }
            output = output.concat("\n");
        }
        output = output.concat("  )\n");
        //other
        output = output.concat("  ; Constant pool\n");
        output = output.concat("  ; length: ".concat(fn.length, "\n"));
        for (var i_1 = 0; i_1 < parseInt(fn.length); i_1++) {
            output = output.concat("    ; ".concat(i_1.toString().padStart(3, " "), ": "));
            output = output.concat("\n");
        }
        output = output.concat(")\n");
        output = output.concat("\n");
    }
    fs.writeFileSync(fileName + ".js.ty", output);
}
exports.printTypeFile = printTypeFile;
