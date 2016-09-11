import * as socket from '../socket';
import * as defs from '../definitions';


var addr: defs.sockaddr_in = {
    sin_family: defs.AF.INET,
    sin_port: socket.hton16(8080),
    sin_addr: {
        s_addr: new socket.Ipv4('127.0.0.1'),
    },
    sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
};
var buf = defs.sockaddr_in.pack(addr);
var unpacked = defs.sockaddr_in.unpack(buf);


console.log(addr);
console.log(buf);
console.log(unpacked);
console.log(unpacked.sin_addr.s_addr.toString());
