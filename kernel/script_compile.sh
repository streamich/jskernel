#!/usr/bin/env bash
nasm -f elf32 loader.asm -o loader.o
ld -T link.ld -melf_i386 loader.o -o kernel.elf
