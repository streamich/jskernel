
var msg = 'Hello world\n';
// var buf = StaticBuffer.alloc(msg.length, 'rw');
var buf = new StaticBuffer(msg.length);
for(var i = 0; i < msg.length; i++) buf[i] = msg.charCodeAt(i);
var addr = buf.getAddress();
console.log(addr);

process.syscall(1, 1, addr, msg.length);
process.asyscall(1, 1, addr, msg.length, function(res) {
    console.log(res);
});
