"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var DataBuffer = (function () {
    function DataBuffer() {
        this.length = 0; // Size in bytes.
    }
    return DataBuffer;
}());
exports.DataBuffer = DataBuffer;
var Register64DataBuffer = (function (_super) {
    __extends(Register64DataBuffer, _super);
    function Register64DataBuffer() {
        _super.apply(this, arguments);
        this.length = 8;
    }
    return Register64DataBuffer;
}(DataBuffer));
exports.Register64DataBuffer = Register64DataBuffer;
var MemoryDataBuffer = (function (_super) {
    __extends(MemoryDataBuffer, _super);
    function MemoryDataBuffer() {
        _super.apply(this, arguments);
    }
    return MemoryDataBuffer;
}(DataBuffer));
exports.MemoryDataBuffer = MemoryDataBuffer;
var Pointer = (function () {
    function Pointer() {
    }
    return Pointer;
}());
exports.Pointer = Pointer;
var IndexPointer = (function (_super) {
    __extends(IndexPointer, _super);
    function IndexPointer() {
        _super.apply(this, arguments);
        this.factor = 1; // One element size in bytes.
    }
    return IndexPointer;
}(Pointer));
exports.IndexPointer = IndexPointer;
var MemoryPointer = (function (_super) {
    __extends(MemoryPointer, _super);
    function MemoryPointer() {
        _super.apply(this, arguments);
    }
    return MemoryPointer;
}(IndexPointer));
exports.MemoryPointer = MemoryPointer;
var SlicePointer = (function (_super) {
    __extends(SlicePointer, _super);
    function SlicePointer(buf, offset, length) {
        if (offset === void 0) { offset = 0; }
        if (length === void 0) { length = buf.length; }
        _super.call(this);
        this.offset = 0;
        this.length = 0;
        this.buffer = buf;
        this.offset = offset;
        this.length = length;
    }
    return SlicePointer;
}(Pointer));
exports.SlicePointer = SlicePointer;
var dr1 = new Register64DataBuffer();
var rax = new SlicePointer(dr1, 0, 8);
var eax = new SlicePointer(dr1, 4, 4);
var al = new SlicePointer(dr1, 6, 2);
var Cpu = (function () {
    function Cpu() {
        this.pointers = {};
    }
    return Cpu;
}());
exports.Cpu = Cpu;
var Cpu86 = (function () {
    function Cpu86() {
        this.p = {
            PC: new SlicePointer(new Register64DataBuffer(), 0, 8),
            RAX: new SlicePointer(dr1, 0, 8),
            EAX: new SlicePointer(dr1, 4, 4)
        };
    }
    return Cpu86;
}());
exports.Cpu86 = Cpu86;
