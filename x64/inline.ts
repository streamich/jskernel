
function inline() {
    return function(target, property, descriptor) {
        console.log(target, property, descriptor);
    }
}

class Text2 {

    @inline
    inf(a, b) {
        return a + b;
    }

    do_work() {
        return this.inf(3, 5);
    }
}



