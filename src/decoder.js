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
        var k = 0; //index of line
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var l = line.replace(/\r|\n/g, "");
            if (l.includes("-- JSFunction")) {
                var ctx = l.split(" ");
                fn.name = ctx[2];
                fn.path = ctx[4];
            }
            else if (l.includes("source ptr:")) {
                var ctx = l.split(" ");
                fn.ptr = ctx[2].replace(",", "");
                fn.ln = ctx[4];
            }
            else if (l.includes("arg count:")) {
                var ctx = l.split(" ");
                fn.arg = ctx[2];
            }
            else if (l.includes("stack size:")) {
                var ctx = l.split(" ");
                fn.stack = ctx[2];
            }
            else if (l.includes("Funtion bytecode:")) {
                flag = 1;
            }
            else if (l.includes("var count:")) {
                var ctx = l.split(" ");
                fn["var"] = ctx[2];
                flag = 2;
            }
            else if (l.includes("length:")) {
                var ctx = l.split(" ");
                fn.length = ctx[1];
                // record root map
                if (fn.name == "<eval>") {
                    fn.rootmap = new Map();
                    var root = lines[k + 1].split(" ").filter(function (e) { return (e != ""); });
                    for (var i = 0; i < root.length; i++) {
                        if (root[i] == "ptr") {
                            var idx = parseInt(root[i - 1].replace(":", ""));
                            var ptr = root[i + 1].replace(/\r|\n/g, "");
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
                    "var": "",
                    length: "",
                    bytecodes: [],
                    locs: []
                };
            }
            else if (l == "Constant pool") {
                flag = 0;
            }
            else if (flag == 1) { // Record bytecode
                var ctx = l.split(" ").filter(function (e) { return e; });
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
                var ctx = l.split(" ").filter(function (e) { return e; });
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
            k++;
        }
    };
    return Decoder;
}());
exports.Decoder = Decoder;
