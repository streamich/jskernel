"use strict";
var i = require('./instruction');
var o = require('./operand');
var util_1 = require('../util');
var Code = (function () {
    function Code() {
        this.operandSize = o.SIZE.DOUBLE; // Default operand size.
        this.addressSize = o.SIZE.DOUBLE; // Default address size.
        this.mode = o.MODE.X64;
        this.expr = [];
        this.ClassInstruction = i.Instruction;
    }
    Code.prototype.ins = function (definition, operands) {
        var instruction = new this.ClassInstruction(definition, operands);
        instruction.create();
        instruction.index = this.expr.length;
        this.expr.push(instruction);
        return instruction;
    };
    Code.prototype.insTable = function (group, ops, size) {
        if (ops === void 0) { ops = []; }
        if (size === void 0) { size = this.operandSize; }
        var operands = o.Operands.fromUiOps(ops);
        var definition = this.table.find(group, operands, size);
        if (!definition)
            throw Error("Definition for \"" + group + (operands.list.length ? ' ' + operands.toString() : '') + "\" not found.");
        return this.ins(definition, operands);
    };
    Code.prototype.isRegOrMem = function (operand) {
        if ((operand instanceof o.Register) || (operand instanceof o.Memory))
            return true;
        return false;
    };
    Code.prototype.toRegOrMem = function (operand) {
        if (operand instanceof o.Register)
            return operand;
        if (operand instanceof o.Memory)
            return operand;
        if (operand instanceof o.Immediate)
            throw TypeError('Operand cannot be of type Immediate.');
        return this.mem(operand);
    };
    // Displacement is up to 4 bytes in size, and 8 bytes for some specific MOV instructions, AMD64 Vol.2 p.24:
    //
    // > The size of a displacement is 1, 2, or 4 bytes.
    //
    // > Also, in 64-bit mode, support is provided for some 64-bit displacement
    // > and immediate forms of the MOV instruction. See “Immediate Operand Size” in Volume 1 for more
    // > information on this.
    Code.prototype.mem = function (disp) {
        if (typeof disp === 'number')
            return o.Memory.factory(this.addressSize).disp(disp);
        else if ((disp instanceof Array) && (disp.length == 2))
            return o.Memory.factory(this.addressSize).disp(disp);
        else
            throw TypeError('Displacement value must be of type number or number64.');
    };
    Code.prototype.disp = function (disp) {
        return this.mem(disp);
    };
    Code.prototype.label = function (name) {
        var label = new i.Label(name);
        this.expr.push(label);
        return label;
    };
    Code.prototype.db = function (a, b) {
        var octets;
        if (a instanceof Array) {
            octets = a;
        }
        else if (typeof a === 'string') {
            var encoding = typeof b === 'string' ? b : 'ascii';
            // var buf = Buffer.from(a, encoding);
            var buf = new Buffer(a, encoding);
            octets = Array.prototype.slice.call(buf, 0);
        }
        else if (a instanceof Buffer) {
            octets = Array.prototype.slice.call(a, 0);
        }
        else
            throw TypeError('Data must be an array of octets, a Buffer or a string.');
        var data = new i.Data;
        data.index = this.expr.length;
        data.octets = octets;
        this.expr.push(data);
        return data;
    };
    Code.prototype.dw = function (words, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        var size = 4;
        var octets = new Array(words.length * size);
        for (var i = 0; i < words.length; i++) {
            if (littleEndian) {
                octets[i * size + 0] = (words[i] >> 0x00) & 0xFF;
                octets[i * size + 1] = (words[i] >> 0x08) & 0xFF;
            }
            else {
                octets[i * size + 0] = (words[i] >> 0x08) & 0xFF;
                octets[i * size + 1] = (words[i] >> 0x00) & 0xFF;
            }
        }
        return this.db(octets);
    };
    Code.prototype.dd = function (doubles, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        var size = 4;
        var octets = new Array(doubles.length * size);
        for (var i = 0; i < doubles.length; i++) {
            if (littleEndian) {
                octets[i * size + 0] = (doubles[i] >> 0x00) & 0xFF;
                octets[i * size + 1] = (doubles[i] >> 0x08) & 0xFF;
                octets[i * size + 2] = (doubles[i] >> 0x10) & 0xFF;
                octets[i * size + 3] = (doubles[i] >> 0x18) & 0xFF;
            }
            else {
                octets[i * size + 0] = (doubles[i] >> 0x18) & 0xFF;
                octets[i * size + 1] = (doubles[i] >> 0x10) & 0xFF;
                octets[i * size + 2] = (doubles[i] >> 0x08) & 0xFF;
                octets[i * size + 3] = (doubles[i] >> 0x00) & 0xFF;
            }
        }
        return this.db(octets);
    };
    Code.prototype.dq = function (quads, littleEndian) {
        if (littleEndian === void 0) { littleEndian = true; }
        if (!(quads instanceof Array))
            throw TypeError('Quads must be and array of number[] or [number, number][].');
        if (!quads.length)
            return this.dd([]);
        var doubles = new Array(quads.length * 2);
        if (typeof quads[0] === 'number') {
            var qnumbers = quads;
            for (var i = 0; i < qnumbers.length; i++) {
                var hi = util_1.UInt64.hi(qnumbers[i]);
                var lo = util_1.UInt64.lo(qnumbers[i]);
                if (littleEndian) {
                    doubles[i * 2 + 0] = lo;
                    doubles[i * 2 + 1] = hi;
                }
                else {
                    doubles[i * 2 + 0] = hi;
                    doubles[i * 2 + 1] = lo;
                }
            }
        }
        else if (quads[0] instanceof Array) {
            var numbers64 = quads;
            for (var i = 0; i < numbers64.length; i++) {
                var _a = numbers64[i], lo = _a[0], hi = _a[1];
                if (littleEndian) {
                    doubles[i * 2 + 0] = lo;
                    doubles[i * 2 + 1] = hi;
                }
                else {
                    doubles[i * 2 + 0] = hi;
                    doubles[i * 2 + 1] = lo;
                }
            }
        }
        else
            throw TypeError('Quads must be and array of number[] or [number, number][].');
        return this.dd(doubles);
    };
    Code.prototype.resb = function (length) {
        var data = new i.DataUninitialized(length);
        data.index = this.expr.length;
        this.expr.push(data);
        return data;
    };
    Code.prototype.resw = function (length) {
        return this.resb(length * 2);
    };
    Code.prototype.resd = function (length) {
        return this.resb(length * 4);
    };
    Code.prototype.resq = function (length) {
        return this.resb(length * 8);
    };
    Code.prototype.rest = function (length) {
        return this.resb(length * 10);
    };
    Code.prototype.incbin = function (filepath, offset, len) {
        var fs = require('fs');
        if (typeof offset === 'undefined') {
            return this.db(fs.readFileSync(filepath));
        }
        else if (typeof len === 'undefined') {
            if (typeof offset !== 'number')
                throw TypeError('Offset must be a number.');
            var fd = fs.openSync(filepath, 'r');
            var total_len = 0;
            var data = [];
            var CHUNK = 4096;
            var buf = new Buffer(CHUNK);
            var bytes = fs.readSync(fd, buf, 0, CHUNK, offset);
            data.push(buf.slice(0, bytes));
            total_len += len;
            while ((bytes > 0) && (total_len < len)) {
                buf = new Buffer(4096);
                bytes = fs.readSync(fd, buf, 0, CHUNK);
                if (bytes > 0) {
                    data.push(buf.slice(0, bytes));
                    total_len += bytes;
                }
            }
            buf = Buffer.concat(data);
            if (total_len > len)
                buf = buf.slice(0, len);
            fs.closeSync(fd);
            return this.db(buf);
        }
        else {
            if (typeof offset !== 'number')
                throw TypeError('Offset must be a number.');
            if (typeof len !== 'number')
                throw TypeError('Length must be a number.');
            var buf = new Buffer(len);
            var fd = fs.openSync(filepath, 'r');
            var bytes = fs.readSync(fd, buf, 0, len, offset);
            buf = buf.slice(0, bytes);
            fs.closeSync(fd);
            return this.db(buf);
        }
    };
    Code.prototype.compile = function () {
        var code = [];
        for (var _i = 0, _a = this.expr; _i < _a.length; _i++) {
            var ins = _a[_i];
            code = ins.write(code);
        }
        return code;
    };
    Code.prototype.toString = function (hex) {
        if (hex === void 0) { hex = true; }
        return this.expr.map(function (ins) { return ins.toString('    ', hex); }).join('\n');
    };
    return Code;
}());
exports.Code = Code;
