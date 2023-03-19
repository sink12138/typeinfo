"use strict";
exports.__esModule = true;
var fs = require("fs");
function bytecodeDecoder(fileName) {
    var data = fs.readFileSync(fileName, "utf-8");
    var passage = data.split("\n");
    var i = 0;
    for (var _i = 0, passage_1 = passage; _i < passage_1.length; _i++) {
        var line = passage_1[_i];
        console.log(i + line + "\n");
        i++;
    }
}
bytecodeDecoder(process.argv[2]);
