---
title: nodejs：C++插件开发
createTime: 2025/02/10 10:29:30
permalink: /article/rcc6sby5/
tags:
  - nodejs
  - C++
---
## api 接口发展历程

插件开发经历了三个阶段：

+ 使用 v8 引擎，nodejs 原生接口
+ NAN 方式：封装了上诉两个接口，但是如果 nodejs 版本升级，C++插件必须重新编译。
+ node-api：nodejs 官方提供的相对稳定的 C API 接口，保证一定版本范围内的接口稳定性，并且社区会维护 nodejs 一端维护接口可用，而不需要进行插件的重新编译。
+ node-addon-api：提供更简洁更稳定的 C++ API 接口。

 通常使用 `node-addon-api`进行开发，为了保证 ABI 的稳定性，通常引入 `#inlcude "napi.h"`，而不能使用 `node.h`,`nan.h`,`v8.h`。

非常友好的是，node-addon-api 是 header-only 文件，其容量也非常小。

以下是 `node-addon-api`的官方文档。

[https://github.com/nodejs/node-addon-api/blob/main/doc/README.md](https://github.com/nodejs/node-addon-api/blob/main/doc/README.md)

```shell
npm install -D node-gyp
npm install -D node-addon-api
```

## 构建工具 node-gyp

C++代码可以被编译成一个目标文件、动态库等，其后缀名为 `.node`文件，以供 nodejs 使用。

其中 `node-gyp`是当前最流行也是成为事实上的 node C++插件的标准构建工具，了解 `node-gyp`是必经之路。其依赖 python 3.x 环境。

### binding.gyp

binding.gyp 是一份提供给 node-gyp 的配置文件，放置在项目的根目录上。

它其实就是 JSON 格式的文本文件。

```json
{
  "targets": [
    {
      # 表示原生模块的名字
      "target_name": "myModule",
      # 参与构建的源文件，不可以用通配符
      "sources": ["src/main.cpp"],
      # 指定napi.h文件位置
      "include_dirs": ["node_modules/node-addon-api/"],
      # 指定.node目标文件的输出目录，<(module_root_dir)变量为binding.gyp所在目录
      "product_dir": "<(module_root_dir)/build/Release",
      # 可选，指定c++标准
      "cflags": ["-std=c++11"],
      # 指定是否开启C++异常机制，一般不开启
      "defines": ["NODE_ADDON_API_DISABLE_CPP_EXCEPTIONS"],
      # 可选，Windows平台上指定源文件使用utf-8编码，
      # 解决使用中文注释可能出错的问题
      "msvs_settings": {"VCCLCompilerTool": {"AdditionalOptions": ["/utf-8"]}},
    }
  ]
}
```

gyp 格式还可以嵌入 shell 命令，将标准输出作为字符串

只需要在 `"!<()"`内写入命令

例如

```json
{
  "target": {
    # 指定napi.h位置，但是要注意，这是依赖shell的命令，所以在Windows平台上可能有错
    "include_dirs": ["!<(node -p \"require('node-addon-api').include\")"]
  }
}
```

可以看到，构建工具中有些字符串（例如模块名称，文件目录等）经常重复出现，如果要改动则非常麻烦。gyp 在顶层提供了一个选项 `variables`来定义变量，可以在字符串中 `<()`来引用。

```json
{
  "variables": {
    "module_name": "mytest"
  },
  "target": {
    "target_name": "<(module_name)",
    "sources": "<(PROJECT_DIR)/src/*.cpp",
  }
}
```

内置变量同样也使用这种方法引用，常见的内置变量

+ `<(module_root_dir)`：binding.gyp 文件所在目录
+ `<(PRODUCT_DIR)`：生成的目标文件（如 `.node` 文件）的输出目录，通常是 `build/Release` 或 `build/Debug`。

## 命令

```shell
# 删除build目录（构建目录）
node-gyp clean

# 构建项目
node-gyp configure

# 生成项目
node-gyp build

# 重复上面三个步骤
node-gyp rebuild
```

生成项目得到的 `.node`动态链接库一般放在 Release 下。

## 构建工具 cmake-js

同样是非常好用的构建工具，依赖 cmake 环境。适用于使用已经使用 Cmake 进行构建的项目。

## 发包策略

C++开发的插件直接与平台挂钩，通常发包策略有两种：

1. 在用户桌面上进行编译，需写好 README.md，指导安装依赖环境。
2. 提前编译，使用一些第三方库例如 `prebuild`等，判断用户平台再进行分发。
