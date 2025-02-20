---
title: CSS
createTime: 2023/5/22 18:24:58
permalink: /article/krxcotf8/
tags:
  - 前端
  - CSS
---
css规则

```css
h1{
  color:red;
  background-color:lightblue;
  text-align: center;
}
```

这种写法表示一条css规则

css规则 =  选择器 + 声明块

选择器：选中元素，在该元素上应用样式。

## @规则
@语句，一些特别的 CSS 语法。

### @import
在 CSS 文件中引用，可以将别的文件引入到该 CSS 文件中。

```css
@import "reset.css";

div {
  width: 20px;
  color: red;
}
```

如何判定声明顺序？

网络加载中首先加载该 index.css 文件，解析时遇到@import 语句后立即加载 reset.css 文件。

但是渲染过程中是按照文档中通过 link 的顺序来的。

### @charset
```css
@charset "utf-8"
```

表示这个 css 代码采用的字符集

### @font-face
web 字体，让用户下载字体。但是现在很少用了，因为字体文件体积不小，需要用户下载可能影响渲染效率。

```html
<style>
  /* 制作一个新的字体，名字叫new font，用户就会下载这个ttf文件 */
  @font-face{
    font-family: "new font";
    src: url("./font/newFont.ttf")
  }
  p {
    font-family: "new font";
  }

</style>
<!-- ... -->
```

**字体图标**

沿用上面这种思路，可以通过制作一个新的字体，然后通过伪类选择器来实现这个效果，具体的字体图标可以通过 iconfont.cn 这个网站查看。

## css代码书写位置
1. 行内样式：内部样式表
2. 内嵌样式：内联样式表
3. 链接式：外部样式表
4. 导入式：使用 `@import`命令导入外部 CSS 样式表文件

```html
<!-- 内部样式表，通常写在head元素内 -->
<style>/*内部写css规则，完全按照css语法，包裹注释*/</style>
<!-- 内联样式表，css规则不必写选择器 -->
<span style="color: red; font-size: large;"></span>
<!-- 外部样式表，最常用 -->
<link rel="stylesheet" href="./test.css">
```

## 选择器
### ID选择器
选中对应ID值的元素

```css
#id {
  color: blue;
}

/* <span id="id">id选择器</span> */
/* 元素的id属性 */
```

### 元素选择器
选择器写上元素，则可以对这种元素调整样式

```css
h1 {
    color: red;
}
```

### 类选择器
```css
.class {
  color: blue;
}
```

选择 id 属性为对应名称的元素

例如：

```html
<h1 class="demo"></h1>
<div class="demo><div>
```

```css
.demo {
  color: blue
}
```

### 通配符选择器
表示选择所有的元素

```css
* {
  color: red;
}
```

### 属性选择器
根据属性名和属性值选择元素

```css
[href="https://www.baidu.com"] {
  color: red;
}
[class] {
  font-style: italic
}
```

当一个元素含有这个属性时，css将会渲染该元素

属性选择器还有很多规则，可以去mdn查询

### 伪类选择器
选中某些元素的某种状态，通常在某个元素+冒号+状态来表示

常见于a元素上的伪类选择器

1. link：超链接为访问时的状态（）
2. visited：超链接访问过后的状态（a元素）
3. hover：鼠标移动上去悬停的状态
4. active：激活状态，鼠标按下状态（a元素）

如果要写这四个伪类选择器，则必须按照上面的顺序来写，否则可能出问题。

```css
a:hover {
  color: red
}
```

更多伪类选择器：

```css
/* 
选中第一个子元素。
使用范围非常广，所以一般来说会用li:first-child联用
*/
:first-child {
} 

/* 子元素中第一个特指的元素 */
:first-of-type {
}

/* 子元素中最后一个特指的元素 */
:last-of-type {
}

:nth-child {
}

:nth-of-type{
}

/* 聚焦样式，常用在文本框上 */
:forcus{
} 
```

### 伪元素选择器
```html
    <style>
        span::before {
            content: "《";
            color: #f40;
        }
        span::after {
            content: "》";
            color: #ff2
        }
    </style>
    <span>css权威指南</span>
<!-- 相当于<span><xxx>"《"</xxx>test<xxx>"》"</xxx></span> -->
```

伪元素选择器before相当于在选择的元素<span>后增加一个匿名元素，然后给这个元素添加样式。同理after是在</span>前增加样式。

