---
title: TypeScript中的类型
createTime: 2025/02/10 19:09:38
permalink: /article/5uxx4vcu/
tags:
  - 前端
  - TS
---
[TypeScript JSDoc 应用及其局限性](https://zhuanlan.zhihu.com/p/670568566)

[TypeScript 教程](https://wangdoc.com/typescript/)



TS可以看作是JS的超集，所以理论上所有的JS都能通过TS编译器。

TS是在JS语法基础上增加了类型系统，使用tsc进行编译时，只要给出了足够信息进行类型推论，那么不一定要写全类型。例如

```typescript
function add(a: number, b: number){//能推论出返回值为number，那么可以不显式写明返回值类型
  return a + b;
}
```

TS的类型推论的行为如果靠死记可能会非常困难，但实际上从集合论的角度来进行记忆，将会带来很多方便。

```plain
number\boolean\string\undefined\null\symbol
单元集合

unknown
非空的非单元集合

any
某个单元集合

never
空集

object
特殊的集合，其中包含单元集合，但是与单元集合又不是包含关系，表示字面量对象、数组、函数。

Object或者{}
除undefined和null的集合，包含的范围很广，也包含object。更特别的是，它可以用{}来表示。
```

+ 子集可以给自己的超集赋值。
+ undefined和null可以给其他单元集合赋值。

当然，上面的集合论说法并不是非常官方的说法，TS专门为此定义了专门的术语，称之为父类型、字类型（subtype）。





## 类型
+ number
+ boolean
+ string
+ undefined
+ null
+ symbol
+ unknown//顶层类型
+ any//顶层类型
+ never//底层类型
+ bigint
+ object//复合类型

还有一些内置的包装对象类型

+ Number
+ Boolean
+ String
+ Symbol
+ Bigint

```typescript
const s1: String = "hello"; // 正确
const s2: String = new String("hello"); // 正确

const s3: string = "hello"; // 正确
const s4: string = new String("hello"); // 报错
```

还有一个特殊的类型

+ Object或者`{}`

他是广义对象，除了`null`和`undefined`不能赋给它之外，其他所有类型的值都可以赋值给Object类型。记住`{}`表示的是广义对象，而不是侠义对象object。



从集合论的角度来理解顶层和底层，底层相当于空集，是所有的集合的子集。

而any相当于全集，unknown是并不是全集。从这个角度可以理解下面他们各自的行为。

### any
其中any会关闭类型检查，导致污染问题：改变了其他变量的类型，但是不报错。

```typescript
let x: any = "hello";
let y: number;

y = x; // y变成了string类型，不报错

y * 123; // 不报错
y.toFixed(); // 不报错
```

### unknown
所以TS3.0之后增加了unknown类型，防止污染问题。

unknown类型的变量所<u>不能做的事：</u>

1. 不能直接赋值给其他变量
2. 不能调用其属性和方法
3. 不能当作函数对象调用
4. 不能使用某些运算符（例如:`+`）

只有进行<u>缩小类型范围</u>后，才可以进行上面的行为：

```typescript
let a: unknown = 1;
const b: number = a;//报错
if(typeof a === number) const c :number = a;//不报错
```

利用`typeof`，`instanceof`结合`if`等判断语句进行缩小类型范围方可。

### never
never赋值给其他任何变量都不会报错。

```typescript
function fn(x: string | number) {
  if (typeof x === "string") {
    // ...
  } else if (typeof x === "number") {
    // ...
  } else {
    x; // never 类型
  }
}
```

### Object和object
```typescript
const o1: Object = { foo: 0 };
const o2: object = { foo: 0 };

o1.toString(); // 正确
o1.foo; // 报错

o2.toString(); // 正确
o2.foo; // 报错
```

### 值类型
```typescript
let a: 5;//需要明确的是，这只是声明类型，并没有进行赋值。
a = 4;//报错
```

可以直接将变量的类型声明为某个基本类型的具体值，这会被认为该类型的子类型。例如上面所见的4是number类型下具体的字类型，而a为5，是number类型下的子类型，这两个字类型并不相同。

### 联合类型
```typescript
let a: string | number | symbol;
```

相当于将类型的范围进行扩大，增大集合。

### 交叉类型
交叉类型的语义是将两个类型作交集。当`&`应用到基础类型时，会得出一些诡异的效果。如下

```typescript
let x: string & number;//推论出x为never
let y: {y1: number} & boolean;//不知道是什么
```

一个类型不可能同时是两个类型。所以上面这种写法合法，但是几乎没有任何意义。

所以交叉类型应用到对象上时有新的功能。

```typescript
type A = {a: number};
type B = {b: string};
type C = A & B;
//相当于{a: number, b: string}
```

交叉类型可以用来添加属性。

### type
type的意义就是给类型取别名。注意类型不是变量，所以：

```typescript
type A = number;
type A = string//报错
```

这是错误的，A已经定义过了，他不是变量，并不能再给他改变。

但是，type的声明具有作用范围，属于块，所以可以这样：

```typescript
type A = number;
if(a){
  type A = string;//合法
}
```

别名还支持值类型

```typescript
type World = "world";
type Greeting = `hello ${World}`;
```

但是说到底还是属于类型的声明，所以转换成JS时会全都删掉。

### typeof
TS中非常重要的运算符。

对于JS，使用typeof运算之后返回的是一个值，该值的类型为字符串，并且只有八种情况

+ undefined
+ boolean
+ number
+ string
+ object
+ function
+ symbol
+ bigint

而再TS中typeof扩展其功能，typeof作用在变量之后，可以返回一个类型。例如：

```typescript
const a = { x: 0 };

type T0 = typeof a;   // { x: number }
type T1 = typeof a.x; // number
const T3 = typeof a;  // 'object'
```

注意，`T0`和`T1`只是类型，所以typeof作用在变量后返回了类型，类型是不能参与运算的，所以：

```typescript
type a = typeof Date();//报错
```

`type`明显是在定义一个类型，而这里却要求先调用Date函数在取其类型，这是不可能的，因为TS编译过程仅仅只是作类型推论和检查，不会进行计算。

从另一个角度而言，编译过程会将所有类型相关的信息都删掉，上面这种做法就不可能做到。

### 数组和元组
JS中只有数组概念，而TS中有元组的概念，并且其写法与数组完全一致，所以如果不系统学习，这是非常容易混淆的。

以下说明两者的根本特征：

1. 数组成员类型必须一致，但是成员个数不确定
2. 元组成员类型不确定，每个成员类型需要特别指明

从符号语法上来说，类型在`[]`外的是数组，在`[]`内的是元组。

```typescript
type A = number[];//数组
type B = [number];//元组
```



数组和元组的类型推断：

当定时数组时为空时，TS会为其进行类型推断，而不报错。

```typescript
let a = [];//推断为any[]
a.push('one');//推断为string[]
a.push(1);//不报错，推断为(number|string)[]
```

但是如果定义变量是给定了初值，那么就会固定了该数组类型。

```typescript
let a = [1];//推断为number[]
a.push('one');//报错，不能将string赋值给number
```

由于JS中只有数组概念，并且TS中数组和元素表达形式一致，所以TS对一切可能数组的推断都会认为是数组，而不是元素，例如：

```typescript
let a = [1, 'one'];//推断为(number|string)[]，而不是[number, string]
```

所以，元组必须只能是显示声明类型。



`readonly`修饰符

由于JS可以对数组进行修改，所以TS增加一个readonly，但是该关键字只能用来修饰数组和元组。

### 函数
函数声明有三种方式，通常返回值的类型可以不写，因为TS可以推断出来。

```typescript
const A: (a: number, b: string) => void = function(a,b){
  console.log(a+b);
}

const B = function(a: number, b: string): void{
	console.log(a+b);
}

let A: {
    (a: number, b: string): number
}
A = (a: number, b: string): number => 1;//对象形式，用得很少。
```

第三种方式一般是当函数对象本身有属性，而且在代码中调用了该属性，这种声明方法就挺适合的。

## 函数重载
函数重载的写法

```typescript
function add(a: string , b: string): void;
function add(a: number, b: number): number;
function add(a: unknown, b: unknown): unknown{
  //具体实现
}
```

具体实现必须能够兼容上面重载信息的内容，也即必须是父类型。

重载的类型声明必须要在具体实现上，并且中间不能有其他代码，这个时候可以看出`any`和`unknown`的优势了。如果描述起来比较简短，仍然不推荐使用这两个类型。
