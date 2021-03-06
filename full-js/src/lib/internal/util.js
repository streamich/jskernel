'use strict';

// var binding = process.binding('util');
var binding = {};
var prefix = '(' + process.release.name + ':' + process.pid + ') ';

var kArrowMessagePrivateSymbolIndex = binding['arrow_message_private_symbol'];
var kDecoratedPrivateSymbolIndex = binding['decorated_private_symbol'];

exports.getHiddenValue = binding.getHiddenValue;
exports.setHiddenValue = binding.setHiddenValue;

// All the internal deprecations have to use this function only, as this will
// prepend the prefix to the actual message.
exports.deprecate = function(fn, msg) {
    return exports._deprecate(fn, msg);
};

// All the internal deprecations have to use this function only, as this will
// prepend the prefix to the actual message.
exports.printDeprecationMessage = function(msg, warned, ctor) {
    if (warned || process.noDeprecation)
        return true;
    process.emitWarning(msg, 'DeprecationWarning',
        ctor || exports.printDeprecationMessage);
    return true;
};

exports.error = function(msg) {
    var fmt = prefix + msg;
    if (arguments.length > 1) {
        var args = new Array(arguments.length);
        args[0] = fmt;
        for (var i = 1; i < arguments.length; ++i)
            args[i] = arguments[i];
        console.error.apply(console, args);
    } else {
        console.error(fmt);
    }
};

exports.trace = function(msg) {
    console.trace(prefix + msg);
};

// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports._deprecate = function(fn, msg) {
    // Allow for deprecating things in the process of starting up.
    if (global.process === undefined) {
        return function() {
            return exports._deprecate(fn, msg).apply(this, arguments);
        };
    }

    if (process.noDeprecation === true) {
        return fn;
    }

    var warned = false;
    function deprecated() {
        warned = exports.printDeprecationMessage(msg, warned, deprecated);
        return fn.apply(this, arguments);
    }

    return deprecated;
};

exports.decorateErrorStack = function decorateErrorStack(err) {
    if (!(exports.isError(err) && err.stack) ||
        exports.getHiddenValue(err, kDecoratedPrivateSymbolIndex) === true)
        return;

    var arrow = exports.getHiddenValue(err, kArrowMessagePrivateSymbolIndex);

    if (arrow) {
        err.stack = arrow + err.stack;
        exports.setHiddenValue(err, kDecoratedPrivateSymbolIndex, true);
    }
};

exports.isError = function isError(e) {
    return exports.objectToString(e) === '[object Error]' || e instanceof Error;
};

exports.objectToString = function objectToString(o) {
    return Object.prototype.toString.call(o);
};

var noCrypto = !process.versions.openssl;
exports.assertCrypto = function(exports) {
    if (noCrypto)
        throw new Error('Node.js is not compiled with openssl crypto support');
};
