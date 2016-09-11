var fs = require('fs');


var file = __dirname + '/data.txt';


var res = fs.accessSync(file);
console.log(res);

fs.access(file, 'r', function(err, res) {
    console.log(res);
});
