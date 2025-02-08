---
title: C++流
createTime: 2025/02/04 02:07:19
permalink: /article/6bqdf74e/
tags:
  - C++
---
## C++流的继承关系图

![cpp_stream](image/cpp_stream.png)

## ios_base

ios_base是所有流类的基类，它定义了所有流的公共接口。

特点：

1. ==删除了的拷贝构造和赋值构造函数==，所有流对象都没有拷贝语义相关操作。
2. ios_base中有三个非常重要的位掩码类型 `openmode`，`iostate`，`seekdir`。

### openmode（打开模式）

* in（只读）
* out（只写）
* app（每次写入前都寻位到流结尾）
* binary（二进制方式打开文件）
* trunc（打开文件时舍弃流的全部内容，若不存在文件则创建文件）
* ate（打开文件后立即寻位到末尾）

因为标准输入输出流的构造函数是protected，所以一般在文件流和字符串流中才讨论openmode。

### iostate（状态标志）

* goodbit（无错误）
* eofbit（到达文件末尾）
* failbit（读写操作失败，可恢复的错误）
* badbit（不可恢复的流错误）

一般输入流才会发生阻塞，==流的状态发生改变后流的大部分操作不会阻塞==，所以一般对流进行操作后要判断流的状态，进行错误处理，否则有时会造成DEBUG困难。

在ios中定义了判断对应状态的成员函数 `good()`、`bad()`、`fail()`、`eof()`，以及清除状态的成员函数 `clear()`。

还提供了 `operator!`和 `operator bool`来简化状态判断。（内部调用了 `fail()`。）

### seekdir（寻位）

* beg（文件开头）
* cur（当前位置）
* end（文件末尾）

流中有读指针和写指针的概念。在<u>输入流</u>当中只包含读指针的相关操作（例如：`seekg()`、`tellg()`），在<u>输出流</u>当中只包含写指针的相关操作（例如：`seekp()`、`tellp()`）。

==打开模式会影响读指针和写指针的默认位置。==

`std::ios_base::app`模式，写指针在每次写入后都会移动到文件末尾，并且不可移动，而读指针指向了文件开头，可移动。

`std::ios_base::ate`模式，打开文件后，读指针和写指针都指向了文件的末尾，都可移动。

标准输入输出流中seekdir并没有用处，因为一般不会去对标准输入输出进行偏移。所以一般文件流和字符串流中使用。

## \<iostream>

 在`<iostream>`文件中提供了四个实例对象 `cin`、`cout`、`cerr`、`clog`。

标准输入输出`cin`，`cout`的缓冲区属于行缓冲区，即遇到`\n`就会刷新缓冲，并打印到终端。

### cout

cout使用`<<`将变量打印到终端设备。`<<`重载了很多内置类型。

经典C的`printf`通过格式匹配`%d`，`%s` 等控制格式。

而C++中输出流的格式控制对象存放在`<iomanip>`和`<iostream>`中，并重载了输出流的`<<`操作符，用以显示控制输出格式。

::: code-tabs

@tab 整数

```cpp
int a = 11;
cout << std::hex << a; // 十六进制显示
cout << std::dec << a; // 十进制显示（默认）
cout << std::oct << a; // 八进制显示

cout << std::uppercase; // 十六进制字母大写
cout << std::nouppercase; // 十六进制字母小写（默认）
cout << std::showpos; // 正数前显示`+`
cout << std::noshowpos; //正数前不显示`+`（默认）
```

@tab 浮点数

```cpp
// 对于浮点数，默认精度为六位有效数字，并且不显示位于小数点后末尾的0。

double b = 10.10;
cout << b; // 10.1 末尾0不显示
double c = 123456.7;
cout << c; // 123457，末位四舍五入

// fixed表示固定小数点，setprecision设置显示的小数位
cout << std::fixed << std::setprecision(3) << b; // 10.000
//科学计数法显示浮点数
cout << std::scientific << b; // 1.010000e+001

// 重置默认的浮点数输出格式
cout << std::defaultfloat;
```

@tab 布尔值

```cpp
bool c = true;
cout << std::boolalpha; // 输出`true`
cout << std::noboolalpha; // 输出 1（默认）
```

@tab 自定义类型

```cpp
struct Point {
    int x, y;
};

// 全局重载<<运算符
ostream& operator<<(ostream& os, const Point& p){
    os << "(" << p.x << ", " << p.y << ")";
    return os;
}
```



:::

### cin

标准输入流，默认分隔符是空白字符。

