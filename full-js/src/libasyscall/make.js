var AsyscallCompiler = require('./compiler').AsyscallCompiler;
var fs = require('fs');


var compiler = new AsyscallCompiler;
var bin = compiler.compile(2, 100);
var str = 'module.exports = [' + bin.join(',') + '];';
fs.writeFile(__dirname + '/bin.js', str);
