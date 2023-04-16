import * as fs from "fs";
import {printTypeFile} from "./src/dumper";

let path = "./sunspider"

let files = fs.readdirSync(path);
let list:string[] = [];
files.forEach((file) => {
  if (file.includes(".js")) list.push(file.replace(".js",""));
})
for (const item of list) {
  printTypeFile(path+"/"+item);
}
console.log(files);