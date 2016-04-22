# jskernel-posix

POSIX/Linux system call API implemented in JavaScript (*Typescript*).

This lib uses [`jskernel-sys`](http://www.npmjs.com/package/jskernel-sys) to execute system calls from JavaScript.

This is part of [`jskernel`](http://www.npmjs.com/package/jskernel) project which long-term goal is to make Node.js dependency free.

## Examples

Read from file:

```js
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

```js
import * as posix from 'jskernel-posix';
import * as fs from 'fs';

var filepath = '/share/jskernel-posix/examples/read.txt';
var stats = posix.stat(filepath);
console.log(stats);
console.log(fs.statSync(filepath));
```

Execute simple HTTP `GET` request:

```js
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
