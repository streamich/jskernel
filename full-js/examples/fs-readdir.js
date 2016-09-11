var fs = require('fs');

try {
    var list = fs.readdirSync(__dirname);
    console.log(list);



    fs.readdir(__dirname, function(err, list) {
        console.log('err');
        console.log(err);
        console.log('async:');
        console.log(list);
    });


} catch (e) {
    console.log(e);
    console.log(e.stack);
}
