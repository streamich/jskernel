var fs = require('fs');


var file = __dirname + '/data.txt';
var data = 'more text\n';

var res = fs.appendFileSync(file, data);
console.log(res);


fs.appendFile(file, 'trololo\n', function(err) {
    console.log(err);
});