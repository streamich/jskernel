var fs = require('fs');


var rs = fs.createReadStream(__dirname + '/data.txt');
rs.on('data', function(data) {
    console.log('data', data.toString());
});
