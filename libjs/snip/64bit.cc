// g++ snip/consts.cc -o snip/consts && ./snip/consts
#include <iostream>
#include <stdint.h>
#include <sys/types.h>


using namespace std;


void show(uint64_t num) {
    int i = 0;
    uint64_t pow = 1;
    for(i = 0; i < 64; i++) {
        if(num & pow) cout << 1;
        else cout << 0;
        if(i == 31) cout << "    ";
        pow *= 2;
    }
    cout << endl;
}


int main() {


//    int64_t result = 140455768256512;

    //                    hi                                   lo
    // ||........|........|........|........||........|........|........|........||
    //   ^------------------------------------^
    //        switches these two sign bits
//    int64_t result = -13;

    int64_t result = 2000;
    int32_t lo = result & 0xffffffff;
    int32_t hi = result >> 32;

//    int32_t signlo = 0x80000000 & lo;


//    int32_t signhi = 0x80000000 & hi;

//    lo = lo & 0x7fffffff | signhi;
//    hi = hi & 0x7fffffff | signlo;
//
//    int32_t los = (int32_t) lo;
//    int32_t his = (int32_t) hi;
//
//    std::cout << result << endl;
//    std::cout << los << endl;
//    std::cout << his << endl;


    int64_t back = (((int64_t) hi) << 32) | ((int64_t) lo);


    show(result);
    show(lo);
//    show(signlo);
    show(hi);
//    show(signhi);
    show(back);

    cout << lo << "    " << hi << endl;
    cout << back << endl;




    return 0;
}

