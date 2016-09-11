"use strict";
var ast_1 = require('../c/ast');
var _ = ast_1.Builder.context();
var t = _.t;
var add = _.func(t.int, [t.int, t.int], function (_) {
    var _a = _.args(), a = _a[0], b = _a[1];
    var c = _['+'](a, b);
    _.return(c);
});
_.main(function (_) {
    var a = _.var(t.int, 10);
    var b = _.var(t.int, 20);
    var c = _.call(add, [a, b]);
    _.return(c);
});
