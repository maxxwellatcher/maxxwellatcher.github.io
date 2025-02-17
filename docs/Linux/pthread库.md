---
title: 多线程编程：pthread库常用函数
createTime: 2025/02/12 18:27:11
permalink: /article/dpglr3em/
tags:
  - C
  - Linux
---

pthread库是事实上的Linux下多线程编程的标准接口，虽然C++标准库也提供了线程库支持，但是pthread库更为底层和强大。

pthread库的错误处理方式是直接返回错误码，而不是像C标准库或者系统调用那样设置errno。

## 线程

### 函数签名

```cpp
// 常见的线程操作函数
int pthread_create(pthread_t *restrict thread,
                     const pthread_attr_t *restrict attr,
                     void *(*start_routine)(void *),
                     void *restrict arg
                    );

int pthread_join(pthread_t thread, void** retval);

int pthread_detach(pthread_t tid);

int pthread_exit(void *retval);

int pthread_cancel(pthread_t tid);

void pthread_testcancel(void);

pthread_t pthread_self(void);
```

### pthread_create\()

创建一个线程，并执行start_routine函数。不发生阻塞。

argument：

+ `thread`：[in&out]。线程的pid，在pthread_create内部设置。
+ `attr`：[int&out]。设置线程的属性，一般设置为NULL。
+ `start_routine`：[in]。线程入口函数。
+ `arg`：[in]。线程入口函数的参数。

return：

* 成功：返回0
* 失败：返回错误码

有四种情况会导致子线程终止：
1. 子线程内部调用了pthread_exit()
2. 子线程设置了取消点，父线程调用了pthread_cancel()
3. start_routine函数返回
4. 任何一个线程调用了exit()

---

### pthread_join\()

等待线程结束，并回收资源。若等待的线程是分离态，则不会阻塞，并返回错误码。

argument：

+ `thread`：[in]。要等待的线程。
+ `retval`：[in&out]。子线程返回的值，注意不要返回局部变量，因为线程结束后，局部变量就会被销毁。

return：

* 成功：返回0
* 失败：返回错误码

pthread_join()会阻塞等待非分离态的子线程结束，并回收资源。

---

### pthread_detach\()

设置线程为分离态，即子线程结束后自动回收资源，父线程不需要调用pthread_join()。

argument：

+ `tid`：[in]。要分离的线程id。
+ `attr`：[int&out]。设置线程的属性，一般设置为NULL。

return：

* 成功：返回0
* 失败：返回错误码

---

### pthread_exit\()

在子线程中调用，表示当前子线程退出。

argument：
+ `retval`：[in]。子线程的返回值。

### pthread_cancel\()和pthread_testcancel\()

pthread_cancel()用于取消一个线程，pthread_testcancel()用于在子线程的代码中设置取消点。

当pthread_cancel()被调用时，相应的子线程会收到一个取消请求，但是并不会立即终止。子线程需要调用pthread_testcancel()来检查是否收到了取消请求，如果收到了，则会退出线程。

### pthread_self\()

获取当前线程的id。

### 示例代码

::: code-tabs

@tab 创建线程
```cpp
#include <pthread.h>
#include <stdio.h>
#include <unistd.h>
void *func(void *arg) {
    int* a = (int*)arg;
    while(a-->0) {
        sleep(1);
        printf("%d\n", a);
    }
    return NULL;
}
int main() {
    pthread_t tid;
    int a = 10;
    pthread_create(&tid, NULL, func, &a);
    pthread_join(tid, NULL); // 主线程发生阻塞，等待子线程结束。
    return 0;
}
```

@tab 分离线程
```cpp
#include <pthread.h>
#include <stdio.h>
void *func(void *arg) {
    int* a = (int*)arg;
    while(a-->0) {
        sleep(1);
        printf("%d\n", a);
        if(a == 3) pthread_exit(NULL); // 可以主动设置子线程退出。
    }
    return NULL;
}
int main() {
    pthread_t tid;
    int a = 10;
    pthread_create(&tid, NULL, func, &a);
    pthread_detach(tid); // 设置子线程为分离态，主线程不需要等待子线程结束。
    pthread_join(tid, NULL); // 不会阻塞，并且返回错误码。
    return 0;
}
```

