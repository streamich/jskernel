var c = require('jsc');


var main = c.func(c.i8, [c.p(c.i8), c.i32], function(argc, argv) {
    var str = c.p(c.ui8, 'Hello world\n');
    c.if(str, function() {
        
    });
    
    return 0;
});



var main = c.func(c.void, [], () => {
    var n = c.int(), z = c.int();
    c.if(c['=='](n, 2), () => {
        printf("Primer number.\n");
    }).else(() => {
        c.for(c['=='](z, 2), c['<='](z, c['-'](n, 1)), c['.++'](z), () => {
            c.if(c['=='](c['%'](n, z), 0), () => {
                c.break();
            });
        });
    });
});

var main = _.func(c.void, [], () => {
    var n = _.int(), z = _.int();
    _.if(_['=='](n, 2), () => {
        printf("Primer number.\n");
    }).else(() => {
        _.for(_['=='](z, 2), _['<='](z, _['-'](n, 1)), _['.++'](z), () => {
            _.if(_['=='](_['%'](n, z), 0), () => {
                _.break();
            });
        });
    });
});


