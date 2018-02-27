使用GitHub Pages+Jekyll搭建[个人博客](https://stidio.github.io)
=======

### 概述 ###

![](/assets/build_blog_with_github_and_jekyll/01.jpg)

> **`GitHub Pages`** 免费无限容量的站点数据托管工具(*国内访问速度较慢*)，内置Jekyll服务，能将特定名称的代码仓库动态编译为静态网页
>
> **`Jekyll`** 基于Ruby的静态网页生成系统，采用模板将Markdown(或Textile)文件转换为统一的网页
>
> **统计** 统计工具主要是为了方便查看站点的访问情况，目前支持[百度统计](http://tongji.baidu.com)和[Google Analytics](http://www.google.com/analytics/)(可同时使用)
>
> **评论** 评论工具可以为静态页面增加评论和分享功能，目前支持国内的[多说](http://duoshuo.com)和国外的[Disqus](https://disqus.com)
>
> > *本文将重点介绍标注 `　　　` 的必选项目，未标注的可选项目请按照给定地址自行注册即可*

### 建立GitHub Pages站点 ###

1. 在GitHub上建立一个以 ***.github.io*** 为后缀的和你帐号名一样的代码仓库，如我的帐号是:[stidio](https://github.com/stidio)，则建立的仓库名为:[stidio.github.io](https://github.com/stidio/stidio.github.io), 同时在底部Add .gitigore选择Jekyll模板，这样Jekyll产生的临时文件，例如_site目录就不会添加到源代码管理中，当然你也可以以后手动配置:

    ![](/assets/build_blog_with_github_and_jekyll/02.jpg)

2. 将该代码仓库克隆到地:

    > ```sh
    > $ git clone https://github.com/stidio/stidio.github.io
    > ```

3. 创建一个测试页面并推送:

    > ```sh
    > $ cd stidio.github.io
    > $ echo "Hello World" > index.html
    > $ git add --all
    > $ git commit -m "Initial commit"
    > $ git push -u origin master
    > ```

4. 浏览器中输入[stidio.github.io](https://stidio.github.io)，如果一切正常，你应该能看到一个显示Hello World的页面.

> *请将以上的 __stidio__ 替换为你申请的帐号名*

### 安装配置Jekyll ###

1. 安装Jekyll:

    > ```sh
    > $ gem install jekyll
    > ```

2. 创建或使用模板, 创建模板使用 *jekyll new __name__* 命令，但创建出来的测试模板极其简陋，在这里我主要介绍使用第三方主题，在 [这里](http://jekyllthemes.org) 你可以找到各种主题，当然你也可以直接使用我的博客模板:[点击下载](https://github.com/stidio/stidio.github.io/archive/master.zip)，下载后解压到本地代码仓库目录，并运行 *bundle install* 命令安装项目依赖包.

3. 运行 *jekyll serve* 启动本地测试服务器，Jekyll默认使用4000端口，如果被占用，可以使用 *jekyll serve -P $PORT* 指定其他端口，如果本机从没配置过Jekyll，可能会给出 *cannot load such file -- bundler* 的错误，运行 *gem install bundler* 即可解决，如果还是出现包缺失的错误，可以从以下两点排查：

    > * Gemfile文件未添加指定包
    > * 运行环境冲突，可以运行 *bundle exe jekyll serve* 执行，或者运行 *sudo bundle clean --force*(**该命令会对全局环境造成影响，小心使用**) 强制清理无关包后重新运行

4. 在浏览器中输入 [127.0.0.1:4000](http://127.0.0.1:4000) 进行本地预览

> Ruby包管理工具介绍
>
> * `gem` 全局包管理工具，类似于Python的pip, Node.js的npm -g
>   * gem install               安装组件
>   * gem install -v            安装特定版本
>   * gem list                  列出已经安装组件
>   * gem sources -a            添加源
>   * gem sources --remove      删除源
>
> * `bundle` 项目包管理工具，可以理解为一个独立的运行环境
>   * bundle update             更新项目依赖包
>   * bundle install            安装项目依赖包
>   * sudo bundle clean --force 强制删除不相关的包
>   * bundle exe                在指定环境中运行

### 使用我的博客模板 ###

1. 按照注释说明修改 *_config.yml* 配置文件
2. 删除文章目录 *_post/* 和文章图片目录 *images/posts/* 下面的所有内容
3. Enjoy!

我的模板在 [leopardpan](https://github.com/leopardpan/leopardpan.github.io) 基础上进行了修改，主要改进了以下内容:

> * 统一风格，给关于，标签页面添加了标题栏
> * 添加分割改进文章列表的多标签显示
> * 修正了一些翻译不全的文字
> * 代码颜色高亮支持，综合了Pygments monokai方案和Rouge monokai.sublime方案，[点此查看](/css/code_style_monokai.css)
> * 底部统计和版权排版对齐
> * 更新Jekyll及其依赖包到最新版本
> * 修正jekyll-sitemap加载失败的问题
> * 支持GFM形式的Markdown Codeblock解析

如果喜欢请[Star!](https://github.com/stidio/stidio.github.io)，谢谢!

### 编写文章 ###

文章为Markdown格式，请使用.md作为后缀名，有以下两个文章目录：

> * `_posts` 文件名格式为：YEAR-MONTH-DAY-title.md
> * `_drafts` 草稿目录，文件名格式为：title.md，即不加日期前缀，如果需要预览草稿，使用 *\--drafts* 选项运行 *jekyll serve* 或 *jekyll build*
>
> **\* 尽量避免使用中文文件名, 具体目录结构请参考: [官方文档](http://jekyll.com.cn/docs/structure/)**

每篇文章都必须以参数：

> ```conf
> ---
> layout: post
> title: 使用GitHub+Jekyll搭建个人博客
> date: 2016-11-21 11:29:08 +0800
> tags: [Jekyll, GitHub, 教程]
> ---
> ```

作为头部信息，layout为布局格式；title为显示的文章名；date为显示的发布日期；tags为文章分类标签

文章正文采用Markdown编写，如果不熟悉可以查看: [Markdown 快速入门](http://wowubuntu.com/markdown/basic.html)；强烈建议遵循[Markdown Lint](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md)，规范有一些对书写文章不友好的地方，我做了调整，以下是我的[Visual Studio Code](https://code.visualstudio.com)的配置文件:

> ```json
> "markdownlint.config": {
>         "MD002": false,                                 // 禁用文章开头必须为H1标题栏
>         "MD001": false,                                 // 禁用严格的标题层级关系(H1->H2->H3...)
>         "MD003": { "style": "setext_with_atx_closed"},  // 允许#和===形式的标题风格混用
>         "MD009": { "br_spaces": 2 },                    // 允许末尾两个空格为<BR/>自动换行模式
>         "MD013": false,                                 // 禁用单行长度限制
>         "MD014": false,                                 // 禁用sh命令以 $ 作为开始
>         "MD038": false,                                 // 禁用代码不以空格作为开始或结束
>         "MD041": false,                                 // 禁用代码段必须有标题栏
>         "MD029": { "style": "ordered" }                 // 有序列表格式为顺序方式
>     }
> ```

Jekyll的Markdown解释器从3.0开始，默认从 *redcarpet+Pygments* 换为 *kramdown+Rouge*, 现在已知的问题为：列表下不支持GFM形式的代码块(神奇的是Github下的README.md文件支持)，折中的办法是使用区块引用(Blockquote)，在其下再使用代码块(我的博客模板已针对这种情况在呈现上做了优化)

### 参考资料 ###

[Github 简明教程](http://www.runoob.com/w3cnote/git-guide.html)  
[Git 简明指南](http://rogerdudler.github.io/git-guide/index.zh.html)  
[Jekyll 英文文档](https://jekyllrb.com/docs/home/)  
[Jekyll 中文文档](http://jekyll.com.cn/docs/home/)  
[Jekyll 代码高亮的几种选择](http://blog.csdn.net/qiujuer/article/details/50419279)  
[Markdown 语法说明](http://wowubuntu.com/markdown/index.html)  
[Markdown Lint](https://github.com/DavidAnson/markdownlint/blob/master/doc/Rules.md)  
[kramdown Quick Reference](http://kramdown.gettalong.org/quickref.html)