需要注意，如果格式不匹配，则会导致cin流状态改变。

```cpp
int a;
string s;
// 假设此处终端输入 "  11 hello  "
cin >> a; // 11
cin >> s; // "hello"

//假设此处缓冲区还有 "   hello 11 "
cin >> a; // hello不是数字，匹配错误，cin状态设置为fail
cin >> s; // cin不可用
```





## 文件流

### 打开文件

```cpp
ifstream ifs("test.txt", std::ios_base::in);
ofstream ofs("test.txt", std::ios_base::out);

ifstream ifs;
ifs.open("test.txt");

ifs.close(); // 关闭文件流，释放资源
```

实际上这两种方式都是通过重定向 `rdbuf()->open(filename, mode)`来打开文件的。而filebuf类的open成员函数打开模式实际上是采用std::fopen函数打开模式的规则，并在此基础上增加了binary的打开方式。fopen在 `<cstdio>`头文件中。

![openmode](image/openmode.png)

openmode的某些组合可能导致文件打开失败，而有些组合可能在不同 的编译器、不同的操作系统上有不一样的表现。

注意：

1. 使用out默认会截断文件，即便不使用trunc。只有 `out | app`或者 `out | in`才不会清空文件。
2. `app`和 `ate`的区别在于，`app`进行写操作时立刻将文件位置移动到文件末尾，结束写操作后回到原来的文件位置。而 `ate`则直接将文件位置移动到文件末尾。这直接影响偏移量的设置。
3. `in`不会创建新文件，如果文件不存在则改变流状态。通常使用这个规则检测文件是否存在。
4. 只要 `trunc`没被设定，都可以使用 `app`。

### operator<<、operaotr>>重载

`<<`应用于输出流，`>>`应用于输入流。将字节写入到流中，或将字节从流中读取。

自定义类型在使用流时，需要重载 `<<`和 `>>`运算符。

```cpp
#include <fstream>
#include <string>
using std::ofstream;
using std::string;

struct Point {
    int x, y;
};

// 注意，流只能引用传递，或者使用移动语义，以为删除了拷贝语义
ostream& operator<<(ostream& os, const Point& p) {
    os << "(" << p.x << ", " << p.y << ")";
    return os;
}

int main() {
  ofstream ofs("test.txt");
  ofs << Point{1, 2} << endl;
  return 0;
}
```

### 读写位置指针、重定向

#### seekp、seekg、tellp、tellg成员函数

seekp、seekg用于获取读写位置指针，tellp、tellg用于获取当前读写位置指针。

p表示put，表示将数据放进字符串中，所以`seekp()`、`tellp()`只有在<u>输出流</u>中能使用。

g表示get，表示从字符串中获取数据，所以`seekg()`、`tellg()`只有在<u>输入流</u>中能使用。

```cpp
ifstream ifs("test1.txt");
ofstream ifs("test2.txt");

ifs.seekg(10); // 默认基准位置是文件开头std::ios_base::beg，向后偏移10个字节
ifs.seekg(10, std::ios_base::cur); // 第二个参数可以指定基准位置


// tellp、tellg成员函数没有参数，默认基准位置是文件开头std::ios_base::beg
auto pos = ifs.tellg();
auto pos = ofs.tellp();

// 获取文件的大小
ifs.seekg(0, std::ios_base::end);
auto pos = ifs.tellg();
```

#### rdbuf()成员函数

重定向函数，返回值类型是 `streambuf*`。非常好用也非常容易core dump。空参调用返回指向当前流的缓冲区指针，有参数时改变当前缓冲区到参数的缓冲区。每一个流都有自己的缓冲区，通过这个函数可以改变流的缓冲区，达到重定向的效果。但是要注意重复释放缓冲区的问题。

::: code-tabs

@tab 错误用法

```cpp
std::ofstream log("log.txt");
std::cout.rdbuf(log.rdbuf());
// core dump，因为log和cout析构时释放了同一个缓冲区
```

@tab 解决方案

```cpp
std::ofstream log("log.txt");
auto store = cout.rebuf();
cout.rdbuf(log.redbuf());
// cout << ...
cout.rdbuf(store);
// 将cout恢复到原来的缓冲区，防止core dump
```

@tab 拷贝文件

```cpp
// 读取文件，然后拷贝文件
std::ifstream ifs("test1.txt", std::ios_base::in | std::ios_base::binary);
std::ofstream ofs("test2.txt", std::ios_base::out | std::ios_base::binary)
ofs << ifs.rebuf();
// 输出流重载了operator<<
// basic_ostream& operator<<( std::basic_streambuf<CharT, Traits>* sb );
```

