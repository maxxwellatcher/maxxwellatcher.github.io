---
title: I/O多路复用：epoll
createTime: 2025/02/15 00:21:20
permalink: /article/isb6nouc/
tags:
  - C
  - Linux
---

## 原理
epoll 是 Linux 下多路复用 IO 接口 select/poll 的增强版本，它能显著提高程序在大量并发连接中只有少量活跃的情况下的系统 CPU 使用率。

epoll在内核区维护两个数据结构：红黑树，用来监听文件描述符的读写或异常事件。线性表，用来存储就绪的文件描述符事件。

epoll的优势：

1. 支持水平触发和边缘触发模式
2. 最大支持FD的数量可以达到100万
3. 监听事件常驻内核态，调用epoll_wait()函数不会修改监听性质，不需要每次讲集合从用户态拷贝到内核态。
4. 监听事件和就绪事件分开存储，用户可以直接遍历就绪队列，无需遍历整个监听集合。

## 常用函数和结构体

```c
int epoll_create(int size);

int epoll_create1(int flags);

int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);

int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);

struct epoll_event {
    uint32_t events;  /* Epoll events */
    epoll_data_t data; /* User data variable */
};

// epoll_event结构体中的events字段可以包含以下事件类型：
// EPOLLIN ：表示对应的文件描述符可以读（包括对端SOCKET正常关闭）
// EPOLLOUT：表示对应的文件描述符可以写
// EPOLLET：将epoll设为边缘触发模式，默认为水平触发模式
// ... 更多事件类型，参见epoll.h头文件。

typedef union epoll_data {
    void *ptr;
    int fd;
    uint32_t u32;
    uint64_t u64;
} epoll_data_t;
```

### epoll_create

arguments:
+ `size`：这个参数从Linux2.6.8后就被忽略了，但是要保证传入的size大于0。

return：
+ 成功：返回一个epoll实例对应的文件描述符
+ 失败：返回-1，并设置errno

### epoll_create1

创建一个epoll实例。在Linux2.6.8之后，推荐使用这个函数代替老版本的`epoll_create()`。

arguments:
+ `flags`：[in]。创建一个epoll实例。当flags为0时，效果与epoll_create函数完全相同。

return：
+ 成功：返回一个epoll实例对应的文件描述符
+ 失败：返回-1，并设置errno

### epoll_ctl

指定一个epoll实例，并对它进行操作。

arguments:
+ `epfd`：epoll实例的文件描述符
+ `op`：操作类型，可以是以下几种之一：
  + EPOLL_CTL_ADD：向epoll实例中添加一个新的文件描述符
  + EPOLL_CTL_MOD：修改已经注册的文件描述符的事件
  + EPOLL_CTL_DEL：从epoll实例中删除一个文件描述符
+ `fd`：[in]。要操作的socket文件描述符
+ `event`：[in&out]。指向epoll_event结构体的指针，用于指定事件和用户数据

return：
+ 成功：返回0
+ 失败：返回-1，并设置errno

### epoll_wait

arguments:
+ `epfd`：[in]。epoll实例的文件描述符
+ `events`：[in&out]。指向epoll_event数组的指针，用于获得事件的返回信息。数组的长度由maxevents指定。
+ `maxevents`：[in]。指定最多接收的事件数，可用`MAXCONN`宏定义
+ `timeout`：[in]。阻塞时间，单位为毫秒，0表示非阻塞

这里数组传参的时候退化成了指针，所以maxevent是该数组的长度信息，wait会根据这个长度信息对数组event进行遍历。


## 示例代码

