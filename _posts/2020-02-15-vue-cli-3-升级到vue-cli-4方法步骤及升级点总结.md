---
layout:     post
title:      vue cli 3 升级到 vue cli 4 方法步骤及升级点汇总
subtitle:   vue cli 4 官方已经更新有一段时间了，看了官方文档大概有二十几点的更新，还是干货满满呀，值得升级一下，下面是升级步骤。
date:       2020-02-15
author:     Joey
header-img: img/post-bg-timg.jpeg
catalog: true
tags:
    - Web
    - Vue
    - JavaScript
    - 前端
---


## 介绍

vue cli 4 官方已经更新有一段时间了，看了官方文档大概有二十几点的更新，还是干货满满呀，值得升级一下，下面是升级步骤。


## 步骤

1. 首先，在全局安装最新的 Vue CLI：

```
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

检查安装的版本

```
vue -V  # 输出:@vue/cli 4.x.x  说明@vue/cli 4安装成功( vue cli 3的版本会输出 3.x.x )
```

踩坑记录

`npm install -g @vue/cli` 执行成功，但是执行 `vue -V` 输出的还是`3.5.6`(我以前安装的版本)，于是又重新执行 `npm install -g @vue/cli`，显示成功，执行 `vue -V` 输出的还是`3.5.6`，重启电脑，再执行`vue -V `输出 `@vue/cli 4.0.5`，解决 。

2. 在项目根目录下执行

```
vue upgrade
```

然后出现

![](https://img-blog.csdnimg.cn/20191026184414364.png)

提示 继续升级这些插件吗？ 输入 `Y` 即可.

3. 等步骤二 执行完会发现主要有 2 个文件被修改

- 文件 babel.config.js

主要是 babel 的预设由@vue/app 改成了@vue/cli-plugin-babel/preset

原来的

```
module.exports = {
  presets: [
    '@vue/app', //  这行
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry'
      }
    ]
  ]
}
```

升级后的

```
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset', //  这行
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry'
      }
    ]
  ]
}
```

- 文件 package.json （package-lock.json 也会更改）
主要是依赖升级
原来的

```
{
  "@vue/cli-plugin-babel": "^3.11.0",
  "@vue/cli-plugin-eslint": "^3.11.0",
  "@vue/cli-service": "^3.11.0"
}
```

```
{
  "@vue/cli-plugin-babel": "^4.0.5",
  "@vue/cli-plugin-eslint": "^4.0.5",
  "@vue/cli-service": "^4.0.5"
}
```

4. 然后启动项目

```
npm run serve
```

然后报下面的错

![](https://img-blog.csdnimg.cn/20191026184353496.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM5OTUzNTM3,size_16,color_FFFFFF,t_70)

- 第一个错（警告）

```
WARN  A new version of sass-loader is available. Please upgrade for best experience.
```

这行是 `vue cli 4` 升级了自己的依赖 `sass-loader` 导致的

它把 `sass-loader`由 `^7.x.x` 的版本升级到了 `^8.0.0`,而我项目中使用的是`^7.1.0`

所以升级一下自己项目的 `sass-loader` 就好了

执行下面命令即可

```
npm i sass-loader@8.0.0 -D
```

- 然后第二个错说没有安装`core-js`

`vue cli 4`把 `core-js`由 `^2.x.x` 的版本升级到了 `^3.x.x`

于是安装一下

```
npm i core-js
```

然后重启项目还是不行，看了下官方文档和 babel 有关

```
import '@babel/polyfill'
```

隐藏这个代码

重启好了

然后把 `@babel/polyfill` 换成成 `babel-polyfill` 即可

```
npm i babel-polyfill
```

main.js 代码中 改为

```
import 'babel-polyfill'
```

5. vue cli 4 主要升级点总结

1."@vue/cli-plugin-babel", "@vue/cli-plugin-eslint", "@vue/cli-service"由 v3 的版本升级到了 v4

2.sass-loader由 v7 的版本升级到了 v8

3.core-js由 v2 的版本升级到了 v3

4.webpack-chain由 v4 的版本升级到了 v6

5.css-loader由 v1 的版本升级到了 v3

6.url-loader由 v1 的版本升级到了 v2

7.file-loader由 v3 的版本升级到了 v4

8.copy-webpack-plugin由 v4 的版本升级到了 v5

9.terser-webpack-plugin由 v1 的版本升级到了 v2

10.@vue/cli-plugin-pwa由 v3 的版本升级到了 v4

11.新增插件 vue add vuex vue add router

12.pug-plain已重命名为pug-plain-loader

13.默认目录结构已更改

src/store.js 改为 src/store/index.js

src/router.js 改为 src/router/index.js

14.由于兼容性原因，仍支持 router＆routerHistoryMode 选项 preset.json

但是现在建议使用它来 plugins: { '@vue/cli-plugin-router': { historyMode: true } }

获得更好的一致性

15.api.hasPlugin('vue-router')不再受支持，现在 api.hasPlugin('router')

16.lintOnSave 选项的默认值（未指定时）从 true 更改为 default

17.废弃vue-cli-service test:e2e

18.@vue/cli-plugin-e2e-nightwatch Nightwatch.js已从0.9升级到1.x

19.@vue/cli-plugin-unit-mocha 升级到Mocha 6

20.@vue/cli-plugin-unit-jest jest由 v23 升级到v24

21.@vue/cli-plugin-typescript 更好的ts(x)支持 ，胜过js(x)

>参考链接[vue cli 4 官方英文升级文档](https://cli.vuejs.org/migrating-from-v3/#vue-cli-plugin-unit-jest)


End

> 本文首次发布于 [Joey Blog](http://qiaoyu113.github.io), 作者 [@乔宇(Joey)](http://github.com/qiaoyu113) ,转载请保留原文链接..