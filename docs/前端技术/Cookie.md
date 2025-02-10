---
title: Cookie
createTime: 2025/02/10 19:00:28
permalink: /article/0ii2gjs4/
tags: 
  - 前端
---
## Cookie
HTTP 协议是无状态的，也就是一个请求对应一个响应。所以对于服务端而言，每次请求都是独立的，请求之间没有任何关联。这种特性就非常不利于个人用户体验。因为对于页面上某些用户偏好（例如语言、主题、定制化内容、身份认证），并不需要每次发送请求都携带这些信息。cookie 可以临时存储这些数据。<u>一个 cookie 从数据上来说就是</u>**<u>一个附带重要属性的键值对。</u>**



和`LocalStorage`、`SessionStorage`的区别：

+ Cookie 适合小型数据存储和与服务器交互的场景。
+ LocalStorage 适合持久化存储较大数据。
+ SessionStorage 适合临时存储会话数据。

选择哪种存储方式取决于具体的应用场景和需求。



响应头设置：

```http
set-cookie: token=123456; path=/; max-age=3600; httponly
# 处理第一个key=value，其他设置可选，且顺序不定
```

浏览器接收到响应头的一个 set-cookie，则会创建一个 Cookie。

```plain
key: token
value: 123456
domain: yuanjin.tech # 域名
path: / # 基路径
expire: 2020-04-17 18:55:00 # 设置该cookie的过期时间
secure: false  # 任何请求都可以附带这个cookie，只要满足其他要求
httponly: true # 不允许JS获取该cookie
signed: true # 设置是否为签名cookie（可以验证cookie是否被篡改）
```

浏览器对 cookie 的行为：

1. 浏览器将 **key/path/domain** 一样的 cookie 视为相同的 cookie，其余都是附带信息。每次服务端发来相同的 cookie，都会用新的附带信息覆盖旧的附带信息。
2. 只要 cookie 符合要求（domain/path/expire 等），则浏览器的每次请求都会自动附带在请求头上 `cookie: token=123; ...`
3. cookie 记录的时间过期了，就会浏览器就会自动删除 cookie。针对这一点，服务器想要删除浏览器的 cookie，只需要设置一个过期的 cookie 即可。



注意：Cookie 本身只是一个响应头或者请求头的一项键值对，而浏览器对 Cookie 有比较完善的机制进行处理，其他终端软件并不一定有，所以通常还会在	头部加上 `authorization: value`一项进行认证。



## 和`LocalStorage`、`SessionStorage`的区别
---

**生命周期**

+ **Cookie**：
    - 可以设置过期时间（通过 `Expires` 或 `Max-Age` 属性）。
    - 如果没有设置过期时间，则为会话 Cookie，浏览器关闭后失效。
+ **LocalStorage**：
    - 永久存储，除非手动清除（通过代码或浏览器设置）。
+ **SessionStorage**：
    - 仅在当前会话有效，关闭浏览器标签页或窗口后数据会被清除。

---

**存储大小**

+ **Cookie**：
    - 每个 Cookie 最大 4KB，每个域名下的 Cookie 总数有限制（通常为 20-50 个，具体取决于浏览器）。
+ **LocalStorage**：
    - 通常为 5MB 或更多（取决于浏览器）。
+ **SessionStorage**：
    - 通常为 5MB 或更多（与 LocalStorage 类似）。

---

**数据访问范围**

+ **Cookie**：
    - 可以设置作用域（通过 `Domain` 和 `Path` 属性），允许跨子域名访问。
    - 会自动随请求发送到服务器（通过 HTTP 请求头）。
+ **LocalStorage**：
    - 仅限于当前域名，不能跨域名访问。
    - 不会自动发送到服务器。
+ **SessionStorage**：
    - 仅限于当前标签页或窗口，即使是同一域名下的不同标签页也无法共享。
    - 不会自动发送到服务器。

---

**与服务器的交互**

+ **Cookie**：
    - 每次 HTTP 请求都会自动携带（通过 `Cookie` 请求头），除非设置了 `HttpOnly` 或 `Secure` 属性。
+ **LocalStorage** 和 **SessionStorage**：
    - 数据仅存储在浏览器端，不会自动发送到服务器。
    - 需要前端代码显式地将数据添加到请求中（如通过 AJAX 或 Fetch API）。

---

**安全性**

+ **Cookie**：
    - 可以通过设置 `HttpOnly` 属性防止 JavaScript 访问，增强安全性。
    - 可以通过 `Secure` 属性限制仅通过 HTTPS 传输。
    - 容易受到 CSRF（跨站请求伪造）攻击，需配合 `SameSite` 属性使用。
+ **LocalStorage** 和 **SessionStorage**：
    - 数据可以通过 JavaScript 访问，容易受到 XSS（跨站脚本攻击）的影响。
    - 没有内置的安全机制，需开发者自行处理敏感数据。

---

**总结**

+ Cookie 适合小型数据存储和与服务器交互的场景。
+ LocalStorage 适合持久化存储较大数据。
+ SessionStorage 适合临时存储会话数据。
+ 选择哪种存储方式取决于具体的应用场景和需求。

## Token
Token 是一种用于身份验证和授权的凭证，通常由服务器生成并返回给客户端。通常在 cookie 中设置。

主要场景：

1. **身份认证。**用户登录后由服务端发送 Token，后续客户端发送请求携带该 Token，由服务端进行鉴别，常见身份认证包括 JWT（Json Web Token）
2. **授权。**Token 可以包含用户的权限信息，服务器根据 Token 决定用户是否有权访问特定资源。