@tab 取消线程
```cpp
#include <pthread.h>
void *func(void *arg) {
    int *a = (int*)arg;
    while(a-->0) {
        pthread_testcancel(); // 检查是否收到取消请求，收到则立马退出。
        sleep(1);
        printf("%d\n", a);
    }
    return NULL;
}
int main() {
    pthread_t tid;
    int a = 10;
    pthread_create(&tid, NULL, func, &a);
    sleep(2); // 主线程等待一段时间，然后取消子线程。
    pthread_cancel(tid); // 发出取消请求
    return 0;
}
```

:::

## 互斥锁

### 函数签名

```cpp
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

int pthread_mutex_init(pthread_mutex_t *restrict mutex,
                       const pthread_mutexattr_t *restrict attr
                      );

int pthread_mutex_destroy(pthread_mutex_t *mutex);

int pthread_mutex_lock(pthread_mutex_t *mutex);

int pthread_mutex_trylock(pthread_mutex_t *mutex);

int pthread_mutex_unlock(pthread_mutex_t *mutex);
```

### PTHREAD_MUTEX_INITIALIZER

静态初始化互斥锁。一般设置为全局变量，在编译期间完成初始化。

---

### pthread_mutex_init\()

动态初始化锁，在运行时完成初始化。优点是可以设置锁的属性。

argument：
+ `mutex`：[in&out]。传入互斥锁的地址。
+ `attr`：[in]。互斥锁的属性，一般设置为NULL。

---

### pthread_mutex_destroy\()

argument：
+ `mutex`：[in&out]。要销毁的互斥锁。

---

### pthread_mutex_lock\()

加锁，如果无法立即获得锁，则阻塞等待。

argument：
+ `mutex`：[in&out]。要加锁的互斥锁。

---

### pthread_mutex_trylock\()

尝试加锁，如果无法立即获得锁，则立即返回错误码。通常通过返回值来判断下一步的执行逻辑。可以实现非阻塞

argument：
+ `mutex`：[in&out]。要加锁的互斥锁。

---

### pthread_mutex_unlock\()

argument：
+ `mutex`：[in&out]。要解锁的互斥锁。

---

### 示例代码

```cpp{5-8}
#include <pthread.h>
void *func(void *in) {
    Arg *arg = (Arg*)in;
    // 加锁，原子化操作共享资源。
    pthread_mutex_lock(&arg->mutex);
    arg->val++;
    printf("val = %d\n", arg->val);
    pthread_mutex_unlock(&arg->mutex);
    return NULL;
}

typedef struct Arg {
    pthread_mutex_t mutex;
    int val;
};
int main() {
    Arg arg;
    arg.val = 0;
    pthread_mutex_init(&arg.mutex, NULL);
    for(int i = 0; i < 3; ++i) {
        pthread_create(&tid, NULL, func, &arg);
    }
    return 0;
}
```

## 条件变量

### 函数签名

```cpp
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;

int pthread_cond_init(pthread_cond_t *restrict cond, const pthread_condattr_t *restrict attr);

int pthread_cond_wait(pthread_cond_t *restrict cond, pthread_mutex_t *restrict mutex);

int pthread_cond_destroy(pthread_cond_t *cond);

int pthread_cond_signal(pthread_cond_t *cond);

int pthread_cond_broadcast(pthread_cond_t *cond);

int pthread_cond_timedwait(pthread_cond_t *restrict cond,
                           pthread_mutex_t *restrict mutex,
                           const struct timespec *restrict abstime
                          );
```

通常条件变量用于线程之间的同步，通常配合互斥锁使用。

通常来说条件变量能够解决线程的忙等待问题。

忙等待：在多线程访问同一个资源时，通常需要用到互斥锁对某些操作原子化，而没有拿到锁的线程需要不断地去尝试获取锁，造成CPU资源的浪费，这种现象称为忙等待。

条件变量的作用就是让这些忙等待的线程进入睡眠状态，知道条件变量满足条件时，再唤醒这些线程。（通常由获取到锁的线程，在释放锁时，主动改变条件变量来唤醒其他线程）

---

### PTHREAD_COND_INITIALIZER

---

### pthread_cond_init\()

---

### pthread_cond_wait\()


+ `cond`：[in&out]。条件变量
+ `mutex`：[in&out]。互斥锁

条件变量中最重要的一个函数，实际上该函数分为上半部和下半部：

1. 上半部：释放锁，当前进入睡眠状态
2. 下半部：被唤醒，获取锁

所以这个函数必须要在上锁之后使用。

---

### pthread_cond_destroy\()

---

### pthread_cond_signal\()

