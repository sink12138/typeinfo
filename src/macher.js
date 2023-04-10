"use strict";
exports.__esModule = true;
exports.Matcher = void 0;
var ts = require("typescript");
var decoder_1 = require("./decoder");
var checker_1 = require("./checker");
var Type;
(function (Type) {
    Type["any"] = "any";
    Type["never"] = "never";
    Type["null"] = "null";
    Type["undefined"] = "undefined";
    Type["boolean"] = "bool";
    Type["number"] = "i32";
    Type["string"] = "string";
    Type["object"] = "object";
})(Type || (Type = {}));
var Matcher = /** @class */ (function () {
    function Matcher() {
    }
    Matcher.prototype.getChecker = function () {
        this.checker = new checker_1.Checker();
        this.checker.getTypeInfo(this.fileName.concat(".ts"), {
            target: ts.ScriptTarget.ES5,
            module: ts.ModuleKind.CommonJS
        });
    };
    Matcher.prototype.getDecoder = function () {
        this.decoder = new decoder_1.Decoder();
        this.decoder.decodeBytecode(this.fileName.concat(".txt"));
    };
    Matcher.prototype.init = function (fileName) {
        this.fileName = fileName;
        this.getChecker();
        this.getDecoder();
        this.funcTypes = [];
    };
    Matcher.prototype.match = function () {
        var length = this.decoder.fns.length;
        var cfns = this.checker.fns;
        var dfns = this.decoder.fns;
        console.log("----------------------CHECKER----------------------");
        console.log(JSON.stringify(cfns, null, 4));
        console.log("----------------------DECODER----------------------");
        console.log(JSON.stringify(dfns, null, 4));
        console.log("----------------------MATHCER----------------------");
        var i = 0;
        for (var _i = 0, dfns_1 = dfns; _i < dfns_1.length; _i++) {
            var dfn = dfns_1[_i];
            var fnType = {
                name: dfn.name,
                path: dfn.path,
                ptr: dfn.ptr,
                ln: dfn.ln,
                arg: dfn.arg,
                args: [],
                "return": "",
                stack: dfn.stack,
                "var": dfn["var"],
                locs: [],
                length: dfn.length,
                bytecodes: []
            };
            if (dfn.name != "<eval>") {
                var cfn = cfns[i];
                fnType.args = this.generateArg(cfn);
                fnType["return"] = this.generateRet(cfn);
                fnType.locs = this.generateLoc(dfn, cfn);
                fnType.bytecodes = this.generateByte(dfn, cfn);
                i++;
            }
            else {
                fnType["return"] = "any";
                fnType.locs = this.generateLoc(dfn);
                fnType.bytecodes = this.generateByte(dfn);
            }
            this.funcTypes.push(fnType);
        }
    };
    Matcher.prototype.generateArg = function (fn) {
        if (fn == undefined)
            return [];
        var types = [];
        for (var _i = 0, _a = fn.argType; _i < _a.length; _i++) {
            var arg = _a[_i];
            if (arg.type in Type) {
                types.push({
                    name: arg.name,
                    type: Type[arg.type]
                });
            }
            else {
                types.push({
                    name: arg.name,
                    type: Type.any
                });
            }
        }
        return types;
    };
    Matcher.prototype.generateRet = function (fn) {
        if (fn == undefined)
            return "";
        var type = "any";
        var arr = fn.returnType.split(" ");
        type = arr[arr.length - 1];
        if (type)
            return type;
        else
            return "any";
    };
    Matcher.prototype.generateLoc = function (dFn, cFn) {
        if (dFn == undefined)
            return [];
        var types = [];
        if (cFn != undefined) {
            for (var _i = 0, _a = dFn.locs; _i < _a.length; _i++) {
                var loc = _a[_i];
                for (var _b = 0, _c = cFn.byteType; _b < _c.length; _b++) {
                    var byte = _c[_b];
                    if (loc.name == byte.name) {
                        types.push({
                            type: byte.type,
                            name: loc.name,
                            extend: loc.type
                        });
                    }
                    else if (loc.name == "<ret>") {
                        types.push({
                            type: "any",
                            name: loc.name,
                            extend: loc.type
                        });
                    }
                }
            }
        }
        else {
            for (var _d = 0, _e = dFn.locs; _d < _e.length; _d++) {
                var loc = _e[_d];
                types.push({
                    type: "any",
                    name: loc.name,
                    extend: loc.type
                });
            }
        }
        return types;
    };
    Matcher.prototype.generateByte = function (dFn, cFn) {
        var types = [];
        for (var _i = 0, _a = dFn.bytecodes; _i < _a.length; _i++) {
            var byte = _a[_i];
            types.push({
                offset: byte.offset,
                type: byte.type,
                opcode: byte.item[0],
                item: byte.item.slice(1)
            });
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
    };
    Matcher.prototype.matchByteLoc = function () { };
    Matcher.prototype.matchByteArg = function () { };
    Matcher.prototype.matchByteRet = function () { };
    return Matcher;
}());
exports.Matcher = Matcher;