伪元素选择器必须拥有 content 这个属性，同时默认这个构造出来的元素盒子是一个行盒。

更多的伪元素选择器：

```css
/*
选中元素中的第一个字母。
很多报纸杂志都采用这个方式，将第一段第一个字放大
*/
p::first-letter{
}

/* 选中第一行 */
p::first-line{
}

/* 选中用户框选的部分 */
p::selection {}
```

### 选择器的组合
组合（表并且关系）

```css
p.red {
}
/* p元素并且带class属性为red的
a[href="./test.html"]{
}
```

这种方式可以讲几个简单选择器进行组合，选择器组合时之间不能有空格



后代元素

```css
.abc .bcd {
}
/* 表示选中拥有类样式为.abc元素下的后代元素中拥有.bcd样式的元素 */
```



子元素

```css
h1>h2{
}
/* 只能选择子元素 */
```



相邻兄弟元素

```css
.special+li{
}
```

样式为species的元素的相邻兄弟元素



后面出现的所有兄弟元素

```css
.special~li{
}
```

总结

1. 并且（仅仅相连不带空格）
2. 后代元素：空格
3. 子元素：>
4. 相邻兄弟元素：+
5. 后面出现的所有兄弟元素：～



```css
h1, p, .specials~li {
}
/*相当于分开写*/
```

## 层叠、继承、优先级
首先明确一个原理：一个标签的属性（attribute）或者说样式必须要有值才会被渲染。但是 css 代码来说

 层叠、继承、优先级本质上是为了解决

### 层叠
相同选择器声明了相同的样式，那么位于后方的样式将会被采用

```css
h1 {
  color: red
}
/* 下面这个声明将被应用 */
h1 {
  color: blue
}
```

### 继承
子元素会继承父元素的某些样式声明，但并不是所有都会继承

通常字体相关的会继承例如font-size,color等。而边框宽度长度这些通常不会被继承。

### 权重计算（优先级）
css声明冲突时，会发生权重计算，然后最终得出由哪一条css规则进行渲染

css渲染优先级从高到底排列

1. 内联样式
2. `!import`
3. 权重计算
4. 权重相同下，看层级结构，越近权重越高（层级指的是 DOM 节点层级）
5. 权重、层级结构相同下，看css代码靠后的样式进行渲染

权重值：
* 行内样式：1000
* ID选择器：100
* 类选择器、属性选择器和伪类选择器：10
* 标签选择器、伪元素：1
* 通配符选择器：0

==实际上每一位的权重值的范围时0~255，并不是逢10进1。一般要记住选择范围越窄的选择器权重越高。==

```html
<style>
  #box .child {
    color: blue;
  }

  #box .left {
    color: purple;
  }
</style>

<div class="box-content" id="box-content">
  <div id="box">
    <div class="left">
      <div>
        <div class="child">我是被计算的div</div>
      </div>
    </div>
  </div>
</div>
```

最后文字渲染出来的效果是purple。因为child更靠近要被渲染的东西。

### 属性值的计算过程
浏览器是沿着DOM树一个一个元素进行渲染的。

渲染元素的前提条件：该元素的所有CSS属性必须全部有值

一个元素，从所有属性都没有值，到所有属性都有值，这个计算过程，叫做属性值计算过程。

计算过程：

1. 确定声明值
2. 层叠冲突
3. 使用继承
4. 使用默认值



两个特殊的取值

1. initial：使用默认值
2. inherit：继承祖父元素的属性值

## 盒模型
box：盒子，每个元素在页面中都会生成一个矩形区域（盒子）

盒子类型

1. 行盒，display属性为inline的元素
2. 块盒，display属性为block的元素

浏览器默认样式表设置的块盒：容器元素

浏览器默认样式表设置的行盒：文本元素，span，a，img，video，audio等

### 盒子的组成部分
display 属性无论是 inline 还是 block 的盒子都有下面几个部分组成，从内到外分别是

1. 内容（content）
2. 填充（padding）
3. 边框（border）
4. 外边距（margin）

![](/CSS.md/box.png)

上面四种定义的区域是完全相互独立的。

包含内部所有封闭区域的称呼如下：

1. 内容盒（content-box）
2. 填充盒（padding-box）
3. 边框盒（border-box）
4. 外边框盒（margin-box）

例如填充盒包含了 border 和 content 的区域。

