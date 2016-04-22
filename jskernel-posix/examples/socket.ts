import * as posix from '../posix';


// listenfd = socket(AF_INET, SOCK_STREAM, 0);
var fd = posix.socket(posix.AF.INET, posix.SOCK.STREAM, 0);
console.log(fd);
