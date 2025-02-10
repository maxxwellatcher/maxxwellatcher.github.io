---
title: JS、TS仓的性能评估工具
createTime: 2025/02/10 19:27:42
permalink: /article/8geriui4/
tags:
  - 前端
  - nodejs
---
通常可以通过一下方式进行性能分析:

1. 直接使用node进行性能分析
2. 使用jest进行性能分析
3. console.time/console.timeEnd

## node
node已经内置了profiling工具, 这里要补充一个点就是

1. 使用 `--prof`选项运行node执行程序, 会生成 ``isolate-0xXXX-v8.log``的文件
2. 安装 `v8-log-converter`：

```plain
npm install -g v8-log-converter
```

3. 转换文件, 转换后的文件可以通过浏览器的devtool进行分析

```plain
v8-log-converter isolate-0xXXX-v8.log > v8.json
```

4. 也可以通过 `tick-processor`进行查看

```sh
npm install -g tick-processor
tick-processor isolate-0xnnnnnnnnnnnn-v8.log > processed.txt
```

5. 使用node自带的解析工具也可以

```sh
node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt
# 下面这条命令也能work
node --prof-process isolate-* > processed.txt
```

如果发生 `stdout is not a tty`的报错, 使用 `node.exe`进行即可. 看到是在 `git bash`以及 `msys bash`都会出问题, powershell没有.

## jest
在jest内置 `v8-profiler-next`结合测试用例进行分析

## v8-profiler-next
在安装 `v8-profiler-next`的过程中会出现安装问题, 需要补充

```sh
npm config set strict-ssl false
yarn config set strict-ssl false
```

在安装完后能够看到 `node_modules/v8-profiler-next/build`目录, 表明 `v8-profiler-next`安装正确.