唤醒一个线程。通常由持有锁的线程调用，在释放锁之前改变条件变量状态，然后唤醒其他等待该条件的线程。

但是该函数很可能造成`虚假唤醒`，即唤醒的线程可能并不是等待该条件的线程，或者唤醒了不只有一个线程。

---

### pthread_cond_broadcast\()



---

### pthread_cond_timedwait\()

设置被唤醒的超时时间，需要注意的是，`abstime`是绝对时间。

+ `cond`：[in&out]。条件变量
+ `mutex`：[in&out]。互斥锁
+ `abstime`：[in]。绝对时间

`abstime`的类型为`struct timespec`，可以通过`clock_gettime()`获取当前时间。

```cpp
#include <time.h>
struct timespec tv;
clock_gettime(CLOCK_REALTIME, &tv);
tv.tv_sec += 1; // 当前时间+1秒

// struct timespec {
//     long tv_sec;        /* seconds */
//     long tv_nsec;       /* nanoseconds */
// }
```

### 示例代码

::: code-tabs

@tab 忙等待
```cpp :collapsed-lines 
#include <pthread.h>
#include <unistd.h>
#include <stdio.h>
typedef struct
{
    pthread_t tid[3];
    int val;
} Arg;

pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

// 对于共享资源的写操作，需要加锁
void show(int *num)
{
    pthread_mutex_lock(&mutex); // [!code warning]
    printf("val = %d\n", *num); // [!code warning]
    (*num)++; // [!code warning]
    pthread_mutex_unlock(&mutex); // [!code warning]
}

void *func0(void *in)
{
    Arg *arg = (Arg *)in;
    // 忙等待
    while (arg->val != 0); // [!code error]
    show(&arg->val);
    return NULL;
}
void *func1(void *in)
{
    Arg *arg = (Arg *)in;
    // 忙等待
    while (arg->val != 1); // [!code error]
    show(&arg->val);
    return NULL;
}
void *func2(void *in)
{
    Arg *arg = (Arg *)in;
    // 忙等待
    while (arg->val != 2); // [!code error]
    show(&arg->val);
    return NULL;
}
int main()
{
    Arg arg;
    arg.val = 0;

    void *(*func[])(void *) = {func0, func1, func2};

    for (int i = 0; i < 3; ++i)
    {
        pthread_create(&arg.tid[i], NULL, func[i], &arg);
    }

    for (int i = 0; i < 3; ++i)
    {
        pthread_join(arg.tid[i], NULL);
    }

    pthread_mutex_destroy(&mutex);
    pthread_cond_destroy(&cond);
    return 0;
}
```

@tab 使用条件变量
```cpp :collapsed-lines
#include <pthread.h>
#include <unistd.h>
#include <stdio.h>
typedef struct
{
    pthread_t tid[3];
    int val;
} Arg;

pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t cond = PTHREAD_COND_INITIALIZER;

void show(int *num, int i)
{
    pthread_mutex_lock(&mutex); // [!code warning]

    // 不符合条件的线程进入睡眠状态，直到条件满足时再唤醒
    // while的意义：被唤醒后需要检查是否满足条件，不满足则继续睡眠
    while(*num != i) pthread_cond_wait(&cond, &mutex); // [!code warning]

    printf("val = %d\n", *num);
    (*num)++;

    // 持有锁的情况下唤醒其他线程，避免发生唤醒丢失问题
    // 可能会造成性能下降，但是是可以接受的
    pthread_cond_signal(&cond); // [!code warning]
    pthread_mutex_unlock(&mutex);
}
void *func0(void *in)
{
    sleep(1);
    Arg *arg = (Arg *)in;
    show(&arg->val, 0);
    return NULL;
}
void *func1(void *in)
{
    Arg *arg = (Arg *)in;
    show(&arg->val, 1);
    return NULL;
}
void *func2(void *in)
{
    Arg *arg = (Arg *)in;
    show(&arg->val, 2);
    return NULL;
}

int main()
{
    Arg arg;
    arg.val = 0;

    void *(*func[])(void *) = {func0, func1, func2};

    for (int i = 0; i < 3; ++i)
    {
        pthread_create(&arg.tid[i], NULL, func[i], &arg);
    }

    for (int i = 0; i < 3; ++i)
    {
        pthread_join(arg.tid[i], NULL);
    }

    pthread_mutex_destroy(&mutex);
    pthread_cond_destroy(&cond);
    return 0;
}

```


:::