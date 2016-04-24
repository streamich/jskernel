# jskernel-posix

POSIX/Linux system call API implemented in JavaScript (*Typescript*).

This lib uses [`jskernel-sys`](http://www.npmjs.com/package/jskernel-sys) to execute system calls from JavaScript.

This is part of [`jskernel`](http://www.npmjs.com/package/jskernel) project which long-term goal is to make Node.js dependency free.

## Examples

Read from file:

```ts
import * as posix from 'jskernel-posix';

var filepath = '/share/jskernel-posix/examples/read.txt';
var fd = posix.open(filepath, posix.open.flag.O_RDONLY);
if(fd > -1) {
    var buf = new Buffer(1024);
    var bytes_read = posix.read(fd, buf);
    console.log('Bytes read: ', bytes_read);
    console.log(buf.toString().substr(0, bytes_read));
} else {
    console.log('Error: ', fd);
}
```

Run `stat()` on file:

```ts
import * as posix from 'jskernel-posix';
import * as fs from 'fs';

var filepath = '/share/jskernel-posix/examples/read.txt';
var stats = posix.stat(filepath);
console.log(stats);
console.log(fs.statSync(filepath));
```

Execute simple HTTP `GET` request:

```ts
import * as posix from '../posix';
import * as socket from '../socket';
import * as defs from '../definitions';

var fd = posix.socket(posix.AF.INET, posix.SOCK.STREAM, 0);

var addr_in: defs.sockaddr_in = {
    sin_family: posix.AF.INET,
    sin_port: socket.htons32(80),
    sin_addr: {
        s_addr: new socket.Ipv4('192.168.1.150'),
    },
    sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
};

posix.connect(fd, addr_in);
posix.write(fd, 'GET / \n\n');

setTimeout(() => {
    var buf = new Buffer(1000);
    var bytes = posix.read(fd, buf);
    console.log(buf.toString().substr(0, bytes));
    posix.close(fd);
}, 20);
```

A basic *echo* server:

```ts
import * as posix from '../posix';
import * as socket from '../socket';
import * as defs from '../definitions';

var fd = posix.socket(defs.AF.INET, defs.SOCK.STREAM, 0);

var serv_addr: defs.sockaddr_in = {
    sin_family: defs.AF.INET,
    sin_port: socket.hton16(8080),
    sin_addr: {
        s_addr: new socket.Ipv4('0.0.0.0'),
    },
    sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
};
posix.bind(fd, serv_addr);
posix.listen(fd, 10);


var client_addr_buf = new Buffer(defs.sockaddr_in.size);
var sock = posix.accept(fd, client_addr_buf);

setInterval(() => {
    var msg = new Buffer(255);
    var bytes = posix.read(sock, msg);
    var str = msg.toString().substr(0, bytes);
    posix.write(sock, str);
}, 20);

// Now telnet to your server and talk to it:
// telnet 127.0.0.1 8080
```


