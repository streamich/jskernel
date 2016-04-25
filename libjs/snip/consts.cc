// g++ snip/consts.cc -o snip/consts && ./snip/consts
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


using namespace std;

int main() {

    std::cout << "SYS_read = " << SYS_read  << "," << endl;
    std::cout << "SYS_write = " << SYS_write  << "," << endl;
    std::cout << "SYS_open = " << SYS_open  << "," << endl;
    std::cout << "SYS_close = " << SYS_close  << "," << endl;
    std::cout << "SYS_stat = " << SYS_stat  << "," << endl;
    std::cout << "SYS_fstat = " << SYS_fstat  << "," << endl;
    std::cout << "SYS_lstat = " << SYS_lstat  << "," << endl;
    std::cout << "SYS_poll = " << SYS_poll  << "," << endl;
    std::cout << "SYS_lseek = " << SYS_lseek  << "," << endl;
    std::cout << "SYS_mmap = " << SYS_mmap  << "," << endl;
    std::cout << "SYS_mprotect = " << SYS_mprotect  << "," << endl;
    std::cout << "SYS_munmap = " << SYS_munmap  << "," << endl;


    std::cout << "SYS_fcntl = " << SYS_fcntl << "," << endl;
    std::cout << "SYS_epoll_create = " << SYS_epoll_create << "," << endl;
    std::cout << "SYS_epoll_wait = " << SYS_epoll_wait << "," << endl;
    std::cout << "SYS_epoll_ctl = " << SYS_epoll_ctl << "," << endl;
    std::cout << "SYS_epoll_create1 = " << SYS_epoll_create1 << "," << endl;


    // Errors
    std::cout << "EADDRINUSE = " << EADDRINUSE << "," << endl;
    std::cout << "EBADF = " << EBADF << "," << endl;
    std::cout << "ENOTSOCK = " << ENOTSOCK << "," << endl;
    std::cout << "EOPNOTSUPP = " << EOPNOTSUPP << "," << endl;
    std::cout << "E2BIG = " << E2BIG << "," << endl;
    std::cout << "EACCES = " << EACCES << "," << endl;
    std::cout << "EADDRINUSE = " << EADDRINUSE << "," << endl;
    std::cout << "EADDRNOTAVAIL = " << EADDRNOTAVAIL << "," << endl;
    std::cout << "EAFNOSUPPORT = " << EAFNOSUPPORT << "," << endl;
    std::cout << "EAGAIN = " << EAGAIN << "," << endl;
    std::cout << "EBADE = " << EBADE << "," << endl;
    std::cout << "EBADF = " << EBADF << "," << endl;
    std::cout << "EBADFD = " << EBADFD << "," << endl;
    std::cout << "EBADMSG = " << EBADMSG << "," << endl;
    std::cout << "EBADR = " << EBADR << "," << endl;
    std::cout << "EBADRQC = " << EBADRQC << "," << endl;
    std::cout << "EBADSLT = " << EBADSLT << "," << endl;
    std::cout << "EBUSY = " << EBUSY << "," << endl;
    std::cout << "ECANCELED = " << ECANCELED << "," << endl;
    std::cout << "ECHILD = " << ECHILD << "," << endl;
    std::cout << "ECHRNG = " << ECHRNG << "," << endl;
    std::cout << "ECOMM = " << ECOMM << "," << endl;
    std::cout << "ECONNABORTED = " << ECONNABORTED << "," << endl;
    std::cout << "ECONNREFUSED = " << ECONNREFUSED << "," << endl;
    std::cout << "ECONNRESET = " << ECONNRESET << "," << endl;
    std::cout << "EDEADLK = " << EDEADLK << "," << endl;
    std::cout << "EDEADLOCK = " << EDEADLOCK << "," << endl;
    std::cout << "EDESTADDRREQ = " << EDESTADDRREQ << "," << endl;
    std::cout << "EDOM = " << EDOM << "," << endl;
    std::cout << "EDQUOT = " << EDQUOT << "," << endl;
    std::cout << "EEXIST = " << EEXIST << "," << endl;
    std::cout << "EFAULT = " << EFAULT << "," << endl;
    std::cout << "EFBIG = " << EFBIG << "," << endl;
    std::cout << "EHOSTDOWN = " << EHOSTDOWN << "," << endl;
    std::cout << "EHOSTUNREACH = " << EHOSTUNREACH << "," << endl;
    std::cout << "EIDRM = " << EIDRM << "," << endl;
    std::cout << "EILSEQ = " << EILSEQ << "," << endl;
    std::cout << "EINPROGRESS = " << EINPROGRESS << "," << endl;
    std::cout << "EINTR = " << EINTR << "," << endl;
    std::cout << "EINVAL = " << EINVAL << "," << endl;
    std::cout << "EIO = " << EIO << "," << endl;
    std::cout << "EISCONN = " << EISCONN << "," << endl;
    std::cout << "EISDIR = " << EISDIR << "," << endl;
    std::cout << "EISNAM = " << EISNAM << "," << endl;
    std::cout << "EKEYEXPIRED = " << EKEYEXPIRED << "," << endl;
    std::cout << "EKEYREJECTED = " << EKEYREJECTED << "," << endl;
    std::cout << "EKEYREVOKED = " << EKEYREVOKED << "," << endl;
    std::cout << "EL2HLT = " << EL2HLT << "," << endl;
    std::cout << "EL2NSYNC = " << EL2NSYNC << "," << endl;
    std::cout << "EL3HLT = " << EL3HLT << "," << endl;
    std::cout << "EL3RST = " << EL3RST << "," << endl;
    std::cout << "ELIBACC = " << ELIBACC << "," << endl;
    std::cout << "ELIBBAD = " << ELIBBAD << "," << endl;
    std::cout << "ELIBMAX = " << ELIBMAX << "," << endl;
    std::cout << "ELIBSCN = " << ELIBSCN << "," << endl;
    std::cout << "ELIBEXEC = " << ELIBEXEC << "," << endl;
    std::cout << "ELOOP = " << ELOOP << "," << endl;
    std::cout << "EMEDIUMTYPE = " << EMEDIUMTYPE << "," << endl;
    std::cout << "EMFILE = " << EMFILE << "," << endl;
    std::cout << "EMLINK = " << EMLINK << "," << endl;
    std::cout << "EMSGSIZE = " << EMSGSIZE << "," << endl;
    std::cout << "EMULTIHOP = " << EMULTIHOP << "," << endl;
    std::cout << "ENAMETOOLONG = " << ENAMETOOLONG << "," << endl;
    std::cout << "ENETDOWN = " << ENETDOWN << "," << endl;
    std::cout << "ENETRESET = " << ENETRESET << "," << endl;
    std::cout << "ENETUNREACH = " << ENETUNREACH << "," << endl;
    std::cout << "ENFILE = " << ENFILE << "," << endl;
    std::cout << "ENOBUFS = " << ENOBUFS << "," << endl;
    std::cout << "ENODATA = " << ENODATA << "," << endl;
    std::cout << "ENODEV = " << ENODEV << "," << endl;
    std::cout << "ENOENT = " << ENOENT << "," << endl;
    std::cout << "ENOEXEC = " << ENOEXEC << "," << endl;
    std::cout << "ENOKEY = " << ENOKEY << "," << endl;
    std::cout << "ENOLCK = " << ENOLCK << "," << endl;
    std::cout << "ENOLINK = " << ENOLINK << "," << endl;
    std::cout << "ENOMEDIUM = " << ENOMEDIUM << "," << endl;
    std::cout << "ENOMEM = " << ENOMEM << "," << endl;
    std::cout << "ENOMSG = " << ENOMSG << "," << endl;
    std::cout << "ENONET = " << ENONET << "," << endl;
    std::cout << "ENOPKG = " << ENOPKG << "," << endl;
    std::cout << "ENOPROTOOPT = " << ENOPROTOOPT << "," << endl;
    std::cout << "ENOSPC = " << ENOSPC << "," << endl;
    std::cout << "ENOSR = " << ENOSR << "," << endl;
    std::cout << "ENOSTR = " << ENOSTR << "," << endl;
    std::cout << "ENOSYS = " << ENOSYS << "," << endl;
    std::cout << "ENOTBLK = " << ENOTBLK << "," << endl;
    std::cout << "ENOTCONN = " << ENOTCONN << "," << endl;
    std::cout << "ENOTDIR = " << ENOTDIR << "," << endl;
    std::cout << "ENOTEMPTY = " << ENOTEMPTY << "," << endl;
    std::cout << "ENOTSOCK = " << ENOTSOCK << "," << endl;
    std::cout << "ENOTSUP = " << ENOTSUP << "," << endl;
    std::cout << "ENOTTY = " << ENOTTY << "," << endl;
    std::cout << "ENOTUNIQ = " << ENOTUNIQ << "," << endl;
    std::cout << "ENXIO = " << ENXIO << "," << endl;
    std::cout << "EOPNOTSUPP = " << EOPNOTSUPP << "," << endl;
    std::cout << "EOVERFLOW = " << EOVERFLOW << "," << endl;
    std::cout << "EPERM = " << EPERM << "," << endl;
    std::cout << "EPFNOSUPPORT = " << EPFNOSUPPORT << "," << endl;
    std::cout << "EPIPE = " << EPIPE << "," << endl;
    std::cout << "EPROTO = " << EPROTO << "," << endl;
    std::cout << "EPROTONOSUPPORT = " << EPROTONOSUPPORT << "," << endl;
    std::cout << "EPROTOTYPE = " << EPROTOTYPE << "," << endl;
    std::cout << "ERANGE = " << ERANGE << "," << endl;
    std::cout << "EREMCHG = " << EREMCHG << "," << endl;
    std::cout << "EREMOTE = " << EREMOTE << "," << endl;
    std::cout << "EREMOTEIO = " << EREMOTEIO << "," << endl;
    std::cout << "ERESTART = " << ERESTART << "," << endl;
    std::cout << "EROFS = " << EROFS << "," << endl;
    std::cout << "ESHUTDOWN = " << ESHUTDOWN << "," << endl;
    std::cout << "ESPIPE = " << ESPIPE << "," << endl;
    std::cout << "ESOCKTNOSUPPORT = " << ESOCKTNOSUPPORT << "," << endl;
    std::cout << "ESRCH = " << ESRCH << "," << endl;
    std::cout << "ESTALE = " << ESTALE << "," << endl;
    std::cout << "ESTRPIPE = " << ESTRPIPE << "," << endl;
    std::cout << "ETIME = " << ETIME << "," << endl;
    std::cout << "ETIMEDOUT = " << ETIMEDOUT << "," << endl;
    std::cout << "ETXTBSY = " << ETXTBSY << "," << endl;
    std::cout << "EUCLEAN = " << EUCLEAN << "," << endl;
    std::cout << "EUNATCH = " << EUNATCH << "," << endl;
    std::cout << "EUSERS = " << EUSERS << "," << endl;
    std::cout << "EWOULDBLOCK = " << EWOULDBLOCK << "," << endl;
    std::cout << "EXDEV = " << EXDEV << "," << endl;
    std::cout << "EXFULL = " << EXFULL << "," << endl;

    std::cout << "EPOLL_CTL_ADD = " << EPOLL_CTL_ADD << "," << endl;
    std::cout << "EPOLL_CTL_MOD = " << EPOLL_CTL_MOD << "," << endl;
    std::cout << "EPOLL_CTL_DEL = " << EPOLL_CTL_DEL << "," << endl;


//    std::cout << "AF_LOCAL = " << AF_LOCAL  << "," << endl;
//    std::cout << "AF_INET = " << AF_INET  << "," << endl;
//    std::cout << "AF_INET6 = " << AF_INET6  << "," << endl;
//    std::cout << "AF_IPX = " << AF_IPX  << "," << endl;
//    std::cout << "AF_NETLINK = " << AF_NETLINK  << "," << endl;
//    std::cout << "AF_X25 = " << AF_X25  << "," << endl;
//    std::cout << "AF_AX25 = " << AF_AX25  << "," << endl;
//    std::cout << "AF_ATMPVC = " << AF_ATMPVC  << "," << endl;
//    std::cout << "AF_APPLETALK = " << AF_APPLETALK  << "," << endl;
//    std::cout << "AF_PACKET = " << AF_PACKET  << "," << endl;
//    std::cout << "AF_ALG = " << AF_ALG  << "," << endl;
//
//    std::cout << "SOCK_STREAM = " << SOCK_STREAM  << "," << endl;
//    std::cout << "SOCK_DGRAM = " << SOCK_DGRAM  << "," << endl;
//    std::cout << "SOCK_SEQPACKET = " << SOCK_SEQPACKET  << "," << endl;
//    std::cout << "SOCK_RAW = " << SOCK_RAW  << "," << endl;
//    std::cout << "SOCK_RDM = " << SOCK_RDM  << "," << endl;
//    std::cout << "SOCK_PACKET = " << SOCK_PACKET  << "," << endl;
//    std::cout << "SOCK_NONBLOCK = " << SOCK_NONBLOCK  << "," << endl;
//    std::cout << "SOCK_CLOEXEC = " << SOCK_CLOEXEC  << "," << endl;

//    std::cout << "PROT_READ: " << PROT_READ  << "," << endl;
//    std::cout << "PROT_WRITE: " << PROT_WRITE  << "," << endl;
//    std::cout << "PROT_NONE: " << PROT_NONE  << "," << endl;
//    std::cout << "MAP_SHARED: " << PROT_NONE  << "," << endl;
//    std::cout << "MAP_PRIVATE: " << PROT_NONE  << "," << endl;
//    std::cout << "MAP_32BIT: " << MAP_32BIT  << "," << endl;
//    std::cout << "MAP_ANON: " << MAP_ANON  << "," << endl;
//    std::cout << "MAP_ANONYMOUS: " << MAP_ANONYMOUS  << "," << endl;
//    std::cout << "MAP_DENYWRITE: " << MAP_DENYWRITE  << "," << endl;
//    std::cout << "MAP_EXECUTABLE: " << MAP_EXECUTABLE  << "," << endl;
//    std::cout << "MAP_FILE: " << MAP_FILE  << "," << endl;
//    std::cout << "MAP_FIXED: " << MAP_FIXED  << "," << endl;
//    std::cout << "MAP_GROWSDOWN: " << MAP_GROWSDOWN  << "," << endl;
//    std::cout << "MAP_HUGETLB: " << MAP_HUGETLB  << "," << endl;
//    std::cout << "MAP_HUGE_SHIFT: " << MAP_HUGE_SHIFT  << "," << endl;
//    std::cout << "MAP_LOCKED: " << MAP_LOCKED  << "," << endl;
//    std::cout << "MAP_NONBLOCK: " << MAP_NONBLOCK  << "," << endl;
//    std::cout << "MAP_NORESERVE: " << MAP_NORESERVE  << "," << endl;
//    std::cout << "MAP_POPULATE: " << MAP_POPULATE  << "," << endl;
//    std::cout << "MAP_STACK: " << MAP_STACK  << "," << endl;

    return 0;
}

