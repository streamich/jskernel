import * as posix from '../posix';

console.log(`process.pid: ${process.pid}`);
console.log(`process.getuid(): ${process.getuid()}`);
console.log(`process.getgid(): ${process.getgid()}`);


console.log(`posix.getpid(): ${posix.getpid()}`);
console.log(`posix.getppid(): ${posix.getppid()}`);
console.log(`posix.getuid(): ${posix.getuid()}`);
console.log(`geteuid(): ${posix.geteuid()}`);
console.log(`getgid(): ${posix.getgid()}`);
console.log(`getegid(): ${posix.getegid()}`);
