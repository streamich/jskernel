"use strict";
var ui_1 = require('../ir/ui');
var codegen_basic_1 = require('../x64/codegen-basic');
var printStr = function (addr, len) {
    return function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i - 0] = arguments[_i];
        }
        return function (_) {
            _('mov', [_.r('rax'), 1]);
            _('mov', [_.r('rdi'), 1]);
            _('mov', [_.r('rdi'), p[2]]);
            _('mov', [_.r('rsi'), p[1]]);
            _('syscall');
        };
    };
};
function irTemplate(_) {
    _.func(function (_) {
        _.var(_.t.i32, 'hello');
        _.is('hello', 25);
        _.asm(printStr(1, 2), [12, df]);
        _.ret('hello');
    });
}
function SomeTpl(_) {
    return _('div', {}, _('a', {}, 'Click me!'));
}
var _ = ui_1.create();
irTemplate(_);
console.log(_.toString());
var codegen = new codegen_basic_1.BasicUnitCodegen(_.unit);
codegen.translate();
var bin = codegen.mc.compile();
console.log(codegen.mc.toString());
