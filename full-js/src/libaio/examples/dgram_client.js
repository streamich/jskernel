var dgram = require('dgram');
var client = dgram.createSocket('udp4');
client.send('HELLO', 0, 5, 1234, 'localhost', function (err) {
    client.close();
});
