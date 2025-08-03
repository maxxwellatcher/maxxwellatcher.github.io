---
title: trick
createTime: 2025/04/27 17:38:54
permalink: /article/09tlns27/
tags:
  - C++
---

## 禁止在栈上创建对象
```cpp
class A {
private:
    ~A(){}
};

// 讲析构函数私有化，对象离开栈时就无法自动调用析构函数，所以就无法生成栈对象。
```

## 禁止在堆上创建对象
```cpp
class A {
private:
};
```