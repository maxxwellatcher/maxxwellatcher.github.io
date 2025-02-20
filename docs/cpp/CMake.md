---
title: CMake
createTime: 2024/02/10 21:31:13
permalink: /article/pfi2rshh/
tags:
  - C++
---
# cmake 概要简洁
[爱编程的大丙](https://subingwen.cn/)

【CMake 保姆级教程【C/C++】】 

[CMake 保姆级教程【C/C++】_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV14s4y1g7Zj/?share_source=copy_web&vd_source=f70b0f8b0776be81c93e8c471bd9569e)

---

cmake 本质上就是一个生成 makefile 文件的工具，而 makefile 才是真正意义上的构建工具。但是，makefile 本身是依赖于平台的，而 CMake 是不依赖于平台的工具。

基本用法：

1. 安装 cmake，编写 CMakeLists.txt 文件。
2. 在命令行中执行 cmake 命令，让 cmake 程序读取 CMakeLists.txt 文件，进行项目构建生成 makefile 文件。

小细节：

命令：`cmake <CMakeLists.txt 所在目录>`

注意，cmake 后接的是 `dirname`，而不是 `filename`！也就是说只需要目录名而不需要加上 CMakeLists.txt，因为 cmake 程序会在指定目录下搜索 CMakeLists.txt，但是 cmake 生成的项目构建相关的文件会生成在命令行当前工作目录下。

所以，通常的构建流程如下：

1. 找到 CmakeLists.txt 文件
2. 创建 build/文件夹
3. 进入 build/文件夹
4. 使用命令 `cmake ..`

这样就可以将构建文件解耦出来，单独放在一个文件夹内。

---

# 注释写法
```cmake
# 井号开头

#[[ 
多行注释，使用
]]
```

# CMakeLists.txt 基础配置
```cmake
# 基础配置
cmake_minimum_required(VERSION 3.20) #要求CMake最低版本

project(hello) # 项目名称，不写双引号也没有问题
add_executable(hello hello.cpp) # 由源文件生成可执行文件


#[[
cmake基础指令不区分大小写，但是变量区分大小写

使用cmake -P *.cmake 可以执行后缀为cmake的脚本文件
在学习cmake语法时非常方便
]]
```



# CMake 可以理解为一种脚本语言
CMake 本身有其脚本语法，虽然最终目的是为了构建 C++工程项目，但是作为一种脚本，按照语言的方式去学习未尝不可。

## *.cmake 文件和 CMakeLists.txt 文件
cmake 是一种脚本语言，一般而言其后缀设定为 .cmake，可以通过命令 `cmake -P *.cmake`来指定执行对应的脚本文件。

1. `cmake -P test.cmake`：执行 cmake 脚本

```shell
# 执行cmake脚本
cmake -P test.cmake

# 在当前工作目录下查找CMakeLists.txt，创建build目录，在其中生成makefile文件
cmake -B build

# 生成项目（生成相应的可执行文件）
cmake --build build

# -G选项，可以选择生成器，（即编译工具链），通常而言generator名字带空格，要用""包裹起来
cmake -G <generator-name>

# 从这里可以看到当前环境能够选择什么生成器
cmake --help
```

需要注意的是：MSVC 编译工具链和 minGW 编译工具链生成的产物不一样。

例如：

MSVC 不会生成 makefile 文件，因此也没有对应的 make 命令操作，使用 `cmake --build build` 可以生成可执行文件，放在 Debug 文件夹内。

而 MinGW 会产生 Makefile 文件，需要在 make 一下，当然也可以使用`cmake --build build`命令，这个命令本身的作用就是为了消除不同生成器的生成项目的差异。让用户用同一个命令来生成可执行文件。

## 打印 message
在控制台中打印信息，相当于其他语言中的 print、console.log、cout 等。

```cmake
message(hello)
message("hello")
message("hel
lo") # 这样打印出来是能识别出换行的
message([[hel
lo]]) # 同上，这样打印出来是能识别出换行的
message(he  llo) # 会自动拼接字符串，空格忽略
message(he\ llo) # 显示空格需要转义字符

#[[
打印结果如下

hello
hello
hel
lo
hel
lo

]]
```

实际上 message 可以带子命令

1. STATUS：非重要信息
2. WARNING：Cmake 警告，但是会继续执行
3. SEND_ERROR：CMake 错误, 继续执行，但是会跳过生成的步骤
4.  FATAL_ERROR：CMake 错误, 终止所有处理过程

```cmake
message(STATUS "hello world")
```

## 变量 set
### 变量的定义、赋值、使用
定义变量，并给变量赋值，使用 set 方法：

```cmake
# 定义变量
set(var "hello")

# 使用变量
message(${var})
```

cmake 当中所有变量（包括值）的类型只有一种，即**<font style="background-color:#FBDE28;">字符串</font>**。

```cmake
set(var 1231231)
set(var "1231231")
# 这两组本质上是一样的
```

---

在 cmake 脚本中有一个非常令人迷惑的写法：<u>可以不给字符串值写双引号，也可以给变量名写上双引号。</u>

例如：

```cmake
# var是个变量名，hello字符串值
set("var" hello)
```

行内大部分都不喜欢写双引号，所以对于初学者来说比较难看懂别人的 CMakeLists.txt 文件

### 值的分隔
既然所有的变量都只是字符串，字符串拼接是一件很自然的事情，也可以称之为给一个变量赋多个值。

```cmake
set(var hello world!)
message(${var})

# 打印结果是：helloworld!
```

上面的打印结果显示，set 一行实际上可以理解为

```cmake
set(var "hello" "world!")
```

cmake 自动将两个值连起来了，这里使用的分隔符为空格。在 cmake 中也可以使用分号表示分隔

```cmake
set(var hello;world!)
```

效果是一样的。

需要注意的是：无论多少个分隔符，message 都会把分隔符取消掉，将其连在一起。所以如果需要空格符号，可以直接用双引号包裹起来，或者用转义符 \

```cmake
set(var "hello world!")
set(var hello\ world)
message(${var})
```

### 在双引号""中使用${}使用变量
对于只有一个值的变量来说，这可能是多此一举。但是拥有多个值的变量中，双引号的行为可以将变量的多个值打包起来，并用分隔符分号 `;`分隔开来。

```cmake
set(var 10 20 30)
message(${var})
message("${var}")

#[[
输出结果：
102030
10;20;30
]]
```

### 诡异但不实用的语法
其实变量名本身是字符串，适用可以用${}来引用，既然是字符串，那么就可以适用空格来命令

```cmake
set("my var" hello)
# 这是合法的

set([[my var]] world!)
#这也是合法的，这里的双引号可以用[[]]来代替
```

这种诡异的写法没有一点美感，也没有意义，可见 cmake 语法本身的松散，尽量不要使用这种语法。

## 列表 list
cmake 没有专门设置列表（数组）的数据结构，本质上使用 set 就可以实现相应的方法

```cmake
set(mylist a0 a1 a2 a3)
```

给一个变量设置多个值，那么就可以认为是定义了一个列表。

通用方法：

`list(<子命令> <list 变量> [ 具体不同子命令对应的参数 ])`

```cmake
 # Reading
   list(LENGTH <list> <out-var>)
   list(GET <list> <element index> [<index> ...] <out-var>)
   list(JOIN <list> <glue> <out-var>)
   list(SUBLIST <list> <begin> <length> <out-var>)

 # Search
   list(FIND <list> <value> <out-var>)

 # Modification
   list(APPEND <list> [<element>...])
   list(REMOVE_ITEM <list> <element>)
   list(INSERT <list> <index> <element>)
   list(FILTER <list> {INCLUDE | EXCLUDE} REGEX <regex>)

   list(SORT <list>) # 安字典顺序排序
   list(REVERSE <list>) # 反转列表
```

注：\<out-var>表示定义的新变量，存放返回的值。\<element index>指数组下标，……

## 流程控制
### if 语句
```cmake
if(<condition or var>)
  <commands>
elseif(<condition or var>)
  <commands>
else()
  <commands>
endif()
```

#### 变量 var
虽然在 cmake 当中所有值的类型都为字符串，但是在 if 语句当中 cmake 会区分表示真值或者假值的字符串：

真值：

1. TRUE 或者 true（不区分大小写）
2. 1
3. YES 或者 yes
4. Y 或者 y
5. ON 后者 on（表示启动）
6. 不表示假值的非空字符串

假值：

1. FALSE 或者 false（不区分大小写）
2. 0
3. NO 或者 no
4. N 或者 n
5. IGNORE（特定的设置中，会被判为假值）
6. NOTFOUND（<font style="color:rgb(37, 41, 51);">在查找库或程序时，如果未找到，这个值表示假</font>）
7. 空字符串
8. 未定义的变量



<u>条件表达式当中 var 不需要</u>`<u>${}</u>`<u>来引用就可以直接使用。</u>

<u>但是需要注意的是：直接在 条件表达式中的字符串必须要用双引号或者 [[]] 包裹，否则会被判断为一个变量！例如：</u>

```cmake
if(true)
  message(yes)
else()
  message(no)
endif()

# 输出了no
```

输出了no，尽管11是真值，但是这里true表示一个变量，但是这个true变量未定义。

```cmake
set(var true)
if(var) #引用变量不需要${}
  message(yes)
else()
  message(no)
endif()
# -----------------------

if("ture")
  message(yes)
else()
  message(no)
endif()

# 均输出yes
```

#### 条件判断
##### 逻辑判断
1. OR
2. AND
3. NOT

```cmake
set(var1 1)
set(var2 0)
if(var1 OR var2) # 可以看到这里的变量也不需要使用${}
  message(yes)
else()
  message(no)
endif()
```

##### 数值大小判断
1. LESS
2. GREATER
3. EQUAL
4. LESS_EQUAL
5. GREATER_EQUAL

虽然我们知道所有的变量都是字符串，但是如果变量为数字组成的字符串，上述的符号 cmake 可以识别到并且在数值层面上进行大小比较，但是如果其中一个变量不是纯数字构成，那么就会按字典顺序进行比较。

```cmake
set(var1 11)
set(var2 2)
if(var1 LESS var2)
  message(yes)
else()
  message(no)
endif()

# 输出no
```

##### 字典顺序大小判断
1. STRLESS
2. STRGREATER
3. STREQUAL
4. STRLESS_EQUAL
5. STRGREATER_EQUAL

cmake 专门提供了字典顺序比较。

注：字典顺序就是按字符串** 位置 **逐个比较他们的 ASCII 码大小，一般来说 `空 < 数字 < 大写字母 < 小写字母 `

##### 文件判断
1. EXISTS
2. IS_DIRECTORY
3. IS_SYMLINK
4. IS_ABSOLUTE

需要注意的是：文件判断符后接的是字符串，所以必须要用 `${}`来引用变量。

```cmake
set(mypath ${CMAKE_CURRENT_SOURCE_DIR})
if(EXISTS ${mypath}) # 和前面判断符不一样，这里必须使用${}
  message(yes)
else()
  message(no)
endif()

# 输出yes
```

### foreach 语句
```cmake
# 形式1
foreach(<var> RANGE <max>)
  <commands>
endforeach()
# var为局部变量，表示当前遍历到的值，idx从0开始，到数字max，左闭右闭区间

# 形式2
foreach(<var> RANGE <min> <max> [<step>])
  <commands>
endforeach()
#可设置循环起点以及步长，左闭右闭区间

# 形式3
foreach(<var> IN LISTS <list> [ITEMS [val1 val2 ...]] )
  <commands>
endforeach()
# 遍历list，后面的ITEMS相当于在list后临时加入几个新的值（不改变原list）

foreach(<var> IN LISTS <list0> [list1 list2 ...])
  <commands>
endforeach()
# 按顺序遍历多个list

# 形式4
foreach(<var> IN ZIP_LISTS <list0> [list1 list2 ...])
 <commands>
endforeach()
# 从idx为0开始同时遍历每一个list
```

<u>注意：形式 1 和形式 2 的遍历范围是</u><u><font style="background-color:#FBDE28;">左闭右闭区间</font></u><u>，这和很多语言不相同。</u>

#### ZIP_LISTS 遍历
这个方法可以同时遍历多个 list，在每个循环体中，采用 var_idx 的方式来访问对应的 list

例如：

```cmake
set(var1 1 2 3 4)
set(var2 one twho three)
set(var3 a b c d e f)
foreach(var IN ZIP_LISTS var1 var2 var3)
  message("${var_0} ${var_1} ${var_2}")
endforeach()

#[[
输出结果为
1 one a
2 twho b
3 three c
4  d
  e
  f
]]
```

这里可以发现，实际上 `${}`符号实际上是可以穿透双引号""来使用的。循环体的执行次数取决于 最长的 list 的长度。超出范围的 list 引用时返回空字符串。

### while 语句
```cmake
while(<condition or var>)
 <commands>
endwhile()
```

while 语句非常简单，但是也有一个坑，那就是和 if 语句中的 condition 不一样，**<u>if 语句中引用变量不需要使用 </u>**`**<u>${}</u>**`**<u>，但是 while 必须使用，否则会被认为是字符串。</u>**

## 函数
### 作用域
```cmake
function(<function_name> [arg0 arg1 arg2 ...])
  <commands>
endfunction()

# 调用方式
function_name()
```

因为 cmake 本意并不是作为一种开发语言，而只是一种构建工具脚本语言，所以提供的函数功能很简单，仅仅只是为了提供一种可以复用的语法，所以没有返回值的概念。而且参数只是值传递，没有引用传递或者是指针传递的方法。



函数内部可以直接使用非常多常见的内置变量。例如 `CMAKE_SOURCE_DIR`，`CMAKE_BINARY_DIR`，`CMAKE_CURRENT_SOURCE_DIR`，`CMAKE_FUNCTION_NAME`等。

 通过 set 的 `PARENT_SCOPE`选项可以直接改变外层作用域的变量。

例如：

```cmake
set(var 10)
function(test)
    set(var 20 PARENT_SCOPE) #在后置位加入PARENT_SCOPE，可以使用外层的变量
    message(${var})
endfunction(test)

test()
message(${var})

# 输出
# 10
# 20
```

### 传参
实际上不写函数参数的情况下，函数内使用ARGV0, ARGV1 的格式一样可以调用传进来的参数。

${ARGV0} 表示第一个参数 ${ARGV1} 表示第二个参数 ……

cmake 给函数内部提供了预定义的三个变量

1. ARGC：传入的参数总数
2. ARGV：传入的所有参数
3. ARGN：没有显式提供参数名的参数，也成为可选参数

```cmake
message("3.可以使用一些预定义的变量访问可选参数:ARGC, ARGV, ARGN")
function(name_list name1 name2)
    message("argument count: ${ARGC}")
    message("all arguments: ${ARGV}")
    message("optional arguments: ${ARGN}")
endfunction()
 
name_list(Jack Kate Jony Tom)
message("----------------------------------------")
name_list(Jack Kate)

#[[
输出结果：
argument count: 4
all arguments: Jack;Kate;Jony;Tom
optional arguments: Jony;Tom
----------------------------------------
argument count: 2
all arguments: Jack;Kate
optional arguments:
]]
```

也可以使用 ARGV0，ARGV1，……这样的方式去调用对应位置的参数。

```cmake
function(name_list)
    message(${ARGV0})
    message(${ARGV1})
endfunction()

name_list(A B)

# 输出结果
# A
# B
```

关于传参的细节：

实际上使用 `${}`没办法直接将一个 list 传入，因为本质上 cmake 并没有 list 的数据结构。

```cmake
set(var 10 11 12)

function(messagelist arg)
    message(${ARGC})
    foreach(var IN LISTS arg)
        message(${var})
    endforeach(var IN LISTS arg)
endfunction()

messagelist(${var})
# 这种方式传递，相当于js的展开运算符，
# arg只是接受到了第一个参数10，而11、12作为了可选参数传进了函数

# 输出结果
# 3
# 10

messagelist("${var}")
# 使用双引号""将var打包传入，那么第一个参数就接收到了变量所有的值

# 输出结果
# 1
# 10
# 11
# 12
```

## 宏
宏是个强大且灵活的工具，但是其实并不好用，尽量少写，能理解其作用机制就足够了。

```cmake
macro(<macro_name> [arg ...])
  <commands>
endmcro()
```

宏的使用上与函数非常像，甚至可以使用 ARGV,ARGC,ARGN 这些内置变量，使用上和函数一样。

### 与函数的区别
1. 宏函数不会创建局部作用域
2. 按值传参，参数会被直接展开成字符串

虽然宏可以理解为文本替换，但需要明确的是：宏函数并不只是替换了\<commands>内容，还替换了参数以及内置变量。

```cmake
macro(Test myVar)
    set(myVar "new value")
    message("argument: ${myVar}")
endmacro()

set(myVar "First value")
message("myVar: ${myVar}")
Test(${myVar})
message("myVar: ${myVar}")

#[[
输出结果：
myVar: First value
argument: First value
myVar: new value
]]
```

可以看到，令人感到诡异的是 argument 输出的是 First value 而不是 new value！

```cmake
set(myVar "First value")
message("myVar: ${myVar}")

set(myVar "new value")
message("argument: ${myVar}")
    
message("myVar: ${myVar}")
# 以上是错误的理解，以为Test(${myVar})只是将宏进行简单的文本替换
```

实际上宏还会展开参数，将参数也进行了文本替换！

```cmake
set(myVar "First value")
message("myVar: ${myVar}")

#[[ Test(${myVar})替换成了Test("First value") ]]
set(myVar "new value")
message("argument: First value")# 宏的参数已经进行了替换，不再是变量
    
message("myVar: ${myVar}")
```

在调用 `Test(${myVar})` 时，`${myVar}` 已经在宏调用之前被展开，因此传递给宏的是其值 `"First value"`。  

而宏内部的 `set(myVar "new value")` 会直接修改全局作用域的 `myVar`。  因为本质上并没有创建局部作用域。

## 作用域（Cmake 脚本嵌套）
1. 函数作用域(Function scope)
2. 目录作用域(Directory scope)

## 目标（target）概念
 在CMake中，“目标”（`target`）是一个通用的概念，代表你在构建系统中要生成的最终结果或中间结果。目标通常是以下几种类型之一：  

1. 可执行文件
2. 静态库
3. 动态库
4. 接口库

 CMake的发展趋势是更强调目标（target）为中心的配置方式，现代 CMake 有很多命令中加入 `target` 字样，提供新的一组方法。这个目的是为了更精准地控制每个 target 的依赖关系。

# cmake 构建项目
## 方式一：在 add_executable()写所有源文件
```yaml
project_dir:
  - CMakeLists.txt
  - main.cpp
  - src:
    - a.cpp
    - a.h
```

使用于简单工程，最简单的配置

```cmake
cmake_minimum_required(VERSION 3.20.0)
project(test)
add_executable(out main.cpp src/a.cpp)
# 在这里写好所有的源文件即可，其中要写相对路径指明
```

## 方式二：使用 include 调用子目录的 *.cmake 文件
```yaml
project_dir:
  - CMakeLists.txt
  - main.cpp
  - src:
    - src.cmake
    - a.cpp
    - a.h
    - b.cpp
    - b.h
```

在 CMakeLists.txt 当中调用子目录的 cmake 脚本，在 cmake 脚本中定义源文件的变量，并在 CMakeLists.txt 中调用它。

实际上只是方式一的变种。

```cmake
cmake_minimum_required(VERSION 3.20.0)
project(test)
include(src/src.cmake)
add_executable(out ${sources})
```

```cmake
set(sources src/a.cpp src/b.cpp)
```

需要注意的是：src.cmake 当中写源文件的路径的时候必须要使用源文件相对于CMakeLists.txt 的路径，因为 include 无非只是参数传递，在CMakeLists.txt 中使用子目录下的 cmake 脚本变量也只是用了其字符串，cmake 并不会根据文件位置改变字符串。

## 最佳实践

工程目录结构：头文件和源文件分开，源文件放在 src 目录下，头文件放在 include 目录下。

::: file-tree

  - CMakeLists.txt
  - build/
  - inlcude/
    - project0/
    - project1.h
    - ...
  - src/
  - test/

:::

```cmake
# 设置CMake的最低版本要求
cmake_minimum_required(VERSION 3.10)

# 设置项目名称和版本
project(my_project VERSION 1.0)

# 设置C++标准
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# 包含头文件目录
include_directories(${PROJECT_SOURCE_DIR}/include)

# 添加可执行文件
file(GLOB SOURCES "src/*.cpp")

add_executable(my_project ${SOURCES})

# 如果有测试文件，可以添加测试可执行文件
# add_executable(test_my_project tests/test_my_class.cpp src/my_class.cpp)

# 启用测试
# enable_testing()
# add_test(NAME test_my_project COMMAND test_my_project)

# 如果有第三方库，可以在这里添加
# find_package(SomeLibrary REQUIRED)
# target_link_libraries(my_project SomeLibrary::SomeLibrary)

# 设置输出目录
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/bin)
set(LIBRARY_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/lib)
```

# 其余配置
## CMAKE_CXX_STANDARD 变量

全局变量

用来设置源文件使用的语法标准，相当编译时使用 `-std=c++11`参数

```cmake
set(CMAKE_CXX_STANDARD 11)
# 设置使用的
```

## PROJECT_SOURCE_DIR 变量
全局变量

返回调用 project 命令调用的文件所在位置。一般而言就是项目最顶层的 CMakeLists.txt 的文件位置

## EXECUTABLE_OUTPUT_PATH 变量
全局变量

设置可执行文件的导出位置

```cmake
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/exec)
```

## LIBRARY_OUTPUT_PATH 变量
全局变量

设置库的导出位置

## aux_source_directory(\<dir> \<var>)命令
用来搜索某个文件目录下的所有源文件，并存放在 var 变量当中。

dir 是绝对路径，通常 配合 `PROJECT_SOURCE_DIR`使用，将源文件（不包括其他文件 ）存储到 var 变量当中。

```cmake
aux_source_directory(${PROJECT_SOURCE_DIR}/src source_files)
# 搜索得到所有的源文件（不包括头文件）
```

## file()命令
文件操作命令，拥有非常多的子命令可以对项目的文件进行操作。

```cmake
# 搜索文件并存放到var变量中
file(GLOB <var> <relative_path>)
# 例： file(GLOB source_files "src/*.cpp")
# 可以使用*或**去匹配

file(GLOB_RECURSE <var> <relative_path>)
# GLOB_RECURSE的作用同上，区别在于该子命令会递归搜索给定目录及其子目录下的文件
# 例：file(GLOB_RECURSE source_files "src/*.cpp")
# 会搜索src下及其子目录下所有.cpp源文件

file(RENAME <old_filename> <new_filename>)
# 更改名字

file(MAKE_DIRECTORY [<directory1> ...])
# 创建文件夹

```

值得注意的是：cmake 是单次解析的，也就是说在 cmake 构建过程中使用这些命令改变了文件，但是其他命令无法感知已经进行了更改！最佳实践是不要在 cmake 中使用这些命令。如果项目需要创建文件夹或者修改文件，请直接在外部实现或者用其他脚本来实现！

file 命令最常用和最实用的命令也就是 `GLOB/GLOB_RECURESE`！

## include_directories(\<path>) （弃用）
指定头文件所在目录，那么在源文件中写 `#include`时就不需要写明路径

```yaml
project_dir:
  - src/
  - include/
    - project_name/
  - Build/
  - CMakeLists.txt
```



```cmake
cmake_minimum_required(VERSION 3.11)
project(test)

include_directories("include")
# 这里只需要写include就行不需要具体到project_name
# 这样在源文件中写#include "project_name/a.h"
# 在源文件写相对与include的路径
```

## target_include_directories(\<path> [path1 path2 ... ])
现代 CMake 的导入头文件的用法，优先使用这个方法。

## add_library(\<target> [\<PRIVATE | PUBLIC | INTERFACE>] [sourcefile1 ... ])
制作库，可以是静态库也可以是动态库

对应的子命令有

1. STATIC：静态库
2. SHARED：动态库

```cmake
file(GLOB source_files "src/*.cpp")
add_library(test STATIC ${source_files})

#--------------------------
add_library(test ${source_files}) #默认时SHARED制作动态库
```

需要注意的是，生成的最终的库的文件名，与 cmake 中所命名是有区别的。最终生成库的名字会在前缀加上 `lib`，而后缀会根据平台而定。在 Windows 上是 `.dll`或者是 `.lib`，在 Linux 平台上是 `.so`或者是 `.a`。

## link_libraries(\<target>)（弃用）
##  target_link_libraries(\<target> [\<PRIVATE | PUBLIC | INTERFACE>] \<lib1> \<lib2> ... )
该命令必须要在 `add_executale`之后。



使用 `PRIVATE`、`PUBLIC`、`INTERFACE` 的最佳实践

+ PRIVATE：如果当前目标只在内部使用某个库，而其他依赖此目标的目标不需要该库的符号或接口，将依赖设为 `PRIVATE`。
+ PUBLIC：如果当前目标依赖的库也需要被其他依赖此目标的目标使用，则设为 `PUBLIC`。
+ INTERFACE：如果当前目标不需要直接链接该库，但它的依赖目标需要（例如接口库），可使用 `INTERFACE`。

## link_directories(\<path> [path1 path2 ... ])
指定动态库

## find_library(\<var> \<lib_name> [path1 path2 ... ])
如果没有提供库的查找路径(path1 path2)，那么就在系统默认的库目录（`/usr/lib/`,`/usr/local/lib`）查找库。

## find_package()


# 指定生成器
在 windows 操作系统中，可能希望使用 MinGW 工具来编译，但是 cmake 在 Windows 平台上默认使用 MSVC 当做默认的生成器。

通常我们会使用 `-G`来指定生成器：`cmake -G "MinGW Makefiles"`。通过 `cmake --help`可以查看当前机器所支持的生成器。

