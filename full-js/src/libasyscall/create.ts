

if(!process.asyscall) {
    if(process.hasBinaryUtils && __BUILD_ASYNC_SYSCALL__) {

        // Here we create on the fly a thread pool to run the
        // asynchronous system call function, we use `process.call`
        // and `process.frame`.

        var Asyscall = require('./index').Asyscall;
        var asyscall = new Asyscall;
        asyscall.build();

        process.asyscall = asyscall.exec.bind(asyscall);
        process.asyscall64 = asyscall.exec64.bind(asyscall);

    } else {

        // Create fake asynchronous system calls by just wrapping the
        // synchronous version.

        process.asyscall = function() {
            var len = arguments.length - 1;
            var args = new Array(len);
            for(var i = 0; i < len; i++) args[i] = arguments[i];
            var res = process.syscall.apply(null, args);
            arguments[len](res);
        };

        process.asyscall64 = function() {
            var len = arguments.length - 1;
            var args = new Array(len);
            for(var i = 0; i < len; i++) args[i] = arguments[i];
            var res = process.syscall64.apply(null, args);
            arguments[len](res);
        };

    }
}


