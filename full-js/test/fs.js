// Run: full-node test/fs.js
var assert = require('assert');
var util = require('util');
var fs1 = require('fs');
var fs2 = node_require('fs');



var test;
var file = __dirname + '/data.txt';


// -----------------------------------------------------------------------------------------
console.log(test = 'readFileSync()');
var res1 = fs1.readFileSync(file, 'utf8');
var res2 = fs2.readFileSync(file, 'utf8');
assert.ok(res1 === res2, test);



// -----------------------------------------------------------------------------------------
console.log(test = 'statSync()');
var props = [
    'dev',
    'mode',
    'nlink',
    'uid',
    'gid',
    'rdev',
    'blksize',
    'ino',
    'size',
    'blocks'
];
var times = [
    // 'atime', // Access time will change too fast...
    'mtime',
    'ctime',
    'birthtime'
];
var res1 = fs1.statSync(file);
var res2 = fs2.statSync(file);
for(var i = 0; i < props.length; i++) {
    var prop = props[i];
    assert.ok(res1[prop] === res2[prop], prop + ': ' + test);
}
for(var i = 0; i < times.length; i++) {
    var prop = times[i];
    var time1 = res1[prop].getTime();
    var time2 = res2[prop].getTime();
    assert.ok(time1 === time2, prop + ': ' + test);
}



// -----------------------------------------------------------------------------------------
console.log(test = 'openSync() and closeSync()');
var fd = fs1.openSync(file, 'r');
assert.ok(fd > 0, 'open: ' + test);
var err = null;
try {
    fs2.closeSync(fd);
} catch(e) {
    err = e;
}
assert.ok(!err, 'close: ' + test);

var fd = fs2.openSync(file, 'r');
assert.ok(fd > 0, 'open 2: ' + test);
var err = null;
try {
    fs1.closeSync(fd);
} catch(e) {
    err = e;
}
assert.ok(!err, 'close 2: ' + test);





console.log('If you see this message, all tests succeeded.');
