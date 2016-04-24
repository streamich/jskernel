import * as posix from '../posix';
import * as socket from '../socket';
import * as defs from '../definitions';

var fd = posix.socket(defs.AF.INET, defs.SOCK.STREAM, 0);

var addr_in: defs.sockaddr_in = {
    sin_family: defs.AF.INET,
    sin_port: socket.hton16(8080),
    sin_addr: {
        s_addr: new socket.Ipv4('127.0.0.1'),
    },
    sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
};

var res;
res = posix.connect(fd, addr_in);
console.log('connect', res);
res = posix.write(fd, 'GET / \n\n');
console.log('write', res);
// posix.send(fd, new Buffer('GET / \n\n\0'));

setTimeout(() => {
    var buf = new Buffer(1000);
    var bytes = posix.read(fd, buf);
    console.log(buf.toString().substr(0, bytes));
    posix.close(fd);
}, 20);