```cpp
#include <iostream>
#include <algorithm>
#include <fstream>
#include <sstream>
#include <unistd.h>
#include <string>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <memory.h>
#include <sys/epoll.h>
#include <stdio.h>
#include <filesystem>
#include <list>
#define ERROR_CHECK(x, y) \
    do                    \
    {                     \
        if (x == -1)      \
            perror(y);    \
    } while (0)

#define IP "127.0.0.1"
#define PORT 7890

namespace fs = std::filesystem;
using std::cout;
using std::endl;
using std::string;

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

    int epollfd = epoll_create1(0);

    struct epoll_event event;

    event.events = EPOLLIN;
    event.data.fd = serverfd;
    // 添加监听套接字到epoll事件表中，当有新连接时，会触发EPOLLIN事件
    ret = epoll_ctl(epollfd, EPOLL_CTL_ADD, serverfd, &event); // [!code warning]
    ERROR_CHECK(ret, "epoll_ctl add");

    struct epoll_event evs[10];
    std::list<std::pair<sockaddr, int>> clientaddrs;

    while (1)
    {
        cout << "epoll waiting ..." << endl;
        int ret = epoll_wait(epollfd, evs, 10, -1);

        string string_buf(1024, '\0');
        for (int i = 0; i < ret; ++i)
        {
            int fd = evs[i].data.fd;
            // 处理新连接
            if (fd == serverfd)
            {
                sockaddr caddr;
                unsigned int len = sizeof(caddr);
                int clientfd = accept(serverfd, &caddr, &len);
                clientaddrs.push_back(std::make_pair(caddr, clientfd));

                event.events = EPOLLIN;
                event.data.fd = clientfd;
                ret = epoll_ctl(epollfd, EPOLL_CTL_ADD, clientfd, &event);
                ERROR_CHECK(ret, "epoll_ctl add");

                cout << "new connection" << endl;
            }
            // 处理客户端数据
            else
            {
                for (auto &[addr, cfd] : clientaddrs)
                {
                    if (cfd == fd)
                    {
                        int n = recv(fd, string_buf.data(), 1024, 0);
                        if (n == 0)
                        {
                            cout << "n = 0: " << n << " | " << string_buf;
                            cout << "connection close" << endl;
                            ret = epoll_ctl(epollfd, EPOLL_CTL_DEL, fd, nullptr);
                            ERROR_CHECK(ret, "epoll_ctl del");

                            auto it = std::find_if(clientaddrs.begin(), clientaddrs.end(), [&fd](auto& it) -> bool {
                                return fd == it.second;
                            });
                            clientaddrs.erase(it);
                            break;
                        }
                        else if (n < 0)
                        {
                            // TODO: 错误处理
                            // 例如客户端主动断开连接，也会触发recv返回值小于零的情况
                            perror("recv");
                            ret = epoll_ctl(epollfd, EPOLL_CTL_DEL, fd, nullptr);
                            ERROR_CHECK(ret, "epoll_ctl del");
                        }
                        else
                        {
                            cout << "n = 0: " << n << " | " << string_buf << endl;
                        }
                    }
                }
            }
        }
    }

    cout << "bye" << endl;

    return 0;
}

```

## eventfd

eventfd 是一个 Linux 内核提供的文件描述符，用于高效地通知事件的发生。它通常与 epoll 或其他 I/O 多路复用机制一起使用，以实现进程或者线程之间的通信。

其内部实现了计数器，当计数器为0时，使用`read()`读取该文件描述符则发生阻塞；若计数器不为0，则计数减1。也可以使用`write()`，增加当前计数。

```c
// 原型
int eventfd(unsigned int initval, int flags);
```

argument：
+ `initval`：[in]。初始时计数器的值。
+ `flags`：[in]。标志位，`Linux 2.6.26`之前，这个标志位没有用途，只能填入`0`。之后版本增加了几个标志位，其中`EFD_NONBLOCK`最常用，表示使用`read()`不会阻塞。

returns：
+ 成功：返回eventfd文件描述符
+ 失败：返回-1，并设置`errno`

::: code-tabs

@tab Linux标准示例
```c
#include <err.h>
#include <inttypes.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/eventfd.h>
#include <unistd.h>

int
main(int argc, char *argv[])
{
    int       efd;
    uint64_t  u;
    ssize_t   s;

    if (argc < 2) {
        fprintf(stderr, "Usage: %s <num>...\n", argv[0]);
        exit(EXIT_FAILURE);
    }

    efd = eventfd(0, 0);
    if (efd == -1)
        err(EXIT_FAILURE, "eventfd");

    switch (fork()) {
    case 0:
        for (size_t j = 1; j < argc; j++) {
            printf("Child writing %s to efd\n", argv[j]);
            u = strtoull(argv[j], NULL, 0);
                    /* strtoull() allows various bases */
            s = write(efd, &u, sizeof(uint64_t));
            if (s != sizeof(uint64_t))
                err(EXIT_FAILURE, "write");
        }
        printf("Child completed write loop\n");

        exit(EXIT_SUCCESS);

    default:
        sleep(2);

        printf("Parent about to read\n");
        s = read(efd, &u, sizeof(uint64_t));
        if (s != sizeof(uint64_t))
            err(EXIT_FAILURE, "read");
        printf("Parent read %"PRIu64" (%#"PRIx64") from efd\n", u, u);
        exit(EXIT_SUCCESS);

    case -1:
        err(EXIT_FAILURE, "fork");
    }
}
```

:::

因为`evfd`文件描述符总是可以写入，所以epoll监听它的可写事件没有意义。通常来说，使用epoll监听它的可读事件。

一个线程写，触发epoll所在线程可读事件，从而实现线程之间的通信，这是最常见的用法。

非标准的扩展glibc特性的封装函数，简化对`evfd`的读写操作：

```c
int eventfd_read(int fd, eventfd_t *value);
int eventfd_write(int fd, eventfd_t value);
```