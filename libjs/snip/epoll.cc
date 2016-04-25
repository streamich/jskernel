#include <iostream>
#include <fcntl.h>
#include <sys/socket.h>


using namespace std;

int main() {
    int sockfd = socket(PF_INET, SOCK_STREAM, 0);
    std::cout << PF_INET << "\n";
    std::cout << SOCK_STREAM << "\n";
    std::cout << sockfd << "\n";
    int res = fcntl(sockfd, F_SETFL, O_NONBLOCK);
    std::cout << F_SETFL << endl;
    std::cout << O_NONBLOCK << endl;
    std::cout << res << endl;
}