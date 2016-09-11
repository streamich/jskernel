import * as libjs from '../libjs';
import * as sys from '../node_modules/libsys/index';


// mmap(0, size, PROT_READ | PROT_WRITE | PROT_EXEC, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
var filepath = '/share/jskernel-posix/examples/read.txt';
// var fd = libjs.open(filepath, posix.OFLAG.O_RDONLY);
// console.log(fd);

var code = new Buffer([
    0x48, 0x89, 0xc6,                   // mov    %rax,%rsi # Store address of this code in %rsi.
    0x48, 0xc7, 0xc0, 1, 0, 0, 0, 	    // mov    $0x1,%rax # System call `1` -- SYS_write
    0x48, 0xc7, 0xc7, 1, 0, 0, 0, 	    // mov    $0x1,%rdi # File descriptor `1` -- STDOUT
    0x48, 0x83, 0xc6, 31,               // add    $31,%rsi  # Set in %rsi register where our data begins.
    0x48, 0xc7, 0xc2, 13, 0, 0, 0, 	    // mov    $13,%rdx  # Number of bytes to write -- 0xd = 13
    0x0f, 0x05,                	        // syscall          # Execute the system call.
    0xc3,                  	            // retq             # Return
    0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, // Hello_
    0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21, // World!
    0x0A, 0                             // \n\0
]);

var addr = libjs.mmap(0, 1024, libjs.PROT.READ | libjs.PROT.WRITE | libjs.PROT.EXEC, libjs.MAP.PRIVATE | libjs.MAP.ANONYMOUS, -1, 0);
// var addr = libjs.mmap(0, 1024, 7, 34, -1, 0);
console.log(addr);

// var myaddr = [0x44332211, 0x88776655];
var myaddr = addr;

// var addrbuf = new Buffer(8);
// addrbuf.writeInt32LE(myaddr[0], 0);
// addrbuf.writeInt32LE(myaddr[1], 4);
// console.log('addrbuf', addrbuf);

// addrbuf.copy(code, 2);

var arr = sys.malloc64(addr[0], addr[1], 1024);
var buf = new Buffer(arr);

code.copy(buf, 0);

console.log(code);
console.log(arr);
console.log(buf);

(sys as any).call64(addr[0], addr[1]);

// setTimeout(() => {}, 3000);
