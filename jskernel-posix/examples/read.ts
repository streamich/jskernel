import * as posix from '../posix';


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




