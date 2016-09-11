import {create, COND} from '../ir/ui';
import {BasicUnitCodegen} from '../x64/codegen-basic';
import {TypePointer} from "../ir/type";


var _ = create();
_.func('main', _ => {

    var a = _.var();
    _.assign(a, 25);

    var isTrue = _.var();
    _.cmp(isTrue, a, 2, COND.NE);

    var lblTrue = _.lbl();
    var lblFalse = _.lbl();
    var lblContinue = _.lbl();

    _.br(isTrue, lblTrue, lblFalse);

    _.label(lblTrue);
    _.assign(a, 1);
    _.jmp(lblContinue);

    _.label(lblFalse);
    _.assign(a, 0);

    _.label(lblContinue);
});


console.log(_.toString());
// console.log(_.unit.functions[0].vars);
var codegen = new BasicUnitCodegen(_.unit);
codegen.translate();
console.log(_.toString());
codegen.mc.compile();
console.log(codegen.mc.toString());

