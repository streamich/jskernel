# POSIX syscalls implemented in JavaScript



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

