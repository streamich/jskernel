// gcc examples/test.cc -o examples/test && ./examples/test
// gcc examples/test.cc -o examples/test.S -O2 -S -c -fverbose-asm
// gcc -g -c examples/test.cc -o examples/test.o
// g++ -g -c examples/test.cc -o examples/test.o
// objdump -d -M intel -S examples/test.o > examples/test.dump

#include <iostream>
#include <stdint.h>
#include <sys/types.h>
#include <stdio.h>


using namespace std;

main()
{
    uint64_t a = 123;
    a++;
    std::cout << a << endl;

    printf("Hello World");


}

