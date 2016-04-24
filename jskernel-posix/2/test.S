# g++ -Wall -g -c asm.S -nostdlib -o asm.o && g++ -Wall -g asm.o -o asm && ./asm
.global main
main:
    mov $0x3f8, %dx
    add %bl, %al
    add $'0', %al
    out %al, (%dx)
    mov $'\n', %al
    out %al, (%dx)
    hlt                        # invoke operating system to do the write
