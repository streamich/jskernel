"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('events');
var Socket = (function (_super) {
    __extends(Socket, _super);
    function Socket() {
        _super.apply(this, arguments);
    }
    return Socket;
}(events_1.EventEmitter));
exports.Socket = Socket;
function createSocket(type, callback) {
}
exports.createSocket = createSocket;
