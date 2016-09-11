# make --trace

RUNTIME = duktape
TARGET = full-$(RUNTIME)
CC = gcc
#CC = musl-gcc

# IMPORTANT: Do not enable `-std=c99` in that case system call is defined as
# `int syscall()`, but we need `long syscall()`, everything will break if you
# enable `std=c99`.
#CFLAGS = -std=c99
CFLAGS = -static
#CFLAGS = -static -Os


$(TARGET): $(TARGET).c $(RUNTIME).o
	$(CC) $(CFLAGS) -o $(TARGET) -lm -Isrc/ $(TARGET).c -lm $(RUNTIME).o -lm

#try: try.c $(RUNTIME).o
#	$(CC) $(CFLAGS) -o try -Isrc/ try.c -lm $(RUNTIME).o

%.o: %.c
	$(CC) $(CFLAGS) -c $< -lm -o $@ -lm

clean:
	rm -f *.o *.a $(TARGET) try
