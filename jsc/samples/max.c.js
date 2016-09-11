"use strict";
var cui = require('../c/ui');
var walk_1 = require('../c/walk');
var passes_1 = require('../c/passes');
var codegen_basic_1 = require('../x64/codegen-basic');
var _ = cui.create();
var max = _.func(_.t.int, 'max', [_.t.int, _.t.int], ['num1', 'num2'], function (_, num1, num2) {
    var a = _.var(_.t.int, 'a');
    _._(a['='](1));
    _.while(num1, function (_) {
        _._(a['*='](2));
        _._(num1['--']());
    });
    _.return(a);
});
console.log(_.toString());
var typePass = new walk_1.TranslationUnitPassManager(new passes_1.AssignTypesPass);
typePass.onUnit(_.unit);
var irPass = new walk_1.TranslationUnitPassManager(new passes_1.CreateIrPass);
irPass.onUnit(_.unit);
var ir = irPass.pass._.unit;
console.log(ir.toString());
ir.functions[0].assignVirtualRegisters();
console.log(ir.toString());
var codegen = new codegen_basic_1.BasicUnitCodegen(ir);
codegen.translate();
console.log(ir.toString());
var bin = codegen.mc.compile();
console.log(codegen.mc.toString());
var StaticBuffer = require('../../static-buffer/buffer').StaticBuffer;
var buf = new StaticBuffer(bin.length, 'rwe');
for (var i = 0; i < bin.length; i++)
    buf[i] = bin[i];
var res = buf.call([10, 1]);
console.log(res);
