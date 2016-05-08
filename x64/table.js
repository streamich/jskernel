"use strict";
var model_1 = require('./model');
var Table = (function () {
    function Table() {
    }
    Table.prototype.movq = function (src, dst) {
        // 48 89 c0             	mov    %rax,%rax
        if (src instanceof model_1.Register) {
            if (dst instanceof model_1.Register) {
                return [0x48, 0x89, 0xC0];
            }
        }
    };
    return Table;
}());