> 为什么要在意这个这些名字呢？因为有些属性的值就是上面盒子的称呼，例如 box-sizing 这个属性是 content-box。 这个属性的含义是指定是 width 和 height 两个属性控制的是哪个盒子的宽高。
>



只有 border 可以设置颜色，而 padding 和 margin 是不可以设置颜色的，而 backgroud 设置的是 content 的背景色，color 设置的是字体的颜色。

#### 内容
width、height设置的是盒子内容（content）的宽高。

注意 `content`属性<font style="background-color:#FBDE28;">并不是</font>类似其他部分的那样用来设置内容盒的属性！

#### 填充
padding-left、padding-right、padding-top、padding-bottom属性

术语：填充盒 = padding + content

<u>注意：padding 是不能设置颜色的。</u>

#### 边框
border-width：边框宽度

border-style: solid/none/inset/outset等等，边框样式

border-color：边框颜色

上面都是简写属性

甚至可以用`border`将上面属性简写

```css
div {
  border: 4px dashed #f40;
}
```

术语：边框盒 = content + padding + border

#### 外边距
表示边框盒到其他盒子的距离

margin-left、margin-right、margin-top、margin-bottom属性

<u>注意：padding 是不能设置颜色的。</u>

### 块盒模型（display：block）
块盒特点：

1. 独占一行。
2. 当不设置内容宽高时，宽高会随着文字而增长。
3. 设置内容内容宽高时，可能会出现文字溢出现象。

```css
div.div0 {
    border: 5px solid red;
    font-style: italic;
    color: pink;
    height: 50px;
    width: 300px;
}
div.div1 {
    margin: 5px;
    border: 5px solid blue;
}
```

显示效果如下：

![](/CSS.md/font.png)

红色盒子设置了宽高，则发生了文字溢出，而蓝色盒子则没有。

并且可以观察到，红色盒子是独立成行的。



### 行盒模型（display: inline)
常见的行盒元素：span/strong/em/i/img/video/audio/a

行盒特点：

1. 盒子沿着内容延伸，行盒更注重内容，所以一般关于内容的东西都是行盒
2. 行盒无法设置宽高（即不能设置 height，width），只能通过字体大小、行高、字体类型间接设置
3. padding、border、margin水平方向有效，但垂直方向仅会影响背景，不会实际占据空间
4. 行盒在页面中不换行。

```css
/*div默认display是block，这里只是为了展示display其实是可以修改的*/
div {
    display: inline;
    border: 2px solid red;
    margin: 1px;
}
div.div1 {
    border-color: green;
}
```

显示效果如下：

![](/CSS.md/1.png)

显示效果就像是报纸排版（或者说 docs 编排文字）一样，下一个行盒元素将在末尾续接。所以可以很容易理解，这里设置宽高（width，height）是没有意义的。（因为 width 和 height 设置的是 content 本身）。



```css
/*div默认display是block，这里只是为了展示display其实是可以修改的*/
div {
    border: 3px solid red;
    display: inline;
    border-top: 1px;
    font-size: 40px;
}
div.div1 {
    font-size: 20px;
    margin-left: 5px;
    border-color: green;
    background: aquamarine;
}
```

显示效果如下：

![](/CSS.md/2.png)

可以看到，行盒一旦 content 水平位置确定后，/padding/border/margin 上下的设定不会影响文字的位置。

而左右可以。这种行为很类似于 docs 中字体的设置不影响行间距一样。

### 匿名行盒
对于 section 元素而言，`some text`部分应该被当作内容盒的部分，那么 `other text`应该怎么算？

所以，实际上的处理是`some text`文字部分自动加上了一个匿名行盒，这个行盒的样式不能直接去控制它，只能通过继承等方式得到样式。

```html
<section>
	some text
	<p>other text</p>
</section>
```

### 行块盒模型（display: inline-block）
经常用与做分页

空白折叠不仅仅发生在行盒内部，还发生在盒子之间（行块盒和行盒）

```html
<span>a</span>
<span>b</span>
```

例如上面这两个元素，因为换行写的两个元素，所以形成的盒子之间有一个空隙（并不是margin造成的）

### 可替换元素和非可替换元素
大部分元素，页面上显示的结果，取决于元素内容，称为非可替换元素

少部分元素，页面上显示的结果，取决于元素属性，称为可替换元素

可替换元素：

img/video/audeo

绝大部分可替换元素均为行盒。可替换元素类似于行块盒，盒模型中所有尺寸都有效

