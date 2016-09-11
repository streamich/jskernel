"use strict";
var cui = require('../c/ui');
var _ = cui.create();
_.main(function (_) {
    var a = _.var(_.t.int, 'a');
    var test = _.lbl('test');
    _._(a['='](25));
    _.if(a, function (_) {
        _._(a['='](1));
    }, function (_) {
    });
    _.label(test);
    _.return(a);
});
console.log(_.toString());
