var SyncWriteStream = require('fs').SyncWriteStream;


// console.log(SyncWriteStream);
// var s = new SyncWriteStream(1);
// s.write('hello 123');

console.log([123, 123]);

var data = {
    a: 123,
    "asdf": [123, "asdf", {asdf: 123}, [1, 2, 3]]
};

console.log(data);
console.dir(data, {colors: true});
// console.time('lol');
// console.log('timing...');
// console.timeEnd('lol');
console.trace(data);
console.warn('lol');
console.info('lol');
console.error('lol');
console.log('all fine...');



console.log('utf\u0038');


console.log('asdf asdf asdf asdf asdf asdf asdf sadf\nasdf asdfa dfa fasdf asdf asdfasdfasdfasd\n' +
    'asdf asdf asdf asdf asdf asdf asdfa fasdf');




// - [ ] `console.assert(value[, message][, ...])`
// - [ ] `console.error([data][, ...])`
// - [ ] `console.info([data][, ...])`
// - [ ] `console.time(label)`
// - [ ] `console.timeEnd(label)`
// - [ ] `console.trace(message[, ...])`
// - [ ] `console.warn([data][, ...])`