img的object-fit属性：设置图片的伸缩

###  弹性盒模型（display: flex）
极其方便的盒模型能够轻松提供各种居中方案，当有许多相同子项时，可以轻松解决元素排列问题。



## 视觉格式化模型（布局规则）
页面中的多个盒子的排列规则

大体上将页面中盒子的排列分为三种方式

1. 常规流
2. 浮动
3. 定位

### 常规流
常规流、文档流、普通文档流、常规文档流

所有元素，默认情况下，都属于常规流布局。



总体规则：块盒独占一行，行盒水平依次排列。（实际上就是上面所说到的行盒块盒的特性）

包含块（containing block）：每个盒子都有它的包含块，包含块决定了盒子的排列区域。绝大部分情况下：盒子的包含块为其父元素的内容盒。

常规流块盒若外边距无缝相邻，则进行外边距 margin 合并

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            div {
                margin: 10px;
                border: 3px solid red;
                height: 100px;
                width: 100px;
            }
        </style>
    </head>
    <body>
        <div></div>
        <div></div>
    </body>
</html>

```

![](/CSS.md/3.png)

上图的橙色部分就是外边距，可以看到，下面的 div 盒子的外边距 margin 直接接触到了上面的 div 的 border，并不是因为上面的 margin 消失了，而是两者在这部分上合并了。

**块盒**

1. **每个****<font style="background-color:#FBDE28;">块盒</font>****的****<u>总宽度</u>****，必须刚好****<font style="background-color:#FBDE28;">等于</font>****包含块的宽度（内容盒宽度）**

其中当设定块盒关于宽的相关长度时，如果还有剩余空间，默认将多余的长度分配给内容盒，或者margin（内容盒优先级高于margin）

若宽度、边框、内边距、外边距计算后，仍然有剩余空间，该剩余空间被margin-right全部吸收

在常规流中，块盒在其包含块中居中，可以定宽，然后左右margin设置为auto

2. 每个<font style="background-color:#FBDE28;">块盒</font>垂直方向上的auto值，则**<u>适应内容的高度</u>**。

上面的特点说明，常规流的总宽度总是会被计算好和包含块的内容盒一样宽。

### 浮动 float
设置元素的 float 属性，则称之为浮动布局。

浮动布局的适用场景：

1. 文字环绕
2. 盒子的横向排列



修改 float 的属性值为

1. left：左浮动，元素靠上靠左
2. right：有浮动，元素靠上靠右

```css
.div0 {
    border: 3px solid #f60;
    height: 300px;
    width: 300px;
    background: #f49;
}
.div1 {
    float: left;
    width: 50px;
    height: 50px;
    background: blueviolet;
}
.div2 {
    float: right;
    width: 50px;
    height: 50px;
    background-color: blue;
}
```

![](/CSS.md/4.png)

浮动盒子特点

1. 元素的 float 默认值为 none，一旦设置了 float 属性，那么其 display 属性一定会变成 block。
2. 浮动盒子的总宽度**<font style="background-color:#FBDE28;">不等于</font>**包含快的总宽度。说明可以自行设定。

排列特点：

1. float 设置为 left，盒子依次靠上靠左排列
2. float 设置为 right，盒子依次靠上靠右排列
3. 常规流盒子和浮动盒子为同级元素时，若常规流前，则浮动盒子会在下一行开始排列（因为块盒总占一行）
4. 常规流盒子和浮动盒子为同级元素时，若常规流后，则常规流盒子会无视浮动盒子。
5. 行盒排列时会避开浮动盒。

浮动盒的高度坍塌现象很好的体现了了浮动盒的排列规则，具体往下查看。

### 定位 position
一个元素设定了 position 属性，则可以手动控制元素在包含块的精准位置。

取值：

+ static：静态定位（不定位）
+ relative：相对定位
+ absolute：绝对定位
+ fixed：固定定位

一个元素只要 position 不是 static，则认为该元素为定位元素。

定位元素会脱离常规流（相对定位除外）

一个脱离了文档流的元素：

1. 文档流中的元素摆放时，会忽略脱离了文档流的元素
2. 文档流中元素计算自动高度时，会忽略脱离了文档流的元素

通常定位元素通过四个属性 `left`，`right`，`top`，`bottom`来控制元素的位置。一般来说同时设置`left`，`right`或者同时设置`top`，`bottom`都会从逻辑上产生矛盾，尽量避免。（居中方案才会用到）



absolute/fixed 元素一定是块盒

absolute/fixed 元素一定不是浮动盒



```html
<div class="div0">
  <div class="div1">
    <div class="div2">
    </div>
  </div>
