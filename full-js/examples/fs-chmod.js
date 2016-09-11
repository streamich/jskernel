var fs = require('fs');


var file = __dirname + '/data.txt';
var data = 'more text\n';

var res = fs.chmodSync(file, 0);
console.log(res);

fs.chmod(file, 511, function() {});
