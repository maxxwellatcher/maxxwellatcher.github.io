---
title: shell脚本编程入门
createTime: 2025/02/09 22:17:58
permalink: /article/9o0vv6mq/
tags:
  - shell
---
# 历史
由于历史原因，UNIX 系统存在很多种 shell，最常见的是 sh（Bourne Shell），各种 unix 系统都配有 sh。

另一个最常见的是 bash（Bourne Again Shell），由 GNU 开发的 shell。主要目的是为了与 POSIX 标准保持一致。同时兼顾对 sh 的兼容。

现在各种 Linux 发行版本标准配置的 shell 就是 bash。系统上 `/bin/sh`往往是指向 `/bin/bash`的符号链接。

但是事实上 bash 有很多地方并不完全兼容 sh，甚至有些行为完全不一样。

**而 bash 为了模拟 sh 的行为，当我们使用 `.sh`作为后缀名启动 bash 时，bash 会禁止扩展行为，保持与 sh 的一致。**



而计算机发展到现在，已经有了更多更好用 shell 程序，例如 Windows 平台的 `git-bash`，MacOS 的 `zsh`等，其背后都是对 bash 或者 sh 的更高一级封装，或者模拟。



<u>所以我们要清楚，我们学习的 shell 脚本，是 sh 的脚本语法，但是使用其他的 shell 脚本来执行。</u>

```shell
# 查看shell环境变量
echo $SHELL
```

## 内建命令
一般来说，我们在命令行中输入命令后，shell 会 fork 一个子进程，然后 exec 该命令。但是 shell 的脚本，==内建命令除外==。

内建命令相当于执行了 shell 进程内部的一个函数，并不会创建新的进程。

常见内建命令有：`cd/alias/umask/exit`等。

Linux 系统上判断是否为内建命令的比较笼统的判断标准：

1. which 查不到给命令所在位置
2. 内建命令没有单独的 man 手册页
3. 可以使用 `man builtins`或者 `man bash-buildins`来查看。

所以可以注意到，使用 `cd`这样的命令，当前 shell 进程真的会改变当前的工作目录。

这种情况在脚本中并不是如此。

## 脚本
和其他语言不一样，实际上 shell 脚本的解析流程并不像其他的脚本语言一样（例如 python，js 等），先对整个文件进行语法检查，而是直接从上到下逐一执行。所以很多时候写脚本时必须要有当前进程的和当前工作目录的概念。



对于操作系统而言，任何脚本文件实际上只要赋予其可执行的权限 `chmod a+x <file>`，然后在文件最开头处加上

```shell
#!/bin/sh
```

那么就可以使用/bin/sh 这个路径的解释器去执行该脚本。`#!`表示是指定要执行该脚本所用的解释器路径。

所以，实际上任何脚本都可以这样做，例如首先找到该解释器的位置，然后再使用 `#!<路径>`就可以指定对应的解释器，执行相应的脚本。

例如 python 脚本，node 脚本都可以这么写。



值得注意的是：脚本文件本质上是 fork 了一个当前 shell 的子进程，所以在内部的操作都不会影响当前 shell 进程。==所以，使用脚本编写时要注意：脚本内的内建命令等操作执行完之后退出了子进程，当前 shell 进程的工作目录并没有发生改变。==


shell 脚本的执行方式

1. 直接 `./`执行：启动一个子进程，使用哪个解释器，则在脚本的第一句指定 `#!/bin/bash`
2. `/bin/sh/ <脚本文件>`：相当于先制定了一个程序，然后传参（如何 `node test.js`）
3. `(cd ..;ls -l)`：使用中括号将命令括起来，实际上也是相当于起了一个子进程去执行。所以也并不会改变当前 shell 的工作目录。
4. `source ./test.sh`：将脚本加到当前 shell 中执行（也就是不会产生一个子进程），这个方法会改变当前 shell，常用于加载配置文件。
5. `. ./test.sh`：本质上 `.`和 `source`是一样的。



shell基本语法很简单，没有面向对象的语法。但是值得注意的是：空格符号一定要注意使用，为了兼容命令行的命令，空格往往不一定是分隔符。

## 变量
按照惯例，命名规范与其他语言相同。变量类型与 cmake 语法很相似，都只有字符串。所以可以不使用引号包裹，当然，如果变量中带有空格或者特殊符号，就必须使用单引号或者双引号来包裹。

```shell
VAR=value # 正确
VAR1 =value # 错误，存在空格，会被解析为命令
VAR2=hello world # 错误，存在空格
VAR3="hello world" # 正确
```

```shell
var="hello world"
echo $var
echo ${var}
# 在变量前使用$符号，可以使用该变量

a=1
aa=hello
echo $aa 
# 这种情况下会出现歧义，使用变量时也可以使用{}包裹起来
echo ${aa}
```