</div>
```

#### relative 相对定位
常规流下该元素在什么位置那就是什么位置。通过设置`left`，`right`，`top`，`bottom`在原来的文档流位置上进行偏移。

```css
.div0 {
  border: 2px solid black;
  padding: 30px;
  width: 400px;
  height: 300px;
}
.div1 {
  border: 2px solid red;
  width: 300px;
  height: 200px;
}
.div2 {
  border: 2px solid green;
  width: 100px;
  height: 100px;
  position: relative;
  left: 10px;
  top: 10px;
}
```

![](/CSS.md/5.png)

如果不设置 `left` 和 `top`那么将会如下显示，这是遵照原来文档流的位置。

![](/CSS.md/6.png)

实际上相对定位对位置的控制不方便，它的用途更多是给绝对定位提供包含块。

#### absolute 绝对定位
1. 宽高为 auto，则适应内容（原来在什么位置就是什么位置）
2. 包含块变化：他的坐标（包含块）找祖先元素中的第一个定位元素，其元素的填充块就是包含块。若祖先元素中没有定位元素，则其包含块就是整个网页。

```css
.div0 {
  border: 2px solid black;
  padding: 30px;
  width: 400px;
  height: 300px;
  position: relative;
}
.div1 {
  border: 2px solid red;
  width: 300px;
  height: 200px;
}
.div2 {
  border: 2px solid green;
  width: 100px;
  height: 100px;
  position: absolute;
  left: 0;
  top: 0;
}
```

![](/CSS.md/7.png)

如上图显示，其参考系是以包含块为准的。

#### fixed 固定定位
固定定位的元素的包含块是视口（可视窗口）即和其他元素无关，只和看得到的可视窗口有关（这就是很多右下角的小广告的实现原理，无论如何改变浏览器窗口大小，他都会出现在屏幕上）

```css
.div0 {
  border: 2px solid black;
  padding: 30px;
  width: 400px;
  height: 300px;
  position: relative;
}
.div1 {
  border: 2px solid red;
  width: 300px;
  height: 200px;
}
.div2 {
  border: 2px solid green;
  width: 100px;
  height: 100px;
  position: fixed;
  right: 0;
  bottom: 0;
}
```

![](/CSS.md/8.png)

#### 绝对定位和固定定位下的居中方案
让上下左右都设置为 0，并让 margin 为 auto，则定位元素位于包含块的中央。

```css
.div0 {
  border: 2px solid black;
  padding: 30px;
  width: 400px;
  height: 300px;
  position: relative;
}
.div1 {
  border: 2px solid red;
  width: 300px;
  height: 200px;
}
.div2 {
  border: 2px solid green;
  width: 100px;
  height: 100px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
}
```

![](/CSS.md/9.png)

#### 堆叠上下文
当多个定位元素重叠时，

## 块级格式化上下文（BFC）
 它是一块独立的渲染区域，它规定了在该区域中，常规流块盒的布局。

+ 常规流块盒在水平方向上，必须撑满包含块
+ 常规流块盒在包含块的垂直方向上依次排列
+ 常规流块盒若外边距 margin 无缝相邻，则进行外边距合并
+ 常规流块盒的自动高度和摆放位置，无视 float 元素



BFC 渲染区域：这个区域由某个 HTML 元素创建，以下元素会在其内部创建 BFC 区域。

+ 根元素`<html>`
+ 浮动和绝对定位元素
+ overflow 不等于 visible 的块盒



BFC 特性：

不同的 BFC 区域，他们进行渲染时互不干扰，内部和外部元素的布局（例如定位和尺寸）相互隔绝。也就是说，其子元素必然在其创建的 BFC 区域内呈现，同时祖父元素和兄弟元素不可能在该 BFC 中出现。

这个特性可以用来解决高度坍塌问题

## flex 布局
在一个元素上开启 `display: flex`，那么其子元素就会按照 flex 的设计进行布局。

换言之，flex 的布局相对应的 css 是写在父元素上的，这和浮动、定位不同，float 是直接写在要控制排列的元素上。而 flex 相当于设计一个底盘，子元素要按照这个地盘的排列规则去排列。这样的子元素称之为弹性项目，而这个父元素称之为弹性盒。

![](/CSS.md/10.png)

flex 盒子描绘的是一种一维盒子。有两个概念非常重要

1. 主轴：默认是从左到右。
2. 交叉轴：与主轴垂直的轴，因为 flex 一维盒子，所以交叉轴的设置很少，主要依赖于主轴的设置而变化。

```css
.box {
  display: flex;
  flex-direction: row;
  justify-content: start;
  flex-wrap: nowrap;
}
```



![](/CSS.md/11.png)

### flex-direction
设置主轴方向。

+ row（默认，从左到右）
+ column（从上到下）
+ row-reverse（从右到左）
+ column-reverse（从下到上）

### justify-content
设置在一行当中的弹性项目的布局。

默认的布局是：弹性项目之间紧贴，然后从 start 开始。

可以将设置分为这几类。

从起点位置分类

+ start
+ center
+ end

从剩余空间分类

（从一行的行为解释）

+ space-arround（弹性项目左右两边的间隔空间相等）
+ space-between（左右两边的弹性项目紧贴两边，其余间隔空间相等）
+ space-evenly（所有的间隔空间相等）

从基准线分类

+ baseline（所谓基准线，指的就是文字的下划线，这个选项就是指基准线对齐，让文字在同一线上）

### flex-wrap
是否换行

+ nowrap（如果不换行，则强制改变所有弹性项目的长宽，使其放在一行内）
+ wrap（换行）
+ wrap-reverse（从下到上开始排列，向上换行）

### align-item
指定交叉轴方向，元素之间的对其方式

具体含义就是指一行位于整个交叉轴方向的位置

+ start
+ center
+ end
+ baseline

### align-content
指定交叉轴方向上，多行之间的对齐方式

怎么理解呢，它的作用相当于主轴上的 `justify-content`

+ start
+ end
+ center
+ space-arround
+ space-between
+ space-evenly





## 盒模型应用
盒模型和文字内容总是会发生各种各样的问题，下面是常见的问题。

### 文字溢出
代替文字溢出部分，用什么显示。

 ellipsis：用三个.代替

```css
li {
    border-bottom: 1px dashed #ccc;
    line-height: 2;
    border-left: 3px solid #008c8c;
    padding-left: 10px;
    margin: 1em 0;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

使用white-space、overflow、text-overflow来处理溢出问题

### 浮动盒高度坍塌
外部的盒子设置高度设置为 auto 时，包含块的高度不会考虑内部的浮动盒子的高度。于是就有高度坍塌的现象。

```html
<div class="container">
  <div class="block"></div><!-- 块盒 -->
  <div class="float"></div><!-- 浮动盒 -->
</div>
```

```css
.container {
  width: 500px;
  height: auto;
  background: #f80;
  border: 3px solid red;
}
.float {
  width: 100px;
  height: 100px;
  background: blue;
  float: left;
}
.block {
  width: 200px;
  height: 70px;
  background-color: yellow;
}
```

显示效果如下：

![](/CSS.md/12.png)

现象解释：

> 包含块的高度为 auto，那么他将会根据内容的高度而定（忽略内部的浮动盒），所以第一个 div 的高度根据第二个 div 高度一样。为什么第三个 div 位于下方呢，因为块盒独占一行。
>

如果交换块盒和浮动盒的顺序，会出现另一种高度坍塌的现象。

```html
<div class="container">
  <div class="float"></div><!-- 浮动盒 -->
  <div class="block"></div><!-- 块盒 -->
</div>
<!-- CSS代码不变 -->
```

![](/CSS.md/13.png)

现象解释：

> 这是因为浏览器进行计算时，会自动忽略前面浮动盒的位置。而包含块的高度时 auto，同样是忽略浮动盒，而只根据块盒的高度而设定。
>

---

**<u>解决方案 1：</u>**<u>在所有浮动盒最下方插入要给块盒，采用 clear 属性清除浮动。</u>

```html
<div class="container">
  <div class="float"></div><!-- 浮动盒 -->
  <div class="block"></div><!-- 块盒 -->
  <div style="clear: both"></div>
</div>
```

显示效果如下：

![](/CSS.md/14.png)

container 盒的最后一个元素下插入一个带有 clear 属性的块级元素，让其必须考虑前面所有的浮动盒的位置，同时不设置宽高。

**<u>解决方案 2：</u>**<u>使用伪元素选择器</u>`<u>::after</u>`<u>，结合 clear 属性清除浮动。</u>

```css
div {
  margin: 0px;
}
.container {
  width: 500px;
  height: auto;
  background: #f80;
  border: 3px solid red;
}
.float {
  width: 100px;
  height: 100px;
  background: blue;
  float: left;
}
.block {
  width: 200px;
  height: 70px;
  background-color: yellow;
}
.clear::after {
  content: "";
  display: block;
  clear: both;
}
```

```html
<div class="container clear">
  <div class="float"></div><!-- 浮动盒 -->
  <div class="block"></div><!-- 块盒 -->
</div>
```

显示效果如下：

![](/CSS.md/15.png)

原理是一样的，就是在所有浮动盒之后加入一个块盒，该块盒使用 clear 清除浮动。

**解决方案 3：使用 overflow 属性创建 BFC 区域。**

BFC 区域内计算高度必须考虑浮动元素。当设置元素 overflow 不为 visible 时就会创建 BFC 区域。

```css
.container {
  width: 500px;
  height: auto;
  background: #f80;
  border: 3px solid red;
  /* 在此处增加了overflow属性 */
  overflow: hidden;
}
.float {
  width: 100px;
  height: 100px;
  background: blue;
  float: left;
}
.block {
  width: 200px;
  height: 70px;
  background-color: yellow;
}
```

![](/CSS.md/16.png)

这样的方式是有副作用的，例如如果在 container 元素内就是要显示溢出，就要考虑这个 overflow 继承的问题，处理起来还不如上面伪类选择器方便。

## 其他
### 背景图
背景图是 CSS 的概念

img 元素是 html 相关的概念。

通常来说，如果图片网页内容，那么就采用 img 元素，否则使用背景图相关属性。

相关属性：

+ `background-image`：设置元素背景
+ `background-repeat`：控制是否密铺（可选 x 或 y 方向是否密铺）
+ `background-size`：控制背景图尺寸
+ `background-position`：设置背景图的位置
+ `background-attachment`：设定背景图是否固定（fixed）（类似于固定定位元素的效果）

```css
body {
  background-image: url("../resource/test.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: -11px, -12px;
}
```

### 雪碧图
有时候一个网页内有非常多的 icon 图标，多个文件可能会导致渲染效率低下的问题。一种常见的做法就是将多个 icon 图标都放到一个图片内，结合 `backgroud-position`，`width`，`height`属性，调整一个图片文件内的一个 icon 图标到元素的左上角，再将元素宽高缩小，达到只有一个 icon 的效果。



## 常见样式声明
### 文字相关
#### color
表示元素内部的文字颜色

##### 预设值法
red, blue, ...等，通常这个方法仅作测试用

##### rgb函数法/rgba 函数法
光学三原色rgb --> red, green, blue

rgb函数每个参数的取值范围为0~255

```css
.class {
  color: rgb(52, 255, 90)
}
```

rgba 函数就是在 rba 函数基础上加上一个透明度设置，取值范围为`(0, 1)`。



##### HEX表示法
使用#000000，表示rgb，每两位分别表示red,green,blue

当两位的数字相同时，可以简写为一位，例如淘宝红

#ff4400 --> # f40

常见几个颜色

```css
#f40 淘宝红
#000 黑色
#fff 白色
#f00 红色
#0f0 绿色
#00f 蓝色
#f0f 紫色
#0ff 青色
#008c8c 马尔斯绿
```

#### font-size
表示元素内部文字的尺寸大小

每个元素都必须要有字体大小，如果没有，则直接使用父元素的字体大小，没有父元素则使用基准字号。

px：像素，绝对单位，可以简单理解为文字的高度占多少个像素

em：父元素font-size的倍数大小

> user agent stylesheet, 浏览器默认样式
>

#### font-weight
表示文字的粗细程度

预设值

1. bold，加粗
2. normal，预设值

#### font-family
表示文字的字体类型，必须是用户计算机存在的字体

所以在书写字体的时候设置多个字体，只需要填值的时候多添几个就可以

```css
.class {
  font-family: consolas, 宋体, sans-serif;
}
```

sans-serif表示的意思是，如果前面的字体都没有则使用用户自己电脑上的字体

#### font-style
表示字体风格

预设值

1. italic斜体
2. normal正常

#### text-decoration
表示文本修饰，给文本加线

预设值

1. underline下划线
2. line-through删除线

#### text-indent
表示首行文本缩进

#### line-height
表示每行文本的高度，该值越大，每行文本的距离越大

设置行高为容器的高度，可以让单行文本垂直居中

行高可以设置为纯数字，表示相对于当前元素的字体大小

#### letter-spacing
表示字体之间的间隙

#### text-align
表示元素内部文字的水平排列方式

right/left等

常用的是 center 这个值，表示居中。

#### word-break
断词规则，影响文字在什么位置被截断换行

normal：CJK字符（文字位置截断），非CJK字符（单词位置截断）

break-all：所有字符文字处截断

keep-all：所有字符单词处截断

#### white-space
空白字符处理，例如将多个连续空白字符当作一个来处理

nowrap属性

### 盒子相关
#### background
表示背景色，background-color也可以

#### height
内容区域的高度，也是文字的高度，注意这个设置和box-sizing的设置有关

#### width
内容区域的宽度，也是文字的宽度，注意这个设置和box-sizing的设置有关

#### margin
盒模型的外边距，具体属性有

+ `margin-top`
+ `margin-right`
+ `margin-bottom`
+ `margin-left`



#### padding
+ `padding-top`
+ `padding-right`
+ `padding-bottom`
+ `padding-left`

#### border
+ `border-top`
+ `border-right`
+ `border-bottom`
+ `border-left`

#### box-sizing
设置height和width的默认盒子，默认为是content-box

#### background-clip
设置背景色的范围，默认为border-box

#### clear
清除浮动，因为同级的元素排列时，元素会自动忽略浮动盒的位置而进行排列。使用该属性则必须考虑浮动盒的位置。

三种取值

+ left：清除左浮动，该元素不能忽略前面左浮动盒的位置，必须在前面所有左浮动盒的下方
+ right：清除右浮动，该元素不能忽略前面右浮动盒的位置，必须在前面所有右浮动盒的下方
+ both：结合上面两种做法

### 溢出相关
#### overflow
控制内容超出边框盒时的显示效果，默认visible

visible：可见

scroll：生成滚动条

hidden：隐藏

#### overflow-y, overflow-x
显示行或者竖的滚动条

#### text-overflow
代替文字溢出部分，用什么显示

 ellipsis：用三个.代替

```css
li {
    border-bottom: 1px dashed #ccc;
    line-height: 2;
    border-left: 3px solid #008c8c;
    padding-left: 10px;
    margin: 1em 0;
    width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

使用white-space、overflow、text-overflow来处理溢出问题

### 其他
#### content
并不是内容盒的意思，这个属性通常在伪元素选择器中使用，充当伪元素的内容。

```html
    <style>
        span::before {
            content: "《";
            color: #f40;
        }
        span::after {
            content: "》";
            color: #ff2
        }
    </style>
    <span>css权威指南</span>
<!-- 相当于<span><xxx>"《"</xxx>test<xxx>"》"</xxx></span> -->
```

#### z-index
定位元素中生效。z-index 值越高则越在前面。

#### opacity
 透明度，取值范围为`(0, 1)`。可以设置整个元素透明（包括其孙子元素）。

更常用的方法是颜色位置设置 alpha 通道（即 rgba 函数）

#### cursor
控制鼠标的样式。可以使用 url 函数来指定鼠标显示的样式

```css
div {
  width: 300px;
  height: 300px;
  cursor: url("imgs.target.ico"), auto
  /*后面的auto的含义是指前面url不生效时，值为auto*/
}
/* 表示这个鼠标放在这个元素上时，图标变成指定的ico文件 */
```

#### visibility
控制盒子是否可见

取值 `hidden`，`visble`。

QQ 的闪烁通常用这个来实现。

## 语法糖
某些属性可以合并简写，将多个属性一起写

```css
.box {
  /* 表示 上-右-下-左，（即从上开始按顺时针设置） */
  padding: 10px 9px 8px 7px;
  /* 表示 上下-左右 */
  margin: 10px 5px;
  /* 表示 线条宽度、类型、颜色 */
  border: 2px solid rgb(168, 218, 168);
}


.background {
  /* 表示 图片位置，排列方式，位置，尺寸，颜色 */
  background: url("../resource/test.jpg") no-repeat 50% 50%/100% fixed #000;
}
/*
位置和尺寸必须要用'/'进行分隔
*/
```





