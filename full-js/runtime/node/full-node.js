#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
// Above is a "two line" shebang, don't delete the second line.


// Save the original Node.js `require` function as global `node_require`,
// used for testing.
node_require = require;


// full.js requires `global` and `process` global variables, just like
// Node.js, we skip this step as Node.js already has those set up.
// global = {};
// process = {};
// global.process = process;


process.runtime = 'node.js';
process.platform = 'linux';
process.arch = 'x64';


// Remove first argument
process.argv = process.argv.splice(1);


// We use `libsys` Node.js package to implement the native dependencies for full.js
var libsys = require('libsys');


// The only must-have dependencies are `syscall` and `syscall64` functions:
process.syscall = libsys.syscall;
process.syscall64 = libsys.syscall64;


// Additional "nice-to-have" things for full.js, which are optional.
process.call = libsys.call;
process.frame = libsys.malloc;
process.getAddress = libsys.addressArrayBuffer64;
process.errno = libsys.errno;


// Finally, just load `/dist/full.js` and `eval` it.
// var full_js = fs.readFileSync(__dirname + '/../../dist/full.js', 'utf8');
if(!process.argv[1]) {
    console.log('Please provide path to full.js');
} else {
    var fs = require('fs');
    var full_js = fs.readFileSync(process.argv[1], 'utf8');
    eval(full_js);
}
