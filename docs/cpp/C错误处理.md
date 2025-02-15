---
title: C/C++错误处理
createTime: 2025/02/13 22:06:10
permalink: /article/gqzl1ko3/
tags:
  - C
  - Linux
draft: true
---

## C

c语言中没有异常处理机制，但是提供了一种错误码全局变量`errno`的方式进行错误处理。

某些C标准库函数以及UNIX风格系统调用, 比如`open()`, `read()`等，在出错时会将全局变量`errno`设置为特定的错误码。

```c
#include <stdio.h>
#include <fcntl.h>
#include <errno.h>
int main() {
    int ret = open("test.txt", O_RDONLY);
    if(ret == -1) {
        perror("open error");
    }
    // 打印错误信息
    return 0;
}
```

关于错误码必须紧贴在出错函数调用之后，否则`errno`很可能会被覆盖，换言之他并不是线程安全的。

通常，我们会封装一个宏来简化错误处理：

```c
#define ERROR_CHECK(X, MSG) do {\
    if((X) == -1) {\
        perror(MSG);\
    }\
} while(0);
```