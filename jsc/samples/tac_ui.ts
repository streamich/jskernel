import {create, COND} from '../ir/ui';
import {BasicUnitCodegen} from '../x64/codegen-basic';
import {TypePointer} from "../ir/type";


var _ = create();
_.func('main', _ => {
    var a2 = _.assign(null, 101, new TypePointer(new TypePointer(_.t.i32)));
    var a = _.var('a', _.t.i64);
    _.assign(a, 200);
    var b = _.var('b');
    _.add(b, a, 11);
    _.sub(b, b, 1);
    _.mul(b, b, 1);
    _.sdiv(b, b, 1);
    _.udiv(b, b, 1);
    _.trunc(b, b, _.t.i32);
    _.zext(b, b, _.t.i32);
    _.sext(b, b, _.t.i32);
    _.inttoptr(b, b, _.t.i32);
    _.ptrtoint(b, b, _.t.i32);
    _.bitcast(b, b, _.t.i32);
    var lblTrue = _.lbl('lblTrue');
    var lblFalse = _.lbl('lblFalse');
    _.label('test');


    var cmpRes = _.var('cr', _.t.i1);
    _.cmp(cmpRes, a, b, COND.NE);

    _.br(cmpRes, lblTrue, lblFalse);

    _.alloc(a, _.t.i32);
    _.store(_.var('ptr'), 4);
    _.load(a, b, _.t.i32);

    _.return(a);
});


console.log(_.toString());
// var codegen = new BasicUnitCodegen(_.unit);
// codegen.translate();
// console.log(codegen.mc.toString());