### 变量的分类
#### shell 内变量
在 shell 的解析环境中存在的变量。

可分为全局变量，局部变量。

shell 中不适用任何修饰符的变量都是全局变量，不管在函数内还是函数外都一样。

使用 local 修饰的变量，只能声明在函数内，从声明语句调用开始一直到函数结束。

这里的全局或者局部变量都只是相对于这个脚本而言的，并不会跨进程。

```shell
#!/usr/bin/bash
var0=hello

function test() {
    var1=world
    local var2="!"
    echo $var0 $var1 $var2
}

test

echo $var0 $var1 $var2

# 控制台输出
# hello world !
# hello world
```

需要注意的是：在脚本文件中写 `./test.sh`表示启动了一个子进程来执行这个脚本，但是父进程的变量并不会传递给这个这个子进程。

#### 环境变量
系统给每个进程启动时都会提供一些变量供进程使用，这些变量往往可以调用一些系统资源，或者用于自己设定的程序。

```shell
env
```

当启动一个子进程时，环境变量会从父进程拷贝到子进程内。

```shell
export a=1
# 将变量设定为环境变量
unset a
# 删除a这个变量（可以是环境变量，也可以是本地变量）
```

所以需要注意到：在子进程中修改环境变量，并会改变父进程的环境变量，因为环境变量是从父进程拷贝而来的，子进程的变化并不会改变父进程的变量。

#### 特殊变量、位置参数
`$0`：相当于 C 语言的 main 函数的 argv[0]，同理 `$1`，`$2`……也是可以用的，这称之为位置参数

`$#`：相当于 C 语言中的 `argc -1`

`$@`：相当于参数列表 `"$1" "$2" $3" ...`，可以在 for 循环的 `in`后使用

`$*`：同 `$@`

`$?`：上一条命令的返回状态码

`$$`：当前进程号



#### shift 命令（内置命令）
```shell
#!/usr/bin/bash
echo "before shift"
echo '$0:'$0
echo '$1:'$1
echo '$2:'$2
echo '$3:'$3
echo '$4:'$4
echo '$#:'$#
echo '$@:'$@
echo '-----------------'
shift
echo "after shift"
echo '$0:'$0
echo '$1:'$1
echo '$2:'$2
echo '$3:'$3
echo '$4:'$4
echo '$#:'$#
echo '$@:'$@
```

```plain
before shift
$0:./test.sh
$1:11
$2:22
$3:33
$4:44
$#:4
$@:11 22 33 44
-----------------
after shift
$0:./test.sh
$1:22
$2:33
$3:44
$4:
$#:3
$@:22 33 44
```

shift 相当于左移，把最左边的参数干掉了。

这个命令通常是用来处理不定参数的；还有一种情况就是，$+数字这种方式访问参数是有最大限制的（最大$10），此时只能使用 shift 来干掉前置的参数，来访问后面的参数。

```shell
#!/usr/bin/bash
sum=0
while [ -n "$1" ]; do
    sum=$(($sum + $1))
    shift
done
echo $sum
```

## 文件名代换（通配符）
通配符代换的过程发生在真正执行命令之前，例如

```shell
ls test?.txt
```

这个命令就是在执行 `ls`之前，先把 `test?.txt`进行替换，然后传给 ls 来执行。

```shell
ls *.txt
# *：匹配0到若干个字符

ls test?.txt
# ?：匹配一个字符

ls test[123].txt
# [123]：匹配[]内其中一个字符

ls test[1-9].txt
# [1-9]：匹配1到9数字
```

### 参数扩展
```shell
touch {1..3}.txt
# 创建1.txt 2.txt 3.txt文件
```



## 命令代换
使用 ``cmd`` 反引号将命令包裹起来，那么就是执行该命令，将该命令返回来的标准输出作为值。

`$(cmd)`的作用一样。

```shell
val=`date`
echo $val

val=$(date)
echo #
```

通用技巧

```shell
curPath=$(cd `dirname $0`;pwd)
touch $curPath/test.txt
```

这是一个非常常用的技巧，因为执行脚本文件有时候并不取决于文件所在位置，而取决与当前 shell 的工作目录，这就很可能造成非常大的歧义：例如想要在脚本所在目录下创建文件，使用了 `touch test.txt`，结果产生的结果不在当前脚本所在位置，二十在 shell 执行时的工作目录。

## 算数代换
shell 脚本可以进行整数计算，不支持浮点数计算。

`$(())`内部会将变量转换成整数，然后进行计算。 `$[]`也可以做这件事情。

```shell
var=45
echo $((var+1)) $((var*2)) $[var/3]

# 输出
# 46 90 15
```

