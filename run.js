"use strict";
exports.__esModule = true;
var fs = require("fs");
var dumper_1 = require("./src/dumper");
var path = "./sunspider";
var out = "../out";
var files = fs.readdirSync(path);
var list = [];
files.forEach(function (file) {
    if (file.includes(".js"))
        list.push(file.replace(".js", ""));
});
for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
    var item = list_1[_i];
    (0, dumper_1.printTypeFile)(path + "/" + item, out);
}
console.log(files);
