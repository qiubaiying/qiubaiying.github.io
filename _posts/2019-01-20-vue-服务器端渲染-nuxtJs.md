---
layout:     post
title:      vue 服务器端渲染 nuxt.js
subtitle:   nuxt.js 是一个基于 Vue.js 的通用应用框架
date:       2019-01-20
author:     Joey
header-img: img/post-bg-timg.jpg
catalog: true
tags:
    - Web
    - Vue
    - 前端
---

## 前言

开头还是来一段废话： 年关将近，给大家拜个早年，愿大家年会都能抽大奖，来年行大运。

废话不多说，直接进正文

#### 项目环境：

```
前端vue项目， 需要将新增的几个路由页面做seo处理。

在调研 插件 prerender-spa-plugin后，发现无法满足 vuex 以及 plugins 等要求时，果断选用了 nuxt.js做服务器渲染。

下面是在项目中整理的 文档 和 问题

```


## nuxt.js 是一个基于 Vue.js 的通用应用框架

```
它预设了利用 Vue.js 开发 服务端渲染（SSR, Server Side Render） 的应用所需要的各种配置，同时也可以一键生成静态站点。
值得一提的是，nuxt是基于node.js的，后端如果是其他语言时，是否考虑到再加一层node.js的合理性

```
>链接地址[《nuxt.js》](https://zh.nuxtjs.org/guide/installation)

##  利用npx脚手架创建项目

```

会提供以下选项

  1. 在集成的服务器端框架之间进行选择:   Express / Koa ...

  2. 选择您喜欢的UI框架:   Bootstrap /  Element UI ...

  3. 选择你想要的Nuxt模式  (Universal or SPA)    普通类型 / 单页应用

  4. 添加 axios module 以轻松地将HTTP请求发送到您的应用程序中。

  5. 添加 EsLint 以在保存时代码规范和错误检查您的代码。

  6. 添加 Prettier 以在保存时格式化/美化您的代码。

注意：
      1. 如果项目自带分支等git信息时， 需要将npx生产的目录里面隐藏的git 文件删除
              因为npx生成文件时，默认为master 分支，类似于 gitmodule 子分支性质
      
      2. 其中第3点，选择 Universal 时 才会默认输出静态页，也就是能够seo的，当选择spa时，则无法seo
              可修改 nuxt.config.js 中的配置项 mode: 'Universal' 来定义类型

```

## 启动项目
```
命令： npm run dev 默认命令

这时会报错，说未指定ip 什么的，

需配置项：

      nuxt.config.js 中

      server: {
        // port: '3000',     // 定义 输出端口 ，默认为3000 
        host:'0.0.0.0'      // 定义 输出 ip 
      },


      注意： 
      
      在server 目录中的index.js中 会读取 nuxt.config.js 中的配置项，当不存在时会赋值默认值

      const {
        host = process.env.HOST || '127.0.0.1',
        port = process.env.PORT || 3000   // 默认配置条件下，修改此处无效 仍旧为3000端口
      } = nuxt.options.server

      页面上的注意点有：

      css 都默认加载到 页面上了；

      处理方式有2种

          1. 在 nuxt.config.js 文件 header 配置 link 外链这些公共样式 （下面有具体说明）

          2. 在 nuxt.config.js 文件 build 配置 中 自定义文件路径 以及hash值 （下面有具体说明）
          
          
```

## 项目目录结构

```
1. 资源目录 （assets）

        用于组织未编译的静态资源如 LESS、SASS 或 JavaScript。

2. 组件目录 （components）

        用于组织应用的 Vue.js 组件。Nuxt.js 不会扩展增强该目录下 Vue.js 组件，
          即这些组件不会像页面组件那样有 asyncData 方法的特性。

3. 布局目录 （layouts） 该目录名为Nuxt.js保留的，不可更改。

        用于组织应用的布局组件。 

4. 中间件目录 (middleware)

        目录用于存放应用的中间件
        
            文件名的名称将成为中间件名称(middleware/auth.js将成为 auth 中间件)。
            一个中间件接收 context 作为第一个参数：
        
        具体参考： https://zh.nuxtjs.org/guide/routing#中间件

5. 页面目录 （page） 该目录名为Nuxt.js保留的，不可更改。

        用于组织应用的路由及视图。Nuxt.js 框架读取该目录下所有的 .vue 文件并自动生成对应的路由配置。

        nuxt 会根据文件夹名称以及目录结构动态生产 router， 无需额外配置。

6. 静态文件目录 （static）

        用于存放应用的静态文件，此类文件不会被 Nuxt.js 调用 Webpack 进行构建编译处理。 
        服务器启动的时候，该目录下的文件会映射至应用的根路径 / 下。
        
        一般用于 放置公共css，以及 js 文件， 但是如果不想这些css和js走根目录的话，
        需要将这些css放置到 assets中，然后在 nuxt.config.js中 配置 build 选项 下面会具体说明

7. Store 目录

        用于组织应用的 Vuex 状态树 文件
        
        注意： 普通的spa 项目中抛出一个实例对象即可， store为
        
        export default new Vuex.Store({
          actions,
          getters,
        })
        
          这里则需要抛出一个 实例函数对象
        
          const store = () => {
            return new Vuex.Store({
              state,
              getters,
              mutations,
              actions
            })
          }
        
          export default store

8. nuxt.config.js 

      用于组织Nuxt.js 应用的个性化配置，以便覆盖默认配置

9. package.json

      省略...
```

## 别名

```
~ 或 @           // src目录
    
    ~~ 或 @@         // 根目录
    
    默认情况下，src目录和根目录相同
```

## 页面间路由的跳转

```
    要在页面之间使用路由，建议使用<nuxt-link> 标签。
    
    js 中仍然可以使用 $router.push 等方法
```

## 路由跳转时的页面间过渡效果

```
    Nuxt.js 默认使用的过渡效果名称为 page
    
    需要在 assets/目录下创建 main.css 添加全局样式
    
      .page-enter-active, .page-leave-active {
        transition: opacity .5s;
      }
      .page-enter, .page-leave-active {
        opacity: 0;
      }
    
    然后添加到 nuxt.config.js 文件中：
    
      module.exports = {
        css: [
          'assets/main.css'
        ],
        loading: { color: '#2152F3' },
      }
    
    更多过渡效果： https://zh.nuxtjs.org/guide/routing#过渡动效

```

##  头部信息 （Meta 标签 ，全局样式）

```
nuxt.config.js 里定义应用所需的所有默认 meta 标签
    
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
        { hid: 'description', name: 'description', content: '' }
      ],
      link: [   // 这里可以引用全局的样式，但是会默认走根目录
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto' }
    
        { rel: 'stylesheet', href: '～/static/common.js' }    // 文件一般都放在static目录下
      ]
    }
    
    具体参考：https://zh.nuxtjs.org/api/configuration-head

```

## 异步数据 （asyncData方法，限于page页面组件，components中不适用）

```
这里包括  asyncData钩子  /  fetch 钩子 / 。。。
    
    【fetch】 用于在渲染页面前填充应用的状态树（store）数据， 与 asyncData 方法类似，不同的是它不会设置组件的数据
    
    【asyncData】 主要用于请求ajax 填充data中的数据
    
    每次加载之前被调用。它可以在服务端或路由更新之前被调用。
    
    asyncData ({ params }) {
      return axios.get(`https://my-api/posts/${params.id}`)
      .then((res) => {
    
        // 赋值给页面 data中的数据
        return { title: res.data.title }
      })
    }
    
    或者变换为同步请求
    
    async asyncData() {
        let formData = {}
    
        let ajaxData = await axios({
          method: "post",
          url: url,
          data: qs.stringify(formData),
          retryDelay : 1000,
          withCredentials : true,
          responseType : 'json',
          timeout : 60000,
          'Content-Type' : 'application/x-www-form-urlencoded'
        })
    }
    
    注意添加 catch
    
    
    注意： 
      
      这个异步请求函数， 第一次执行环境为node环境中，也就是服务器端，后续刷新页面则执行环境为client 客户端
    
      本地开发时，如果在客户端直接请求完整路径时会经常遇到跨域问题，所以需要在 asyncData 中区分环境变量
    
      process.env.VUE_ENV 区分 是server 还是 client
    
      然后根据不同的环境配置不同的 url ， 并且在 client时， 需要做服务器端代理请求，需要给url增加一层代理标识
    
      例如：client环境中
    
        url =  '/api' + '/get-user-info';
    
        nuxt.config.js 中
    
        /*
        ** 处理代理跨域问题
        */
        axios: {
          proxy: true,
          prefix: '/api',       // 增加请求标识
          credentials: true,
        },
        proxy: {
          '/api': {
            // 代理地址
            target: (process.env.NODE_ENV == 'production') ?'http://test.' : 'http://www.' ,
            changeOrigin: true,
            pathRewrite: {
              '^/api': ''           // 将标识 替换为 ‘’
            },
          },
        }
    
    
        错误处理 : 
    
            context中提供了一个 error(params) 方法，你可以通过调用该方法来显示错误信息页面。
            params.statusCode 可用于指定服务端返回的请求状态码。
    
        asyncData ({ params, error }) {
          return axios.get(`https://my-api/posts/${params.id}`)
          .then((res) => {
            return { title: res.data.title }
          })
          .catch((e) => {
            error({ statusCode: 404, message: 'Post not found' })
          })
        } 
        

