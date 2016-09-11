var fs = require('fs');


var file = __dirname + '/data.txt';


var res = fs.statSync(file);
console.log(res);


fs.stat(file, function(err, res) {
    console.log(err, res);
});