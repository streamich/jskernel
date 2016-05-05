#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>

// gcc snip/jit.cc -o snip/jit && snip/jit

// Allocates RWX memory of given size and returns a pointer to it. On failure,
// prints out the error and returns NULL.
void* alloc_executable_memory(size_t size) {
  printf("%d, %d, %d, %d, %d, %d\n", 0, size, PROT_READ | PROT_WRITE | PROT_EXEC, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
  void* ptr = mmap(0, size, PROT_READ | PROT_WRITE | PROT_EXEC, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
  if (ptr == (void*)-1) {
    perror("mmap");
    return NULL;
  }
  return ptr;
}

void emit_code_into_memory(unsigned char* m) {
  unsigned char code[] = {
//    0x48, 0x89, 0xf8,                   // mov %rdi, %rax
//    0x48, 0x83, 0xc0, 0x01,             // add $4, %rax
//    0x48, 0x83, 0xc0, 0x7f,             // add $4, %rax
//    0xc3                                // ret


      0x48, 0xc7, 0xc0, 0x01, 0x00, 0x00, 0x00, 	// mov    $0x1,%rax
      0x48, 0xc7, 0xc7, 0x01, 0x00, 0x00, 0x00, 	// mov    $0x1,%rdi
//      0x48, 0xc7, 0xc6, 0xa0, 0x05, 0x40, 0x00, 	// mov    $0x4005a0,%rsi
      0x48, 0x89, 0xe6,             	            // mov    %rsp,%rsi
      0x48, 0xc7, 0xc2, 0x2d, 0x00, 0x00, 0x00, 	// mov    $0xd,%rdx
      0x0f, 0x05                	                // syscall
  };
  memcpy(m, code, sizeof(code));
}

const size_t SIZE = 1024;
typedef long (*JittedFunc)(long);

// Allocates RWX memory directly.
void run_from_rwx() {
  void* m = alloc_executable_memory(SIZE);
  printf("%d\n", m);
  unsigned char* mem = (unsigned char*) m;
  emit_code_into_memory(mem);

  JittedFunc func = (JittedFunc) m;
  int result = func(0);
  printf("result = %d\n", result);
}

int main() {
    run_from_rwx();
}