```

## 第三方插件的使用

```

例如：element-ui
    
      需要在 plugins/ 中 添加 element-ui.js
    
        import Vue from 'vue'
        import Element from 'element-ui/lib/element-ui.common'
        import locale from 'element-ui/lib/locale/lang/en'
    
        export default () => {
          Vue.use(Element, { locale })
        }
    
    
      在 nuxt.config.js 中
    
      plugins: [
        "~/plugins/element-ui",
        // {src : '~/plugins/ga.js' , ssr : false}  是否做ssr处理， false时为在客户端才加载
      ],
      
    
      这样全局就可以使用了
    
      注意：
          在使用第三方插件时需要注意 插件内部很多地方都会用到window对象，在服务端会报错，所以需要将ssr设置为false
          
          在生产环境中， 有一些插件，在多个页面中引用，这样会造成多次加载打包的现象
        
          所以： 在 build配置项中增加配置
        
            build: {
              vendor:['axios', 'qs'],        // 防止多次打包
            }
            

```

## page 函数钩子生命周期 以及window 对象

```
经常会在 第三方组件或者调用的时候 遇到window对象报错问题
    
      asyncData() {
        console.log(window) // 服务端报错
        console.log(this)   // undefined
      },
      fetch() {    
        console.log(window) // 服务端报错
      },
      created () {
        console.log(window) // undefined
      },
      mounted () {
        console.log(window) // Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, frames: Window, …}
      }

