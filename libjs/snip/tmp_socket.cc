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


    int sockfd = 0, n = 0;
    char recvBuff[1024];
    struct sockaddr_in serv_addr;


    char addr[] = "192.168.1.150";

    memset(recvBuff, '0',sizeof(recvBuff));
    if((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    {
        printf("\n Error : Could not create socket \n");
        return 1;
    }

    memset(&serv_addr, '0', sizeof(serv_addr));

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(80);

    std::cout << AF_INET << endl;
    std::cout << htons(80) << endl;

    if(inet_pton(AF_INET, addr, &serv_addr.sin_addr)<=0)
    {
        printf("\n inet_pton error occured\n");
        return 1;
    }

    std::cout << inet_addr(addr) << endl;

    int res = connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr));

    std::cout << "Connect: " << res << endl;

    if( res < 0)
    {
       printf("\n Error : Connect Failed \n");
       return 1;
    }

    char get_msg[] = "GET /\n\n";
    write(sockfd, get_msg, strlen(get_msg));

    while ( (n = read(sockfd, recvBuff, sizeof(recvBuff)-1)) > 0)
    {
        recvBuff[n] = 0;
        if(fputs(recvBuff, stdout) == EOF)
        {
            printf("\n Error : Fputs error\n");
        }
    }

    if(n < 0)
    {
        printf("\n Read error \n");
    }

    return 0;



//    int listenfd = 0, connfd = 0;
//    struct sockaddr_in serv_addr;
//
//    char sendBuff[1025];
//    time_t ticks;
//
//    listenfd = socket(AF_INET, SOCK_STREAM, 0);
//    std::cout << listenfd << endl;
//
//    std::cout << "AF_UNIX = " << AF_UNIX  << endl;
//    std::cout << "AF_LOCAL = " << AF_LOCAL  << endl;
//    std::cout << "AF_INET = " << AF_INET  << endl;
//    std::cout << "AF_INET6 = " << AF_INET6  << endl;
//    std::cout << "AF_IPX = " << AF_IPX  << endl;
//    std::cout << "AF_NETLINK = " << AF_NETLINK  << endl;
//    std::cout << "AF_X25 = " << AF_X25  << endl;
//    std::cout << "AF_AX25 = " << AF_AX25  << endl;
//    std::cout << "AF_ATMPVC = " << AF_ATMPVC  << endl;
//    std::cout << "AF_APPLETALK = " << AF_APPLETALK  << endl;
//    std::cout << "AF_PACKET = " << AF_PACKET  << endl;
//    std::cout << "AF_ALG = " << AF_ALG  << endl;
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

