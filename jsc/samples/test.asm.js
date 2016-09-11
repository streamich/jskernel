"use strict";
var StaticBuffer = require('../../static-buffer/buffer').StaticBuffer;
var code_1 = require('../../ass-js/x86/x64/code');
var operand_1 = require('../../ass-js/x86/operand');
var _ = new code_1.Code;
_._('push', operand_1.rbp);
console.log(_.toString());