```

![](https://segmentfault.com/img/bVbnA2r?w=920&h=1890/view)

## css js 文件打包文件夹处理

```
在 uuxt.config.js 中 , 只需配置生产环境中

  build: {
    extractCSS: { allChunks: true },    // css 独立打包 link 的形式加载
    publicPath: '/sample/assets/', //sample/essays 打包的默认路径为 ‘_nuxt’ 或者可以指定cdn 域名
    filenames:{         // css 和 js  img 打包时指定文件夹 
      app: ({ isDev }) => isDev ? '[name].js' : '[chunkhash].js',
      chunk: ({ isDev }) => isDev ? '[name].js' : '[chunkhash].js',
      css: ({ isDev }) => isDev ? '[name].js' : '[contenthash].css',
      img: ({ isDev }) => isDev ? '[path][name].[ext]' : '[hash:7].[ext]'
    }
  },

  输出 css link 路径： /sample/essays/[contenthash].css

  注意： 静态资源文件路径名 不能和页面路由名称相同  publicPath 默认配置 '/' 无效

```

## 部署

```
先 npm run build 打包 client文件和 server 文件

  然后 npm runb start 启动服务器

  pm2 管理

  pm2 start npm --name "my-nuxt" -- run start


  部署时 需要注意 如果是 从其他地方重定向 到  nuxt 环境中的页面是， 需要额外配置一个 css / js 重定向路由，并且需要注意 header头部信息，防止出现 css 文件返回头部信息为 Content-Type text/plain

```

## 总结

目前项目中只运用到这么多，后续项目迁移时遇到更多的问题会做补充


End

> 本文首次发布于 [Joey Blog](http://qiaoyu113.github.io), 作者 [@乔宇(Joey)](http://github.com/qiaoyu113) ,转载请保留原文链接..

