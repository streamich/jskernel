# g++ -g -c examples/hello.S -nostdlib -o examples/hello.o && g++ -g examples/hello.o -o examples/hello && objdump -d examples/hello > examples/hello.dump

.global main
main:
        mov $1, %rax
        mov $1, %rdi
        lea 18(%rip), %rsi
        mov $13, %rdx
        syscall
        mov $60, %rax
        syscall
        .ascii "Hello world!\n"

