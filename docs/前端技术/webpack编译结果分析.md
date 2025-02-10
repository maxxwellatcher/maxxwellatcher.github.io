---
title: webpack编译结果分析
createTime: 2025/02/10 18:16:32
permalink: /article/70fi73lm/
tags:
  - 前端
  - webpack
---
# 编译结果分析
webpack 打包本质上只是将多个文件打包成单个文件，打包出来的文件与模块化无关，webpack 可以将模块文件的差异性消除掉。

从 CommonJS 来看 webpack 的实现原理：

实际上 webpack 就是通过自己的方式实现了一遍 commonJS 的引用模块方式。

**本质上是对每一个文件看作是一个函数。（类似于 CommonJS 的方式进行头尾封装）**

**那么相对项目的路径就可以看作是每个文件具有唯一性的模块 ID。**

于是，用一个对象就可以描述所有文件

```javascript
var module = {
  './src/a.js': function (exports, module, require, /* ... */){/* ... */}
  './scr/b.js': function (exports, module, requrie, /* ... */){/* ... */}
}
```

这个时候，则需要在外头实现一遍 module 对象和 require 函数。把每个文件的 require 函数替换成这个 webpack 自己实现的 require 函数。

并且还有一个需求：需要一个 installedModules 对象来缓存已执行的文件。（也就是说，当一个文件第一次被 `require`函数引入后就立即执行，并且下次遇到 require 引入后能立即返回而不是再一次读文件）

具体打包的出来的结果如下：

```javascript
(function (modules) {
  /** 用于缓存导出结果 */
  const installedModules = {};
  
  /** 实现require函数，表示引入了一个文件 */
  function __webpack_require__(moduleID) {
    
    /** 如果有缓存，则直接返回 */
    if (installedModules[moduleID]) return installedModules[moduleID].exports;
    
    /** 实现module对象，即每个模块文件的导出对象，可以看到这里是采用传入传出参数的形式 */
    var module = installedModules[moduleID] =  {
      i: moduleID,//表示当前模块的id
      l: false,//表示是否已经缓存了
      exports: {},
    };
    /** 执行导入的模块，这里考虑到模块文件顶层可能使用了this */
    modules[moduleID].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__,
    );
    module.l = true;

    // 缓存结果
    return module.exports;
  }
  
  /** 真正开始从入口文件执行 */
  return __webpack_require__("./src/index.js");
})({
  "./src/a.js": function (module, exports, __webpack_require__) {
    /** 通常来说，这个的模块文件内容是通过eval函数包裹住的 */
    function a() {
      console.log("in a.js");
      return "a";
    }
    module.exports = a;
  },
  "./src/index.js": function (module, exports, __webpack_require__) {
    const a = __webpack_require__("./src/a.js");
    a();
    exports.test = () => console.log("in index.js");
  },
});
```

解读：

实际上 webpack 是这样实现的：

1. 以路径为唯一标志，可以获得以路径为键，函数包裹的模块文件为值的整体项目 modules 对象。
2. 构建一个立即执行函数，参数为 modules 对象。
3. 创建一个 installedModules 对象，对已经引入的模块文件进行记录。
4. 在这个立即执行函数内部可以实现每个模块文件所需要的 modules 对象和 require 函数。
5. 在这个立即执行函数文件的最后执行入口文件。



可以看到，构建 modules 对象是最重要的部分，也是 webpack 初始化的过程。

# 编译过程

webpack 有诸多的概念，有些概念的意义需要理清：chunk，bundle，chunk asset

实际上就是由入口文件开始检索依赖，由多个依赖文件作为值以及他们的路径作为键构成的对象，

这种资源在不同环境或者环节上有着不一样的称呼。

> 那么为什么需要区分这么多名字呢？可能是为了更方便描述这种资源在不同环境或者环节上的行为。

chunk：打包过程中（尚未打包结束）

bundle：打包结束后的对象

chunk asset：资源列表，包含了模块 id 和

> bundle 中可能包含多个 chunk，因为 webpack 可以设置多入口，不同入口引进来的依赖文件很可能相互毫无关联，但是会被打进到同一个 bundle 文件当中去。

chunk hash：一个 chunk 也有自己的唯一标识，这个就是 chunk 哈希。每个 chunk asset 也会有一个自己的哈希值。



# loaders
`loader-utils` 库可以自定义 loader

```javascript
{
  module: [
    {
      test: /\/src\/index\.js/,
      use: ['./loader1.js', './loader2.js']
    },
    {
      test: /\src\/index\.js/,
      use: {
        loader: ['./loader3.js', './loader4.js']
        option: {}
      }
    }
  ]
}
```

loaders 的作用是在分析 chunk asset 前将不同语言的文件翻译成 js。

module 内就是做这个事情，其中 test 字段表示匹配对应的文件，而 use 内的 loader 对应的就是要应用的这些 test 文件的 loader。

一个文件可以被多个加载器解析。其解析顺序按照栈的原理来实行，后进的先执行。

所以上面的 index.js 会根据 loader4,3,2,1 的顺序解析。

