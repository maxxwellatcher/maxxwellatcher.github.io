import{_ as i,c as e,a,o as t}from"./app-qO4zmEUw.js";const n={};function l(d,s){return t(),e("div",null,s[0]||(s[0]=[a(`<p>通常可以通过一下方式进行性能分析:</p><ol><li>直接使用node进行性能分析</li><li>使用jest进行性能分析</li><li>console.time/console.timeEnd</li></ol><h2 id="node" tabindex="-1"><a class="header-anchor" href="#node"><span>node</span></a></h2><p>node已经内置了profiling工具, 这里要补充一个点就是</p><ol><li>使用 <code>--prof</code>选项运行node执行程序, 会生成 <code>isolate-0xXXX-v8.log</code>的文件</li><li>安装 <code>v8-log-converter</code>：</li></ol><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>npm install -g v8-log-converter</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ol start="3"><li>转换文件, 转换后的文件可以通过浏览器的devtool进行分析</li></ol><div class="language-plain line-numbers-mode" data-ext="plain" data-title="plain"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span>v8-log-converter isolate-0xXXX-v8.log &gt; v8.json</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><ol start="4"><li>也可以通过 <code>tick-processor</code>进行查看</li></ol><div class="language-sh line-numbers-mode" data-ext="sh" data-title="sh"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">npm</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> install</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -g</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> tick-processor</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">tick-processor</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> isolate-0xnnnnnnnnnnnn-v8.log</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> &gt;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> processed.txt</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><ol start="5"><li>使用node自带的解析工具也可以</li></ol><div class="language-sh line-numbers-mode" data-ext="sh" data-title="sh"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">node</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> --prof-process</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> isolate-0xnnnnnnnnnnnn-v8.log</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> &gt;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> processed.txt</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># 下面这条命令也能work</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">node</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> --prof-process</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> isolate-</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;">*</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676;"> &gt;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> processed.txt</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果发生 <code>stdout is not a tty</code>的报错, 使用 <code>node.exe</code>进行即可. 看到是在 <code>git bash</code>以及 <code>msys bash</code>都会出问题, powershell没有.</p><h2 id="jest" tabindex="-1"><a class="header-anchor" href="#jest"><span>jest</span></a></h2><p>在jest内置 <code>v8-profiler-next</code>结合测试用例进行分析</p><h2 id="v8-profiler-next" tabindex="-1"><a class="header-anchor" href="#v8-profiler-next"><span>v8-profiler-next</span></a></h2><p>在安装 <code>v8-profiler-next</code>的过程中会出现安装问题, 需要补充</p><div class="language-sh line-numbers-mode" data-ext="sh" data-title="sh"><button class="copy" title="复制代码" data-copied="已复制"></button><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">npm</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> config</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> set</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> strict-ssl</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;"> false</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">yarn</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> config</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> set</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> strict-ssl</span><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375;"> false</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p>在安装完后能够看到 <code>node_modules/v8-profiler-next/build</code>目录, 表明 <code>v8-profiler-next</code>安装正确.</p>`,19)]))}const o=i(n,[["render",l],["__file","index.html.vue"]]),p=JSON.parse('{"path":"/article/8geriui4/","title":"JS、TS仓的性能评估工具","lang":"zh-CN","frontmatter":{"title":"JS、TS仓的性能评估工具","createTime":"2025/02/10 19:27:42","permalink":"/article/8geriui4/","tags":["前端","nodejs"]},"headers":[],"readingTime":{"minutes":1.09,"words":327},"git":{"updatedTime":1739189588000,"contributors":[{"name":"maxxwellatcher","username":"maxxwellatcher","email":"916284547@qq.com","commits":1,"avatar":"https://avatars.githubusercontent.com/maxxwellatcher?v=4","url":"https://github.com/maxxwellatcher"}]},"filePathRelative":"前端技术/JS、TS仓的性能评估方案.md","categoryList":[{"id":"40d75c","sort":10001,"name":"前端技术"}]}');export{o as comp,p as data};
