---
title: Socket编程：UDP通信
createTime: 2025/02/17 23:53:02
permalink: /article/roaxfebg/
tags:
  - C
  - Linux
---

![](/socket/UDP.png)

UDP是无连接的，即发送数据之前不需要建立连接。所以相对TCP，UDP的开销较小，速度快。

## 常用函数

```c

ssize_t sendto(int sockfd,
               const void *buf,
               size_t len,
               int flags,
               const struct sockaddr *dest_addr,
               socklen_t addrlen);

ssize_t recvfrom(int sockfd,
                 void *buf,
                 size_t len,
                 int flags,
                 struct sockaddr *src_addr,
                 socklen_t *addrlen);

```

### sendto

arguments：
+ sockfd：[in]。套接字文件描述符
+ buf：[in]。指向要发送数据的缓冲区
+ len：[in]。要发送数据的长度
+ flags：[in]。标志位，一般为0
+ dest_addr：[in]。指向目的地址的指针
+ addrlen：[in]。目的地址的长度

### recvfrom

arguments：
+ sockfd：[in]。套接字文件描述符
+ buf：[in&out]。指向接收数据的缓冲区
+ len：[in]。缓冲区长度  
+ flags：[in]。标志位，一般为0
+ src_addr：[in&out]。指向源地址的指针，可以设置为NULL
+ addrlen：[in]。源地址的长度


## 示例代码

::: code-tabs
@tab UDP服务器
```c
//server.c
int main(int argc,char* argv[]){

    int sfd = socket(AF_INET,SOCK_DGRAM,0);
    struct sockaddr_in serAddr;
    memset(&serAddr, 0, sizeof(serAddr));
    serAddr.sin_family = AF_INET;
    serAddr.sin_addr.s_addr = inet_addr(argv[1]);
    serAddr.sin_port = htons(atoi(argv[2]));

    int ret = bind(sfd,(struct sockaddr*)&serAddr, sizeof(serAddr));

    char buf[4]={0};
    struct sockaddr_in cliAddr;
    memset(&cliAddr,0,sizeof(cliAddr));

    socklen_t len = sizeof(cliAddr);
    recvfrom(sfd,buf,sizeof(buf),0,(struct sockaddr*)&cliAddr,&len);
    printf("buf=%s\n",buf);

    recvfrom(sfd,buf,sizeof(buf),0,(struct sockaddr*)&cliAddr,&len);
    printf("buf=%s\n",buf);

    sendto(sfd,"hello client",12,0,(struct sockaddr*)&cliAddr,len);
    close(sfd);
    return 0;
}
```

@tab UDP客户端
```c
//client.c
int main(int argc,char* argv[]){
    
    int sfd = socket(AF_INET,SOCK_DGRAM,0);
    struct sockaddr_in serAddr;
    memset(&serAddr,0,sizeof(serAddr));
    serAddr.sin_family = AF_INET;
    serAddr.sin_addr.s_addr = inet_addr(argv[1]);
    serAddr.sin_port = htons(atoi(argv[2]));

    char buf[64]={0};
    socklen_t len = sizeof(serAddr);

    sendto(sfd,"hello udp",9,0,(struct sockaddr*)&serAddr,len);

    sendto(sfd,"hello server",12,0,(struct sockaddr*)&serAddr,len);

    recvfrom(sfd,buf,sizeof(buf),0,(struct sockaddr*)&serAddr,&len);
    printf("buf=%s\n",buf);

    close(sfd);
    return 0;
}
```
:::