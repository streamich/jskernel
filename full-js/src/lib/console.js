var util = require('./util');


function Console(stdout, stderr) {

    if (!(this instanceof Console)) {
        return new Console(stdout, stderr);
    }
    if (!stdout || typeof stdout.write !== 'function') {
        throw new TypeError('Console expects a writable stream instance');
    }
    if (!stderr) {
        stderr = stdout;
    } else if (typeof stderr.write !== 'function') {
        throw new TypeError('Console expects writable stream instances');
    }

    // if(__DEBUG__) {
    //     this.isFULLjs = true;
    // }

    // var prop = {
    //     writable: true,
    //     enumerable: false,
    //     configurable: true
    // };
    // prop.value = stdout;
    // Object.defineProperty(this, '_stdout', prop);
    this._stdout = stdout;

    // prop.value = stderr;
    // Object.defineProperty(this, '_stderr', prop);
    this._stderr = stderr;

    // prop.value = new Map();
    // Object.defineProperty(this, '_times', prop);
    this._times = {};

    // bind the prototype functions to this Console instance
    for(var k in Console.prototype) this[k] = this[k].bind(this);
}


// As of v8 5.0.71.32, the combination of rest param, template string
// and .apply(null, args) benchmarks consistently faster than using
// the spread operator when calling util.format.
Console.prototype.log = function() {
    this._stdout.write(util.format.apply(null, arguments) + '\n');
};


Console.prototype.info = Console.prototype.log;


Console.prototype.warn = function() {
    this._stderr.write(util.format.apply(null, arguments) + '\n');
};


Console.prototype.error = Console.prototype.warn;


Console.prototype.dir = function(object, options) {
    options = util.extend({customInspect: false}, options);
    this._stdout.write(util.inspect(object, options) + '\n');
};


Console.prototype.time = function(label) {
    this._times[label] = process.hrtime();
};


Console.prototype.timeEnd = function(label) {
    // const time = this._times.get(label);
    const time = this._times[label];
    if (!time) {
        process.emitWarning("No such label '" + label + "' for console.timeEnd()");
        return;
    }
    const duration = process.hrtime(time);
    const ms = duration[0] * 1000 + duration[1] / 1e6;
    this.log('%s: %sms', label, ms.toFixed(3));
    delete this._times[label];
};


Console.prototype.trace = function trace() {
    // TODO probably can to do this better with V8's debug object once that is
    // exposed.
    var err = new Error();
    err.name = 'Trace';
    err.message = util.format.apply(null, arguments);

    // TODO: is `Error.captureStackTrace` specific to V8?
    if(Error.captureStackTrace)
        Error.captureStackTrace(err, trace);

    this.error(err.stack);
};


Console.prototype.assert = function(expression) {
    if (!expression) {
        require('./assert').ok(false, util.format.apply(null, arguments));
    }
};


module.exports = new Console(process.stdout, process.stderr);
module.exports.Console = Console;
