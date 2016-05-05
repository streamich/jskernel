"use strict";
// Slice of allocated memory.
var Slice = (function () {
    function Slice() {
    }
    return Slice;
}());
exports.Slice = Slice;
// Slices are grouped into classes based on their size "class".
var SliceClass = (function () {
    function SliceClass() {
    }
    return SliceClass;
}());
exports.SliceClass = SliceClass;
// Block allocated from OS.
var Block = (function () {
    function Block() {
    }
    return Block;
}());
exports.Block = Block;
// A pool of "same-purpose" `Block`s allocated from OS.
var Pool = (function () {
    function Pool() {
    }
    return Pool;
}());
exports.Pool = Pool;
