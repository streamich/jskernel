#!/usr/bin/env bash

cp ./kernel.elf ./iso/boot/kernel.elf
genisoimage -R                              \
            -b boot/grub/stage2_eltorito    \
            -no-emul-boot                   \
            -boot-load-size 4               \
            -V 'jskernel'                   \
            -A os                           \
            -input-charset utf8             \
            -quiet                          \
            -boot-info-table                \
            -o kernel.iso                   \
            iso
