import * as libjs from '../libjs';
import * as sys from '../sys';



var key = 6566;
var shmid = libjs.shmget(key, 1024, libjs.IPC.CREAT | 438 ); // 438 = 0666
// var shmid = libjs.shmget(key, 1024, libjs.IPC.CREAT);
var addr = libjs.shmat(shmid, libjs.NULL, 0);

var buf = sys.malloc64(addr[0], addr[1], 1024);


console.log(shmid);
console.log('addr', addr);
console.log('buf', buf);

