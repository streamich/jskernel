var fs = require('fs');


var file = __dirname + '/data.txt';


var fd = fs.openSync(file, 'r');
console.log(fd);

fs.open(file, 'r', function(err, fd) {
    console.log(fd);
});