## 转义字符
同 C 一样，采用 `\`

两个目的

1. 将普通字符转义成特殊字符：`\n`
2. 将特殊字符转义成普通字符：`\$SHELL`

## 引号
### 单引号
内部的所有内容都将被视为字符串

```shell
echo '$SHELL'
# 直接输出$SHELL
```

### 双引号
内部并不都是字符串，可以进行变量的扩展（替换）

```shell
echo "$SHELL"
# 先执行$SHELL这个命令，然后将返回的标准输出进行echo
```

而且需要注意的是，这里的规则跟 cmake 语法上很像

```shell
var="a b"
touch $var
# 进行了扩展 相当于touch a b
# 创建了两个文件

touch "$var"
#进行了扩展，但是被双引号包裹了起来
# 相当于touch "a b"
# 创建了一个文件
```

所以写 shell 脚本的时候，使用变量时，如果变量作为一个参数进行传递的，最好习惯性的加双引号，防止变量中有空格。

## 条件测试，（如何表示真假）
在 shell 编程中，直接使用某条命令（程序）的返回状态来表示真假。

简单来说，就是程序中 main 函数的返回值，如果返回 0 则表示程序执行符合预期，则为真；返回非 0，则表示程序执行不符合预期，则为假。

`$?`：获取上一个命令的返回状态。

`test`：一般操作系统提供的测试表达式真假的命令

`[`：没想到吧，这也是个命令，作用和 test 一样，但是需要用 `]`来闭合，指定表达式边界。



所以在 shell 编程判断真假（常用于 if 语句中），需要在启一个测试程序来判断。

```shell
ls
echo $?
# 返回0

lsls
echo $?
# 返回非0，127

test -n "hello"
echo $? 
```

#### test 表达式
```shell
test ( expression )
# expression is true

! expression
# expression is false
# 取反

expression1 -a expression2
# both expressions are true
# 逻辑与

expression1 -o expression2
# either expression1 or expression2 is true
# 逻辑或

test -n string
# the length of string if nonzero
# 字符串长度为0，返回1，字符串长度非0时，返回0
# 值得注意的是：直接使用$var可能会出问题，最好用"$var"包裹起来
# test -n 不带参数则直接返回0，所以如果var变量不存在，
# test -n $var扩展开来相当于test -n，返回0，则表示var存在，这就出错了。

test -z string
# the length of string is zero

[ string1 = string2 ]

[ string1 != string2 ]

[ string1 -eq string2 ]

[ string1 -gt string2 ]

[ -e file ]
# file exists

[ -f file ]
$ file exists and is a regular file

# ...
# 还有非常多的命令，在阅读脚本或者使用脚本时，最好直接使用man手册看一下。
# 上面是集中比较常用的方法

```

## &&逻辑与和 || 逻辑或
和 C 语言一样，但是在 shell 脚本中更普遍的用法在其短路特性。

&&：如果前面的命令执行失败，则后面的命令不会执行

||：如果前面的命令执行失败，则执行后面的命令

## if 分支结构
```shell
if <命令 | 条件测试>
then
  # ...
elif <命令 | 条件测试>; then # 如果then在同一行，则需要写分号;
  # ...
else # ...
fi # 表示该分支结构语句块的结束
```

常见命令

```shell
if [ -f ~/.bashrc ]; then
  . ~/.bashrc
fi
```

`:`：冒号是一个内建命令，不做任何事情，并且总是返回真，可以用来 if 结构中

`true`：总是返回 0

`false`：总是返回 1

```shell
if :
then
  echo "always true"
elif true; then
  echo "always true"
elif false; then
  echo "always false"
fi
```

## case/esac
类似 C 语言的 switch 结构

```shell
case <expressionL> in
val1|partten1)
  # ...
  ;; # 两个分号表示break
val2|pattern2)
  # ...
*) # 表示其他情况
  # ...
  ;;
esac # 将case倒过来写，表示case语句块结束
```

注意：这里的 var1，var2，partten1，partten2，表示的是可以用通配符来写这个 case 来匹配

所以可以用 `*`来表示其他情况。



## read <var ... >
等待命令行输入字符串，然后将输入存进变量中

```shell
#!/usr/bin/bash
echo "hello boy! key in any two word"
read word1 word2
if [ -n "$word2" ]
then
    echo "yes"
    echo "$word1 and $word2"
else
    echo "no"
    echo "$word1 and $word2"
fi
```

上面可以看到，可以一次存两个变量。命令行中<u>以空格为分隔符</u>。



## for/do/done 循环
```shell
for var in apple banana pear; do
    echo "$var"
done
# 依次输出apple banana pear

# 参数扩展的形式来控制循环次数
# for 和 do 不在同一行时，可以省略;符号
for i in {1..3}
do
  echo "$i"
done
```

```shell
# 计算从1到100的求和
sum=0
for i in {1..100}
do
  sum=$[$sum+$i]
done
echo $sum

