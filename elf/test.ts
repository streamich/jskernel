import * as fs from 'fs';
import * as elf from './elf';


// Create ELF file.
// var file = elf.File.createExecutable();
// console.log(file);



var file = new elf.File;
// var bin = fs.readFileSync(__dirname + '/examples/hello');
var bin = fs.readFileSync(__dirname + '/asm');
file.parse(bin);
console.log(file);
// console.log(elf.fh.data);
// console.log(elf.toJson());
// console.log(elf.sh[12].data);
// console.log(elf.getStringSection().dataBuffer().toString());
// console.log(file.getStringSection().getName());
// for(var s of file.sh) {
//     console.log(s.getName());
// }
// fs.writeFileSync(__dirname + '/test.json', JSON.stringify(file.toJson(), null, 2));
// console.log(elf.fh.data);


// console.log(bin);