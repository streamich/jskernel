"use strict";
function noop() { }
function createFakeAsyncs(fs) {
    function createFakeAsyncFunction(name) {
        fs[name] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var callback = noop;
            if (args.length && (typeof args[args.length - 1] === 'function')) {
                callback = args[args.length - 1];
                args = args.splice(0, args.length - 1);
            }
            process.nextTick(function () {
                try {
                    var result = fs[name + 'Sync'].apply(null, args);
                    callback(null, result);
                }
                catch (err) {
                    callback(err);
                }
            });
        };
    }
    for (var _i = 0, _a = [
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
    ]; _i < _a.length; _i++) {
        var func = _a[_i];
        createFakeAsyncFunction(func);
    }
}
module.exports = createFakeAsyncs;
