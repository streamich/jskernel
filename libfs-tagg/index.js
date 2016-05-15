var Worker = require('webworker-threads').Worker;
// var w = new Worker('worker.js'); // Standard API
var a = 123;
// You may also pass in a function:
var worker = new Worker(function () {
    console.log(require);
    postMessage('asdf');
    this.onmessage = function (event) {
        postMessage('Hi ' + event.data);
        self.close();
    };
});
worker.onmessage = function (event) {
    console.log("Worker said : " + event.data);
};
worker.postMessage('ali');
