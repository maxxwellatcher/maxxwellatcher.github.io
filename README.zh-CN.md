# readme

## Install

```sh
npm i
```

## Usage

```sh
# 启动开发服务
npm run docs:dev
# 构建生产包
npm run docs:build
# 本地预览生产服务
npm run docs:preview
# 更新 vuepress 和主题
npm run vp-update
```

## 目录结构

vuePress-theme-plume主题有默认的目录结构。

docs下的除了`nodes/*`以及`.vuepress/*`文件夹以及`README.md`以外，所有md文件都被视为blog文章。

`docs/README.md`会被认为是博客主页，`notes/`下每一个文件夹内的`README.md`会被认为是该笔记的首页

## 配置文件

所有的配置文件都放在`.vuepress`文件夹下。

1. `plume.config.ts`: 主题配置文件，首先使用此处配置
2. `config.ts`: vuePress的配置文件，当主题配置文件不够用时（例如使用新的插件），使用此处配置
3. `nodes.ts`：实际上就是给nodes文章指定路由，以及侧边栏等设置，最后集成到`plume.config.ts`中
4. `navbar.ts`：导航栏配置，最后集成到`plume.config.ts`中

## 文件路径问题

使用vite打包之后，`.vuepress/public/`下的静态资源文件会直接打包到项目根目录之下。

所以如果引用`.vuepress/public/`静态资源，应当直接使用`/`开头，例如：`/xiaomumu.jpg`。

而引用不在`.vuepress/public`文件夹内的静态资源，则需要使用相对路径。例如：`![图片](./xiaomumu.jpg)`。

无论是配置文件还是md文件，都应当遵循此规则。