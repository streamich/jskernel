#!/usr/bin/env bash

#bochs -f bochsrc.txt -q

reset
qemu-system-x86_64  -cdrom ./kernel.iso \
                    -curses \
                    -serial stdio
