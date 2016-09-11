
function noop() {}

function createFakeAsyncs(fs: any) {
    function createFakeAsyncFunction(name) {
        fs[name] = (...args: any[]) => {
            var callback = noop as any;
            if (args.length && (typeof args[args.length - 1] === 'function')) {
                callback = args[args.length - 1];
                args = args.splice(0, args.length - 1);
            }
            process.nextTick(() => {
                try {
                    var result = fs[name + 'Sync'].apply(null, args);
                    callback(null, result);
                } catch (err) {
                    callback(err);
                }
            });
        }
    }

    for (var func of [
        'appendFile',
        'chmod',
        'fchmod',
        'chown',
        'fchown',
        'close',
        'exists',
        'fsync',
        'fdatasync',
        'stat',
        'fstat',
        'lstat',
        'truncate',
        'ftruncate',
        'utimes',
        'link',
        'mkdir',
        'mkdtemp',
        'open',
        'read',
        'readdir',
        'readFile',
        'readlink',
        'rename',
        'rmdir',
        'symlink',
        'unlink',
        'write',
    ]) createFakeAsyncFunction(func);
}

export = createFakeAsyncs;
