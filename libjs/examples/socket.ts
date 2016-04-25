import * as libjs from '../libjs';
import * as socket from '../socket';
import * as defs from '../definitions';

var fd = libjs.socket(defs.AF.INET, defs.SOCK.STREAM, 0);

var addr_in: defs.sockaddr_in = {
    sin_family: defs.AF.INET,
    sin_port: socket.hton16(80),
    sin_addr: {
        s_addr: new socket.Ipv4('192.168.1.150'),
    },
    sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
};

libjs.connect(fd, addr_in);
libjs.write(fd, 'GET / \n\n');
// posix.send(fd, new Buffer('GET / \n\n\0'));

setTimeout(() => {
    var buf = new Buffer(1000);
    var bytes = libjs.read(fd, buf);
    console.log(buf.toString().substr(0, bytes));
    libjs.close(fd);
}, 20);
