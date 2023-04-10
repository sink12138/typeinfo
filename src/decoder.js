"use strict";
exports.__esModule = true;
exports.Decoder = void 0;
var fs = require("fs");
var Decoder = /** @class */ (function () {
    function Decoder() {
    }
    Decoder.prototype.decodeBytecode = function (fileName) {
        this.fns = [];
        var fn = {
            name: "",
            path: "",
            ptr: "",
            ln: "",
            arg: "",
            stack: "",
            "var": "",
            length: "",
            bytecodes: [],
            locs: []
        };
        ;
        var bytecode = {
            type: "any",
            offset: -1,
            item: []
        };
        var loc = {
            name: "",
            type: []
        };
        var data = fs.readFileSync(fileName, "utf-8");
        var lines = data.split("\n");
        var flag = 0;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            line = line.replace(/\r|\n/g, "");
            if (line.includes("-- JSFunction")) {
                var ctx = line.split(" ");
                fn.name = ctx[2];
                fn.path = ctx[4];
            }
            else if (line.includes("source ptr:")) {
                var ctx = line.split(" ");
                fn.ptr = ctx[2].replace(",", "");
                fn.ln = ctx[4];
            }
            else if (line.includes("arg count:")) {
                var ctx = line.split(" ");
                fn.arg = ctx[2];
            }
            else if (line.includes("stack size:")) {
                var ctx = line.split(" ");
                fn.stack = ctx[2];
            }
            else if (line.includes("Funtion bytecode:")) {
                flag = 1;
                continue;
            }
            else if (line.includes("var count:")) {
                var ctx = line.split(" ");
                fn["var"] = ctx[2];
                flag = 2;
                continue;
            }
            else if (line.includes("length:")) {
                var ctx = line.split(" ");
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
                    "var": "",
                    length: "",
                    bytecodes: [],
                    locs: []
                };
            }
            else if (line == "Constant pool") {
                flag = 0;
            }
            else if (flag == 1) { // Record bytecode
                var ctx = line.split(" ").filter(function (e) { return e; });
                bytecode = {
                    type: "any",
                    offset: -1,
                    item: []
                };
                bytecode.offset = parseInt(ctx[0].substring(0, ctx[0].length - 1));
                bytecode.item = ctx.slice(1);
                for (var i in bytecode.item)
                    bytecode.item[i] = bytecode.item[i].replace(",", "");
                fn.bytecodes.push(bytecode);
            }
            else if (flag == 2) { // Record local
                var ctx = line.split(" ").filter(function (e) { return e; });
                loc = {
                    name: "",
                    type: []
                };
                loc.name = ctx[0].substring(0, ctx[0].length - 1);
                loc.type = ctx.slice(1);
                for (var i in loc.type)
                    loc.type[i] = loc.type[i].replace(".", "");
                fn.locs.push(loc);
            }
        }
    };
    return Decoder;
}());
exports.Decoder = Decoder;
// let decoder = new Decoder();
// decoder.decodeBytecode(process.argv[2]);
// console.log(JSON.stringify(decoder.fns));
