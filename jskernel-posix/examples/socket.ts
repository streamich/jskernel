import * as posix from '../posix';
import * as socket from '../socket';
import * as defs from '../definitions';

var fd = posix.socket(defs.AF.INET, defs.SOCK.STREAM, 0);

var addr_in: defs.sockaddr_in = {
    sin_family: defs.AF.INET,
    sin_port: socket.htons32(80),
    sin_addr: {
        s_addr: new socket.Ipv4('192.168.1.150'),
    },
    sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
};

posix.connect(fd, addr_in);
posix.write(fd, 'GET / \n\n');
// posix.send(fd, new Buffer('GET / \n\n'));

setTimeout(() => {
    var buf = new Buffer(1000);
    var bytes = posix.read(fd, buf);
    console.log(buf.toString().substr(0, bytes));
    posix.close(fd);
}, 20);
