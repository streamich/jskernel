import * as cui from '../c/ui';


var _ = cui.create();
_.main(_ => {                           // void main() {
    var a = _.var(_.t.int, 'a');        //     int a;
    var test = _.lbl('test');
    _._(a['='](25));                    //     a = 25;
    _.if(a, _ => {                      //     if(a) {
        _._(a['='](1));                 //         a = 1;
        // _.for(a, a['='](1), a, _ => {
    //         var b = _.var(_.t.int, 'b');
    //         _._(b['++']()['--']());
    //         _._(_['++'](b));
    //         _._(b['++']());
    //         _._(b['|'](b));
    //         _._(_['--'](b));
    //         _._(b.cast(_.t.char));
    //         _._(_.sizeof(b));
    //         _._(b['--']());
    //         _._(b['*='](b['+'](5)));         // _._ b['='] b['+'] 5
    //     });
    }, _ => {                           //     } else {
    //     _._(a['='](0));                 //         a = 0;
    //     _.while(a, _ => {
    //         _._(a['='](2));
    //         _.goto('test');
    //         _.do(_ => {
    //             _._(a['='](2));
    //         }, 0);
    //     });
    //     _.continue();
    //     _.break();
    //     _.return();
    });                                 //     }
    _.label(test);
    _.return(a);                        //     return a;
});                                     // }

console.log(_.toString());
