---
title: Reactor+ThreadPool
createTime: 2025/02/22 11:24:40
permalink: /article/h0v6tjey/
tags:
  - 未完待续
---

<a href="/Reactor+ThreadPool/Reactor+ThreadPool.pdf" target="_blank">跳转</a>

![](/Reactor+ThreadPool/EchoServer.jpg)

## 核心设计思路

线程分为==一个IO线程==和==多个业务线程==，IO线程主要负责epoll事件循环，业务线程主要负责处理具体的业务逻辑。

其本质就是生产者消费者模型：

全局维护一个任务队列TaskQueue，IO线程将任务放入队列，业务线程从队列中取出任务执行。所以在多线程环境下，任务队列尤其重要，他是连接IO线程和业务线程的桥梁。

此时，IO线程是生产者，业务线程是消费者。

这里涉及到多线程对同一个任务队列的并发访问，为了保证线程安全，需要使用互斥锁和条件变量。

只有IO线程具备接收和发送数据的能力，当业务线程执行完任务后，需要通知IO线程，发送数据。

所以为了只让IO线程执行IO操作，在EventLoop上设计了一个_pendings变量，用来存放业务线程包装好的数据和回调函数。

从这个角度而言，业务线程成为了生产者，IO线程成为了消费者，所以_penddings也是IO线程和业务线程的桥梁，它也需要上锁。

这里就涉及到两个问题：
1. 如果epoll_wait没有设置超时时间，那么IO线程会一直阻塞，_pendings中的数据，无法及时处理。
2. 即便epoll_wait设置了超时时间，每次循环都需要访问_pendings查看是否有数据，争取锁的过程严重影响效率。

所以，eventfd成为了解决问题的关键。

epoll可以监听eventfd，当业务线程向eventfd写入数据时，IO线程就可以被唤醒。并且跳入_pendings的处理逻辑。