# 遍历目录，判断是普通文件还目录
for f in `ls`
do
  if [ -f "$f" ]
  then
    echo "$f is a regular file"
  elif [ -d "$f" ]
  then
    echo "$f is a derectory"
  else
    echo "$f is not recognized"
  fi
done

```

## while 循环
循环没有什么难点

```shell
while <命令|条件测试>
do
  # ...
  
  # 跳出循环
  break

  # 跳出本次循环
  continue 
done
```

## echo 和 printf，输入与输出
```shell
# 表示不换行
echo -n <string>

# echo默认不会进行转义 -e表示解析转义字符
echo -e <string>

# shell还提供printf命令，和C语言的非常类似
printf "%d\t%s\n" 123 "hello"
```

## 管道 | 命令
使用 `|`将多个命令拼接在一起

特点：前一个命令的标准输出 `stdout`，会作为后一个命令的标准输入来重定向。

需要注意的是：如果发生错误，则是标准错误输出 `stderr`，那么下一个命令是读取不到前一个命令的输出的，因为不是 `stdout`。

标准错误输出是不会重定向的。

### tee 命令
将标准输出重新输出，同时存一份到文件

场景：开一个服务，服务一直刷 log，需要实时看到 log，又想将 log 存到一份文件。

### 文件重定向
```shell
cmd > file # 标准输出重定向到文件中，覆盖
cmd >> file # 同上，但是是追加
cmd < file # 将某个文件重定向到标准输入中
```

## 函数
shell 函数实际上非常简略，有诸多限制。

```shell
function <function_name>()
{
  lacal val=value
  return 1 # 只能返回整数
}

# 调用方式
function_name arg1 arg2 ...
```

1. 函数没有返回值，也没有参数列表，及括号内不能写形参
2. function 关键字可以省略，小括号 `()`也可以省略，但是两个必须要保留一个，否则解析器不知道要定义一个函数。
3. 内部可以使用 return 语句，但是返回值只能是整数，作为返回状态码
4. 如果 function 内部没有显示调用 return，那么用函数内上一条执行的命令返回状态码来代替
5. 调用方式：`function_name arg1 arg2 ...`，其中 arg 表示传入的参数，函数不能有形参，但是可以有实参。
6. 函数可以看作是迷你的 shell 脚本，所以内部可以使用 `$0`，`$#`等等这些符号去访问参数。



虽然没有返回值，但是可以使用命令代换的思路来模拟。

```shell
#!/usr/bin/bash
test()
{
    echo "hello world"
    return 0
}
var=$(test)

echo "$var"
```

shell 是经典的命令行式编程语言，所以不要使用堆栈的思维去考虑函数调用的问题，这里实际上可以把 test 当作一个命令，这里 `var=$(test)`实际上是拿到了他的标准输出并存在 var 变量中。



函数内部是可以使用递归的。

# shell 脚本调试方法
shell 本身没有给脚本提供单步调试的方法，而且非常有意思的是，shell 并不是先检查脚本语法，而是直接执行。

sh 程序提供了几个调试脚本的选项

```shell
# 读一遍但不执行，用于检查语法错误
sh -n <script>

# 一边读，一边将执行过的命令打印到标准错误输出
# 实际上就是把脚本打印出来，没什么用途
sh -v <script>


# 提供跟踪执行信息，将执行的每一条命令和结果一次打印出来
# 这个是调试脚本最佳方法
# 打印出来前面有个"+"号表示父进程的执行命令，而后"++"表示fork的子进程
sh -x <script
```

# 命令集合
## | 管道
著名的管道命令

+ 管道命令仅会处理标准输出，对于标准错误会予以忽略；
+ 管道命令必须要能够接受来自前一个命令的数据成为标准输入继续处理才行

## xargs
实际上做两件事情

1. 将标准输出拼凑成一行
2. 将这一行作为下一个命令的参数

```plain
a
b
c
txt
```

```shell
cat test.txt | xargs mkdir

# 创建a b c txt四个文件夹名字
```

## 常见优秀案例
::: code-tabs

@tab 递归查找目录
```shell
#!/usr/bin/bash
function visit() {
    curPath="$1"
    dirs="" # 这里写不写local都无所谓，因为每次调用都会先设置为空字符串
    for f in $(ls $curPath)
    do
        if [ -f "$curPath/$f" ]; then
            echo "$curPath/$f is a recular file"
        elif [ -d "$curPath/$f" ]; then
            echo "$curPath/$f is a directory"
            dirs="$dirs"" $curPath/$f"
        else
            echo "$curPath/$f is not recognized"
        fi
    done

    for dir in $dirs
    do
        visit "$dir"
    done
}

visit `pwd`
```

@tab 获取脚本所在位置
```shell
curPath=$(cd `dirname $0`;pwd)
```
:::

