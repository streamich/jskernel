OBJECTS = loader.o kmain.o fb.o
CC = gcc
CFLAGS = -m32 -nostdlib -nostdinc -fno-builtin -fno-stack-protector \
		 -nostartfiles -nodefaultlibs -Wall -Wextra -Werror -c
LDFLAGS = -T link.ld -melf_i386
AS = nasm
ASFLAGS = -f elf

all: kernel.elf

kernel.elf: $(OBJECTS)
	ld $(LDFLAGS) $(OBJECTS) -o kernel.elf

kernel.iso: kernel.elf
	cp kernel.elf iso/boot/kernel.elf
	genisoimage -R								\
				-b boot/grub/stage2_eltorito	\
				-no-emul-boot					\
				-boot-load-size 4				\
				-A jskernel 					\
				-V 'jskernel'					\
				-input-charset utf8				\
				-quiet							\
				-boot-info-table				\
				-o kernel.iso					\
				iso

run: kernel.iso
	reset
	qemu-system-x86_64	-cdrom ./kernel.iso		\
						-curses					\
						-serial stdio

%.o: %.c
	$(CC) $(CFLAGS)	 $< -o $@

%.o: %.asm
	$(AS) $(ASFLAGS) $< -o $@

clean:
	rm -rf *.o kernel.elf kernel.iso
