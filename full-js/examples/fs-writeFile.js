var fs = require('fs');


var file = __dirname + '/writeFile.txt';


var res = fs.writeFileSync(file, 'trololo 2\n');


fs.writeFile(file + '2', '3', function() {});
