# make --trace

RUNTIME = duktape
TARGET = full-$(RUNTIME)
CC = gcc
CFLAGS = -std=c99
#AR = ar


$(TARGET): $(TARGET).c $(RUNTIME).o
	$(CC) $(CFLAGS) -o $(TARGET) -Isrc/ $(TARGET).c -lm $(RUNTIME).o

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f *.o *.a $(TARGET)
