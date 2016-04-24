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
}, 50);

// Now telnet to your server and talk to it:
// telnet 127.0.0.1 8080
