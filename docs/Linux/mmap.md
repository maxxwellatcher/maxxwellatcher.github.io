---
title: mmap零拷贝技术
createTime: 2025/02/23 21:54:31
permalink: /article/ltu3zeor/
---

文件IO中，数据首先拷贝到内核缓冲区，然后再拷贝到用户空间。

如果将一份磁盘上的文件通过套接字发送出去，这个过程则实际上发生了四次拷贝。对于大文件而言，这是非常消耗时间的。

mmap（内存映射）技术实际上就是将文件加载到内核缓冲区，然后映射（不是拷贝）到用户空间，这样就不需要从内核拷贝到用户空间的过程了。

## 常用函数
```c
void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
int munmap(void addr, size_t length);
```

### mmap

从用户层开发者的视角而言，mmap可以当作是一种`read()`操作，通常使用`mmap() + write()`代替`read() + write()`，实现优化大文件传输。

arguments：
+ `addr`：建议内存的起始地址。如果设置为NULL，那么内核会自动创建映射区。
+ `length`：映射区的长度。
+ `prot`：(protection)访问权限。prot有以下几个宏。
    1. PROT_EXEC //页内容可以被执行
    2. PROT_READ //页内容可以被读取
    3. PROT_WRITE //页可以被写入
    4. PROT_NONE //页不可访问
+ `flag`：映射区是否可以被其他进程可见。flag必选选择以下两个其中之一的宏：
    1. MAP_SHARED//其他进程可以共享映射区
    2. MAP_PRIVATE//该映射区是进程私有的，采用copy-on-write写时复制技术，当其他进程写入映射区时在创建一个新的映射区。
+ `fd`：被映射对象的文件操作符
+ `offset`：相对于被映射对象内容的偏移量

MAP_PRIVATE和MAP_SHARED的区别：
MAP_SHARED映射区与文件共享更新，也就是说，如果用PROT_WRITE打开了映射区，那么对它的修改会反映到文件中。而MAP_PRIVATE映射区是私有拷贝，对它的修改不会反映到文件中。

所以通常进行文件传输时，使用MAP_PRIVATE，然后调用write()将映射区的内容写入到socket中。

returns：
+ 成功：返回映射区的起始地址
- 失败：返回(void *)(-1)，设置errno

### munmap

关闭映射区，释放内存。

```c
#include <iostream>
#include <string>
#include <unistd.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>

using std::endl;
using std::cout;
using std::string;

int main() {
    // 获取系统页大小
    int pagesize = sysconf(_SC_PAGESIZE);

    auto fd = open("test.txt", O_RDONLY);
    struct stat st;
    fstat(fd, &st);

    // 向上取整到页大小的整数倍
    // 这里使用向上取整的原因是，mmap要求映射区的大小必须是系统页大小的整数倍
    int size = (st.st_size + pagesize - 1) / pagesize * pagesize;

    char* p = static_cast<char*>(mmap(nullptr, st.st_size, PROT_WRITE, MAP_PRIVATE, fd, 0));

    // 将映射区的内容转换为string，这样就可以直接使用C++的字符串操作了。
    // 意义不大，只是为了演示可以把mmap返回的指针当作buffer使用。
    string s(p);
    cout << s << endl;

    munmap(p, st.st_size);

    return 0;
}
```

页是操作系统分配内存的基本单位，通常是4KB，即4096b。

需要注意的是：mmap映射区的大小必须是系统页大小的整数倍，通常来说，应用层无需关心传入的`size`是否满足这个条件，内核会自动扩展到整数倍。

访问size之外，映射区之内的内存，不会出错。

访问到映射区之外的内存，会导致`SIGBUS`或`SIGSEGV`信号。

当然显式地向上取整到页大小的整数倍，可以避免不必要的隐形麻烦。