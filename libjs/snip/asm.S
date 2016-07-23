# g++ -Wall -g -c snip/asm.S -nostdlib -o snip/asm.o && g++ -Wall -g snip/asm.o -o snip/asm && ./snip/asm
# objdump -d snip/asm > snip/asm.dump
.global main
main:
        # write(1, message, 13)
        #movq 0x1122334455667788, %rax
        mov %rax, %rsi
        add $10, %rsi

        mov     $1, %rax                # system call 1 is write
        mov     $1, %rdi                # file handle 1 is stdout
#        mov     $message, %rsi          # address of string to output
#        mov     %pc, %rsi          # address of string to output
        lea     (%rip), %rsi          # address of string to output
        add     $10, %rsi          # address of string to output
        mov     $13, %rdx               # number of bytes
        syscall                         # invoke operating system to do the write

        jmp     0
        jmp     0xffffff
        jmp     *0xffffff
        jmp     0x400576
        jmp     *%rax
        mov $123, %rax
        jmp *%rax
        ret

        # exit(0)
        mov     $60, %rax               # system call 60 is exit
        xor     %rdi, %rdi              # we want return code 0
        syscall                         # invoke operating system to exit
message:
        .ascii  "Hello, world\n"
        