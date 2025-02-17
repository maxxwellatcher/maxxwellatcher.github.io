---
title: Socket编程：TCP通信
createTime: 2025/02/16 01:03:12
permalink: /article/xsh7egrf/
tags:
  - C
  - Linux
---


## 常用函数和结构体
::: code-tabs

@tab 套接字相关
```c
// 创建套接字，返回文件描述符。失败时返回-1
int socket(int domain, int type, int protocol);

// 绑定套接字到地址和端口，返回0。失败时返回-1
int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);

// 监听套接字，返回0。失败时返回-1
int listen(int sockfd, int backlog);

// 接受连接，返回新的套接字文件描述符。失败时返回-1
int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);

// 发起连接，返回0。失败时返回-1
int connect(int sockfd, const struct sockaddr *addr, socklen_t addrlen);

// 接收数据，返回实际读取的字节数。失败时返回-1
ssize_t recv(int sockfd, void* buf, size_t len, int flags);

// 发送数据，返回实际写入的字节数。失败时返回-1
ssize_t send(int sockfd, const void *buf, size_t len, int flags);

// 设置套接字选项，返回0。失败时返回-1
int setsockopt(int sockfd, int level, int optname, const void *optval, socklen_t optlen);

// 关闭套接字，返回0。失败时返回-1
int close(int sockfd);
```

@tab 地址
```c

// 其他API通常使用这个结构体，但是并不好用
struct sockaddr {
    sa_family_t     sa_family;      /* Address family */
    char            sa_data[];      /* Socket address */
};

// 通常使用这个结构体，然后在强制转换成sockaddr
struct sockaddr_in {
    sa_family_t    sin_family; /* address family: AF_INET */
    in_port_t     sin_port;   /* port in network byte order */
    struct in_addr sin_addr;   /* internet address */
};

// 网络地址结构体，用于存储IP地址
struct in_addr {
    in_addr_t s_addr;
};

// 将点分十进制转换为网络字节序的整型数，返回-1表示出错。
in_addr_t inet_addr(const char *cp);
```

@tab 大小端转换
```c
// h: host
// n: network
// l: long
// s: short
uint32_t htonl(uint32_t hostlong);
uint16_t htons(uint16_t hostshort);
uint32_t ntohl(uint32_t netlong);
uint16_t ntohs(uint16_t netshort);
```

:::

## TCP通信

![](/socket/TCP.png)


### socket

创建套接字。

arguments：
+ `domain`：[in]。指定协议族，通常是`AF_INET`，表示IPv4。
+ `type`：[in]。指定套接字类型，通常为两个选项：`SOCK_STREAM`，表示TCP流式套接字；`SOCK_DGRAM`，表示UDP数据报套接字。
+ `protocol`：[in]。指定协议，通常为0，表示自动选择。`IPPROTO_TCP`表示TCP协议，`IPPROTO_UDP`表示UDP协议。

return：
+ 成功：返回套接字文件描述符
+ 失败：返回-1，设置错误码

### bind

服务端需要使用bind函数将套接字与特定的IP地址和端口绑定，只有这样，流经该 IP 地址和端口的数据才能交给套接字处理。

arguments：
+ `sockfd`：[in]。套接字文件描述符。
+ `addr`：[in]。包含协议族，端口号，IP地址信息，结构体。
+ `addrlen`：[in]。结构体大小。

return：
+ 成功：返回0
+ 失败：返回-1，设置错误码

### listen

让套接字进入被动监听状态。所谓被动监听，是指当没有客户端请求时，套接字处于“睡眠”状态，只有当接收到客户端请求时，套接字才会被“唤醒”来响应请求。

一旦启动了监听，操作系统就知道这事服务端的套接字，操作系统内核就不再启动该套接字的发送和接受缓冲区，而是在内核中为该套接字维护两个队列：半连接队列和全连接队列。

==半连接队列：管理第一次握手成功的连接==

==全连接队列：管理完成三次握手成功的连接==

argumnents：
+ `sockfd`：[in]。一个被绑定(bind)但未被连接的套接字文件描述符。
+ `backlog`：[in]。半连接队列的长度。宏`SOMAXCONN`表示采用默认的长度。

return：
+ 成功：返回0
+ 失败：返回-1，设置错误码

### accept

从全连接队列中取出一个已经完成的TCP连接，如果全连接队列为空，则阻塞等待。

arguments：
+ `sockfd`：[in]。服务端的监听套接字文件描述符。
+ `addr`：[in&out]。回时保存了客户端的IP地址和端口号。如果不想要addr，参数addr可以是NULL，这种情况下addrlen也必须是NULL。
+ `addrlen`：addr的真实长度。

return：
+ 成功：返回一个新的套接字文件描述符，用于和客户端通信。
+ 失败：返回-1，设置错误码

### connect

客户端发起连接请求，connect返回时，说明完成了三次握手。

arguments：
+ `sockfd`：[in]。客户端的套接字文件描述符。
+ `addr`：[in]。服务端的IP地址和端口号。
+ `addrlen`：[in]。结构体大小。

return：
+ 成功：返回0
+ 失败：返回-1，设置错误码

### send

