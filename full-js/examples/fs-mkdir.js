var fs = require('fs');


var file = __dirname + '/dir';


var res = fs.mkdirSync(file);
console.log(res);

fs.mkdir(file + '2', function(err) {
    console.log(err);
});



fs.mkdtempSync(file);
fs.mkdtemp(file, function(err) {
    console.log(err);
});

