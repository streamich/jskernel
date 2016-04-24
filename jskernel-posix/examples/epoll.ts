import * as posix from '../posix';
import * as socket from '../socket';
import * as defs from '../definitions';


// Create and bind socket.

var sfd = posix.socket(defs.AF.INET, defs.SOCK.STREAM, 0);
if(sfd < 0) {
    console.log('New socket error: ', fd);
    process.exit();
}

var serv_addr: defs.sockaddr_in = {
    sin_family: defs.AF.INET,
    sin_port: socket.hton16(8080),
    sin_addr: {
        s_addr: new socket.Ipv4('0.0.0.0'),
    },
};
var bres = posix.bind(sfd, serv_addr);
if(bres < 0) {
    console.log('Port bind error: ', bres);
    process.exit();
}


// Make socket non-blocking.

var flags = posix.fcntl(sfd, F_GETFL, 0);

// flags = fcntl (sfd, F_GETFL, 0);
// if (flags == -1)
// {
//     perror ("fcntl");
//     return -1;
// }
//
// flags |= O_NONBLOCK;
// s = fcntl (sfd, F_SETFL, flags);
// if (s == -1)
// {
//     perror ("fcntl");
//     return -1;
// }
//
// return 0;

// posix.listen(fd, 10);
//
//
// var client_addr_buf = new Buffer(defs.sockaddr_in.size);
// var sock = posix.accept(fd, client_addr_buf);
//
// setInterval(() => {
//     var msg = new Buffer(255);
//     var bytes = posix.read(sock, msg);
//     var str = msg.toString().substr(0, bytes);
//     posix.write(sock, str);
// }, 50);

// Now telnet to your server and talk to it:
// telnet 127.0.0.1 8080
