#include <iostream>
#include <stdint.h>
#include <string.h>
#include <syscall.h>
#include <unistd.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/mman.h>

#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>

#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <sys/types.h>
#include <time.h>

#include <sys/socket.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <netdb.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <arpa/inet.h>
#include <sys/epoll.h>


using namespace std;

int main() {

//    int listenfd = 0, connfd = 0;
//    struct sockaddr_in serv_addr;
//
//    char sendBuff[1025];
//    time_t ticks;
//
//    listenfd = socket(AF_INET, SOCK_STREAM, 0);
//    std::cout << listenfd << endl;
//
    std::cout << "EPOLLIN = " << EPOLLIN  << endl;
    std::cout << "EPOLLOUT = " << EPOLLOUT  << endl;
    std::cout << "EPOLLRDHUP = " << EPOLLRDHUP  << endl;
    std::cout << "EPOLLPRI = " << EPOLLPRI  << endl;
    std::cout << "EPOLLERR = " << EPOLLERR  << endl;
    std::cout << "EPOLLHUP = " << EPOLLHUP  << endl;
    std::cout << "EPOLLET = " << EPOLLET  << endl;
    std::cout << "EPOLLONESHOT = " << EPOLLONESHOT  << endl;
    std::cout << "EPOLLWAKEUP = " << EPOLLWAKEUP  << endl;

//    std::cout << "EWOULDBLOCK = " << EWOULDBLOCK  << endl;
//    std::cout << "EBADF = " << EBADF  << endl;
//    std::cout << "ECONNREFUSED = " << ECONNREFUSED  << endl;
//    std::cout << "EFAULT = " << EFAULT  << endl;
//    std::cout << "EINTR = " << EINTR  << endl;
//    std::cout << "EINVAL = " << EINVAL  << endl;
//    std::cout << "ENOMEM = " << ENOMEM  << endl;
//    std::cout << "ENOTCONN = " << ENOTCONN  << endl;
//    std::cout << "ENOTSOCK = " << ENOTSOCK  << endl;

//    std::cout << "EADDRINUSE = " << EADDRINUSE  << endl;
//    std::cout << "EBADF = " << EBADF  << endl;
//    std::cout << "EINVAL = " << EINVAL  << endl;
//    std::cout << "ENOTSOCK = " << ENOTSOCK  << endl;
//    std::cout << "EADDRNOTAVAIL = " << EADDRNOTAVAIL  << endl;
//    std::cout << "EFAULT = " << EFAULT  << endl;
//    std::cout << "ELOOP = " << ELOOP  << endl;
//    std::cout << "ENAMETOOLONG = " << ENAMETOOLONG  << endl;
//    std::cout << "ENOENT = " << ENOENT  << endl;
//    std::cout << "ENOMEM = " << ENOMEM  << endl;
//    std::cout << "ENOTDIR = " << ENOTDIR  << endl;
//    std::cout << "EROFS = " << EROFS  << endl;
//
//    std::cout << "SOCK_STREAM = " << SOCK_STREAM  << endl;
//    std::cout << "SOCK_DGRAM = " << SOCK_DGRAM  << endl;
//    std::cout << "SOCK_SEQPACKET = " << SOCK_SEQPACKET  << endl;
//    std::cout << "SOCK_RAW = " << SOCK_RAW  << endl;
//    std::cout << "SOCK_RDM = " << SOCK_RDM  << endl;
//    std::cout << "SOCK_PACKET = " << SOCK_PACKET  << endl;
//    std::cout << "SOCK_NONBLOCK = " << SOCK_NONBLOCK  << endl;
//    std::cout << "SOCK_CLOEXEC = " << SOCK_CLOEXEC  << endl;

//    std::cout << "PROT_READ: " << PROT_READ  << endl;
//    std::cout << "PROT_WRITE: " << PROT_WRITE  << endl;
//    std::cout << "PROT_NONE: " << PROT_NONE  << endl;
//    std::cout << "MAP_SHARED: " << PROT_NONE  << endl;
//    std::cout << "MAP_PRIVATE: " << PROT_NONE  << endl;
//    std::cout << "MAP_32BIT: " << MAP_32BIT  << endl;
//    std::cout << "MAP_ANON: " << MAP_ANON  << endl;
//    std::cout << "MAP_ANONYMOUS: " << MAP_ANONYMOUS  << endl;
//    std::cout << "MAP_DENYWRITE: " << MAP_DENYWRITE  << endl;
//    std::cout << "MAP_EXECUTABLE: " << MAP_EXECUTABLE  << endl;
//    std::cout << "MAP_FILE: " << MAP_FILE  << endl;
//    std::cout << "MAP_FIXED: " << MAP_FIXED  << endl;
//    std::cout << "MAP_GROWSDOWN: " << MAP_GROWSDOWN  << endl;
//    std::cout << "MAP_HUGETLB: " << MAP_HUGETLB  << endl;
//    std::cout << "MAP_HUGE_SHIFT: " << MAP_HUGE_SHIFT  << endl;
//    std::cout << "MAP_LOCKED: " << MAP_LOCKED  << endl;
//    std::cout << "MAP_NONBLOCK: " << MAP_NONBLOCK  << endl;
//    std::cout << "MAP_NORESERVE: " << MAP_NORESERVE  << endl;
//    std::cout << "MAP_POPULATE: " << MAP_POPULATE  << endl;
//    std::cout << "MAP_STACK: " << MAP_STACK  << endl;

    return 0;
}

