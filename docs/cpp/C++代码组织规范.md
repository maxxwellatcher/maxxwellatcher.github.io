---
title: C++代码组织规范
createTime: 2025/04/27 19:14:56
permalink: /article/srme7ubc/
tags:
  - C++
---

## 典型项目结构

``` bash
project/
├── include/
│   └── my_project
│       ├── my_class.hpp
│       └── my_function.h
├── src/
│   └── my_project
│       ├── my_class.cpp
│       └── my_function.c
├── tests/
└── CMakeLists.txt
```

通常来说，头文件和实现文件应当进行分离。头文件只做类声明、函数原型、模板定义、内联函数等事情，而实现文件则一般导入相应的头文件，对头文件的声明进行具体的实现。

::: code-tabs
@tab main.cpp
```cpp
#include "my_class.hpp"
int main() {
    return 0;
}
```
@tab my_class.hpp
```cpp
#ifndef MY_CLASS_HPP
#define MY_CLASS_HPP
void show();
#endif
```

@tab my_class.cpp
```cpp
#include <iostream>
#include "my_class.hpp"
void show() {
    std::cout << "hello world" << std::endl;
}
```
:::

> 静态全局变量在头文件中声明时，应当使用`extern`关键字，以避免多重定义的问题。
> #pragma once和#ifndef宏都可以用来防止头文件被重复包含，前者更简洁。

## 命名修饰（Name Mangling）

在编译阶段中，C++编译器会对函数名进行命名修饰（Name Mangling），即编译器会将空间名、类名、函数名和参数列表等信息按某些特定规则形成一个独一无二的标识符。这样做是为了解决重载问题，确保每个函数的唯一性。

但是C编译器就就没有这样的机制，它不会对函数名进行命名修饰。这就导致一个问题：链接阶段会找不到对应的函数，因为在符号表中找不到匹配的标识符。

所以，通常而言，在C++项目中调用C语言编写的函数时，需要在C++文件中使用`extern "C"`来告诉编译器这部分代码用的是C语言的编译和链接规则。

## extern "C"

`extern "C"`是一种特殊的语法，可以用来告诉==C++编译器==这部分代码不需要使用命名修饰机制。

```cpp
#include <iostream>

// 这里仅作演示
// 仅表示实际上extern "C"表明函数名不采用命名修饰机制，但内部可以用C++函数编写
// 实际开发当中应当保证被修饰的函数是用C语言编写的
extern "C" void show() {
    std::cout << "hello world" << std::endl;
}

int main() {
    show();
    return 0;
}
```

注意：只有C++编译器认识`extern "C"`，而C编译器不认识。源文件中最好不要使用`extern "C"`，而是在头文件中使用。配合上`__cplusplus`宏，可以区分C和C++编译器。

### __cplusplus宏

`__cplusplus`是C++标准中规定的一个预定义的宏，它在C++编译器中会被定义为一个整数值，表示当前使用的C++标准版本。在C编译器中则不会被定义。

其作用可以分为两种：
1. 配合`extern "C"`使用，区分C和C++编译器。
2. 判断当前代码是在C++环境下编译的，从而使用相应的C++的特性。

::: code-tabs
@tab 混编
```cpp
#ifdef __cplusplus
extern "C" { // 仅C++编译器认识
#endif

#include <some_c_header.h>

#ifdef __cplusplus
}
#endif
```

@tab 区分C和C++环境
```cpp
#ifdef __cplusplus
    void cpp_only(); // C++编译环境

#else
    void c_only(); // C编译环境
#endif
```

@tab 区分编译环境
```cpp

#if __cplusplus >= 201703L
    void cpp17_or_later(); // C++编译环境，且C++版本大于等于2017年3月发布的C++标准
#elif __cplusplus >= 201402L
    void cpp14_or_later(); // C++编译环境，且C++版本大于等于2014年2月发布的C++标准
#else
    void cpp11_or_earlier(); // C++编译环境，且C++版本小于2014年2月发布的C++标准
#endif
```
:::

事实上，为了能够在C++使用C标准库的函数，C++标准委员会就是通过`extern "C"`和`__cplusplus`这种方式改写了C标准库的头文件，使得C标准库在C++环境下也能正常使用。并且为了区分原来的C标准库文件，其文件名后缀`.h`被修改成`c`开头。例如`stdio.h`变成了`cstdio`。

## C和C++混编

### gcc和g++编译器

gcc编译器中没有定义`__cplusplus`宏，而g++编译器中定义了`__cplusplus`宏。并且`g++`命令默认采用命名修饰机制。

需要注意的是：对于每一份源代码，编译阶段都会独立进行的，最终生成的目标文件（通常是.o末尾的文件）都会包含一个符号表，一般存储了下面三部分
1. 定义的符号：源文件已经实现了的函数或者变量
2. 未定义的符号：源文件引用了或者使用了但没有实现的函数或者变量
3. 弱符号：例如C++的虚函数，在编译阶段无法确定具体的实现
4. 符号的属性：如作用域，类型等信息

这里的符号，指的就是通过命名修饰机制生成的标识符。可以通过`nm`命令查看目标文件中的符号表。

`g++`命令默认会采用命名修饰机制，而`gcc`命令不会。`g++`命令也可以通过`-x c`选项来编译C语言代码，从而不采用命名修饰机制。

### 混编方案

两种方式实现混编：
1. 修改C语言编写的头文件，在其中使用`extern "C"`修饰函数。
2. 保持C项目相关的文件不变，在C++项目中通过`extern "C"`导入对应的C头文件或者函数。

::: code-tabs
@tab 方法1
```c
/* 修改C项目的头文件 */
#ifdef __cplusplus
extern "C" {
#endif

// 原本的C头文件声明部分...

#ifdef __cplusplus
}
#endif

```
@tab 方法2
```cpp
// 编写一个新的头文件，在其中导入C项目相关的头文件
#ifndef C_PROJECT_COMPATIBLE_HPP
#define C_PROJECT_COMPATIBLE_HPP
extern "C" {
    #include "c_project.h"
    // 在此处导入C项目相关的头文件...
}
#endif
```
:::

这两种方法各有优劣。

对于方法1，直接在C项目中修改头文件，则无论是使用`gcc`还是`g++`编译，对C项目都不会进行命名修饰，并且在C++项目中导入C项目相关的头文件时也不会出现问题，因为g++编译器会识别到`extern "C"`的存在，从而不会对引入的函数进行命名修饰。这能很好地保证链接阶段不会出现问题。缺点是这种方法会污染C项目的源代码。

对于方法2，不修改C项目的源代码，而是在C++项目中导入C项目相关的头文件，并且通过`extern "C"`修饰。这种方法的缺点是不能统一使用`g++`命令来编译C++项目和C项目的源代码。例如：`g++ source.c main.cpp`会报错。

因为对于`g++`命令对C项目依然会默认采取命名修饰机制，但是由于C++项目采用了`extern "C"`，则编译C++项目时就不会对引入的C项目进行命名修饰。这就导致了链接阶段出错。

解决方案：
1. 先对C项目使用gcc编译C项目，生成目标文件。然后使用g++命令对C++项目进行编译，最后再进行链接。
2. 使用`g++ -x c source.c`命令，让g++编译器以C语言的方式来编译C项目相关的源代码。
