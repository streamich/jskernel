import * as cui from '../c/ui';
import {TranslationUnitPassManager} from '../c/walk';
import {CreateIrPass, AssignTypesPass} from '../c/passes';
import {BasicUnitCodegen} from '../x64/codegen-basic';


var _ = cui.create();

var max = _.func(_.t.int, 'max', [_.t.int, _.t.int], ['num1', 'num2'], (_, num1, num2) => {
    // _.if(num1['>'](num2), _ => {
    //     _.return(num1);
    // }, _ => {
    //     _.return(num2);
    // });
    var a = _.var(_.t.int, 'a');
    _._(a['='](1));
    _.while(num1, _ => {
        _._(a['*='](2));
        _._(num1['--']());
    });
    _.return(a);
});

console.log(_.toString());
// console.dir(_.unit.externalDeclarations, {depth: 10, colors: true});




var typePass = new TranslationUnitPassManager <AssignTypesPass> (new AssignTypesPass);
typePass.onUnit(_.unit);

var irPass = new TranslationUnitPassManager <CreateIrPass> (new CreateIrPass);
irPass.onUnit(_.unit);

// console.log(_.unit.externalDeclarations[0].body.items[0].expression);
// process.exit();


var ir = irPass.pass._.unit;

console.log(ir.toString());
ir.functions[0].assignVirtualRegisters();
console.log(ir.toString());
//
var codegen = new BasicUnitCodegen(ir);
codegen.translate();
console.log(ir.toString());

var bin = codegen.mc.compile();
console.log(codegen.mc.toString());

var StaticBuffer = require('../../static-buffer/buffer').StaticBuffer;
var buf = new StaticBuffer(bin.length, 'rwe');
for(var i = 0; i < bin.length; i++) buf[i] = bin[i];
var res = buf.call([10, 1]);
console.log(res);
