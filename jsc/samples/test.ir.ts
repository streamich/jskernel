import {create} from '../ir/ui';
import {BasicUnitCodegen} from '../x64/codegen-basic';


var printStr = (addr, len) => {
    return (...p) => {
        return _ => {
            _('mov', [_.r('rax'), 1]);
            _('mov', [_.r('rdi'), 1]);
            _('mov', [_.r('rdi'), p[2]]);
            _('mov', [_.r('rsi'), p[1]]);
            _('syscall');
        };
    };
};

function irTemplate(_) {
    _.func(_ => {
        _.var(_.t.i32, 'hello');
        _.is('hello', 25);
        _.asm(printStr(1, 2), [12, df]);
        _.ret('hello');
    });
}

function SomeTpl(_) {
    return _('div', {},
        _('a', {}, 'Click me!')
    );
}


var _ = create();
irTemplate(_);
console.log(_.toString());


var codegen = new BasicUnitCodegen(_.unit);
codegen.translate();

var bin = codegen.mc.compile();
console.log(codegen.mc.toString());