用于用户态缓冲区向内核态缓冲区进行传输数据，仅适用于TCP套接字。(实际上write的封装，但是封装了更多的细节处理)

arguments：
+ `sockfd`：套接字文件描述符。
+ `buf`：发送的数据。
+ `len`：buf的长度。
+ `flags`：指定调用方式。这里的参数可以参考recv函数的flags。通常设置为0，效果与write函数相同。

return：
+ 成功：返回发送的总字节数。
+ 失败：返回-1，设置错误码。

### recv

用于内核态缓冲区向用户态缓冲区进行传输数据，仅适用于TCP套接字。(实际上read的封装，但是封装了更多的细节处理)

arguments：
+ `sockfd`：套接字文件描述符。
+ `buf`：用于接收数据的用户层缓冲区。
+ `len`：缓冲区长度，即buf的长度。常用sizeof（buf）
+ `flags`：指定调用方式。

flag有以下几种常用参数宏：
+ 0。那么recv函数的效果类似于read函数。阻塞。
+ MSG_DONTWAIT。没有数据时立刻返回，并设置相应错误码。非阻塞。
+ MSG_WAITALL。一直等待，直到读取len长度的数据。阻塞。
+ MSG_PEEK。检查socket接收缓冲区是否有数据，并且缓冲区数据不会改变。非阻塞。

### setsockopt

设置套接字选项。

用来解决端口复用问题：如果是服务端主动调用 close 断开的连接，即服务端是四次挥手的主动关闭方，主动关闭方在最后会处于一个固定2MSL时长的TIME_WAIT等待时间。在此状态期间，如果尝试使用 bind 系统调用对重复的地址进行绑定操作，那么会报错。

arguments：
+ `sockfd`：[in]。套接字文件描述符。
+ `level`：[in]。协议级别，通常是SOL_SOCKET。
+ `optname`：[in]。选项名，通常是SO_REUSEADDR、SO_KEEPALIVE等。
+ `optval`：[in&out]。指向选项值的指针。设置为1表示允许套接字绑定到已被占用的地址和端口。
+ `optlen`：[in]。选项值的大小。

return：
+ 成功：返回0
+ 失败：返回-1，设置错误码

### close

关闭套接字。

arguments：
+ `sockfd`：[in]。套接字文件描述符。

return：
+ 成功：返回0
+ 失败：返回-1，设置错误码

## 注意事项

### 地址相关问题

通常服务器ip地址、端口号和客户端ip地址、端口号的<u>四元组合</u>确定一条连接。

传递给bind、connect和accept函数的地址参数通常是`sockaddr`结构体。对该结构体赋值比较麻烦，通常使用`sockaddr_in`结构体，然后强制转换。

地址传递给套接字相关的API时必须采用网络字节序，即大端字节序。

```c
// 常见的初始化方式

struct sockaddr_in server;
meset(&server, 0, sizeof(server)); // 清零，防止野指针问题

// 指定协议
server.sin_family = AF_INET;
// 指定端口号
server.sin_port = htons(8080); // htons将主机字节序转换为网络字节序
// 指定IP地址
server.sin_addr.s_addr = inet_addr("127.0.0.1"); // inet_addr返回网络字节序
// 还有常用的INADDR_ANY，表示本机IP地址
```

### 端口复用

```c
int reuse = 1;
setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse));

// 这样设置，即套接字绑定的端口可以复用，其中reuse必须为1。
```

## 简单示例
::: code-tabs

@tab TCP服务器
 ```c :collapsed-lines
#include <iostream>
#include <string>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <memory.h>
#define ERROR_CHECK(x, y) \
    do                    \
    {                     \
        if (x == -1)      \
            perror(y);    \
    } while (0)

#define IP "172.31.176.158"
#define PORT 7890

using std::cout;
using std::endl;
using std::string;

class Socket {
};

int main()
{
    auto serverfd = socket(AF_INET, SOCK_STREAM, 0);

    /**
     * API的返回结果，用于测试
     */
    int ret = 0;

    struct sockaddr_in serveraddr;
    memset(&serveraddr, 0, sizeof(serveraddr));

    serveraddr.sin_family = AF_INET;
    serveraddr.sin_port = htons(PORT);
    serveraddr.sin_addr.s_addr = inet_addr(IP);

    int reuse = 1;
    ret = setsockopt(serverfd, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse));
    ERROR_CHECK(ret, "setsockopt");

    int severfd = socket(AF_INET, SOCK_STREAM, 0);
    ERROR_CHECK(serverfd, "socket");

    ret = bind(serverfd, reinterpret_cast<struct sockaddr *>(&serveraddr), sizeof(serveraddr));
    ERROR_CHECK(ret, "bind");

    ret = listen(serverfd, SOMAXCONN);
    ERROR_CHECK(ret, "listen");

    int clientfd = accept(serverfd, nullptr, nullptr);
    char buf[1024];
    memset(buf, '\0', sizeof(buf));

    while (1)
    {
        int num = recv(clientfd, buf, 1024, 0);
        ERROR_CHECK(num, "recv");
        if (num == 0) {
            cout << "connection close" << endl;
            break;
        }
        cout << "buf: " << buf;
    }
    cout << "haha" << endl;

    return 0;
}
```
:::