:::

### getline

getline的功能是读入一段==字节流==，默认分隔符是 `\n`。

getline有两种用法，一种是==输入流==的成员函数（输出流中没有这个成员函数），另一种是 `<string>`文件中定义的普通函数。

::: code-tabs

@tab `<string>`内的getline普通函数

```cpp
// 常见的函数声明
// istream& getline(istream& input, string& str, char delim = '\n');
#include <string>
#include <iostream>
#include <fstream>

int main() {
    std::string line;
    std::ifstream ifs("test.txt");
    while(getline(ifs, line)) {
        std::cout << line << std::endl;
    }
    return 0;
}
```

@tab 输入流内的getline成员函数

```cpp
// 常见的函数声明
// istream& getline(char* str, int count, char delim = '\n');
#include <iostream>
#include <fstream>

int main() {
    std::ifstream ifs("test.txt");
    int bufferSize = 256;
    char* p = new char[bufferSize];
    while(ifs.getline(p, bufferSize, '\n')) {
        std::cout << p << std::endl;
    }
    delete[] p;
    return 0;
}
```

:::

注意：

1. count是指，在指定的count字节内如果没有遇到分隔符，立即返回。
2. 在count字节内遇到delim，**会**读取delim并舍弃它，但**不会**放入str数组内。

## 字符串流

C++11引入了字符串流，这提供了一种用流思想来处理字符串的方式。在 `<sstream>`文件中提供了`stringstream`、`istringstream`、`ostringstream`三个类。

`istringstream`支持从字符串中读取数据的操作，`ostringstream`支持从数据转换到字符串的操作，而`stringstream`并没有提供`istringstream`和`ostringstream`所不具备的额外功能，但它通过结合两者的功能，提供了更灵活的输入输出操作能力。

```cpp
// 方式 1
std::stringstream s1("hello world!");

// 方式 2
std::stringstream s2;
s2.str("hello world!");

// 无参时，返回底层字符串的拷贝。
auto s = s2.str();

// 有参时，释放底层字符串，并设置新的底层字符串。
// 通常使用""来清空字符串。
s2.str("");

```

字符串流并不会自动释放流底层的字符串，如果重复使用同一个流，通常而言需要手动设置`s.str("")`来释放底层字符串。

### operator<<、operaotr>>重载

 ==字符串流通常用作处理字符串与基本数据类型之间的转换==，这是字符串流最常用的功能。

输入流重载了`>>`运算符，他会迫使读指针往前移动。

输出流重载了`<<`运算符，能将变量转换为字符串拼接到末尾。

::: code-tabs

@tab 字符串输入流

```cpp
#include <sstream>
int main() {
    std::istringstream iss("123.hello");
    int a; // [!code warning]
    string s;
    iss >> a >> s;
    // a 为 123
    // s 为 ".hello"
    
    iss.seekg(0);
    double b; // [!code warning]
    iss >> b >> s;
    // b 为 123
    // s 为 "hello"
    return 0;

    // 注意不同类型是变量“消耗”的字符是不一样的
}
```

#tab 字符串输出流

```cpp
#include <sstream>
int main() {
    int a;
    return 0;
}
```



:::

注意：`<<`和`>>`操作符只会改变读写指针，并不会改变底层字符串本身。

## 总结常用示例

::: code-tabs

@tab 拷贝文件

```cpp
#include <fstream>
int main() {
    // 二进制方式打开
    std::ifstream ifs("test1.txt", std::ios_base::in | std::ios_base::binary);
    std::ofstream ofs("test2.txt", std::ios_base::out | std::ios_base::binary);

    // 直接重定向缓冲区，拷贝文件
    ofs << ifs.rdbuf();
    return 0;
}
// 这种方式实际上不高效，因为文件从内核区 --> 用户区 --> 内核区的拷贝，效率很低。
// 使用mmap效率高，但涉及到系统调用有风险。
```

@tab 获取文件大小

```cpp
#include <fstream>
int main() {
    std::ifstream ifs("test.txt", std::ios_base::in | std::ios_base::binary);
    ifs.seekg(0, std::ios_base::end);
	auto size = ifs.tellg(); // 单位字节
    return 0;
}
```

@tab 全局重载输出流<<

```cpp
struct Point {
    int x, y;
};

// 全局重载<<运算符
ostream& operator<<(ostream& os, const Point& p){
    os << "(" << p.x << ", " << p.y << ")";
    return os;
}
```

:::
