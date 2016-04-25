import * as libjs from '../libjs';
import * as defs from '../definitions';


var filepath = '/share/libjs/examples/read.txt';
var fd = libjs.open(filepath, defs.FLAG.O_RDONLY);
if(fd > -1) {
    var buf = new Buffer(1024);
    var bytes_read = libjs.read(fd, buf);
    console.log('Bytes read: ', bytes_read);
    console.log(buf.toString().substr(0, bytes_read));
} else {
    console.log('Error: ', fd);
}




