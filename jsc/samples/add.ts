import {Builder} from '../c/ast';


var _ = Builder.context();
var t = _.t;


var add = _.func(t.int, [t.int, t.int], _ => {
    var [a, b] = _.args();
    var c = _['+'](a, b);
    _.return(c);
});


_.main(_ => {
    var a = _.var(t.int, 10);
    var b = _.var(t.int, 20);
    var c = _.call(add, [a, b]);
    _.return(c);
});
