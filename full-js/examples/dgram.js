var dgram = require('dgram');



// var socket = dgram.createSocket('udp4');
//
// console.log(socket);
// socket.send('Hello there', 1234, '127.0.0.1', function(err) {
//     console.log('done', err);
// });


var s = dgram.createSocket('udp4');
s.bind(3333, function() {
    console.log('BOUND');
    // s.addMembership('224.0.0.114');
});
s.on('message', function(data, from) {
    console.log(data.toString(), from);
});
