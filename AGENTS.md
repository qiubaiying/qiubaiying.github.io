# 王镭的杂货铺 — AI 写作与发布手册

给后续 AI（Cursor / ChatGPT / 其他）用。用户用自然语言描述想发的内容或页面后，按本文生成文件，再 push 到 GitHub。站点会自动上线。

站点：[https://wanglei.gaoxiaoxue.life/](https://wanglei.gaoxiaoxue.life/)  
仓库：`https://github.com/leiwangsnow/leiwangsnow.github.io`  
分支：只使用 `master`

---

## 0. 接到任务时先判断

| 用户在说什么 | 你做什么 |
|---|---|
| 发一篇文章 / 写一篇博文 / 记一次旅行或项目 | 在 `_posts/` 新建 Markdown，套第 2 节模板 |
| 改首页介绍、侧边栏、友链、站点标题 | 只改 `_config.yml` 或 `index.html` / `about.html` |
| 改版式、字体、图片样式 | 只在用户明确要求时改 `_layouts/`、`_includes/`、`css/` |
| 发布 / 上线 / push | 按第 6 节 commit + `git push origin master` |
| 只预览、先别发 | 只写文件，不要 commit、不要 push |

默认：生成或修改内容后，**先把文件写好给用户看**。只有用户说「发布 / push / 提交」时才 git。

不要改：`_site/`、`.github/workflows/`、Gitalk 密钥、统计 ID。不要新建主题或换框架。

---

## 1. 这是什么站

Jekyll + GitHub Pages 个人博客，主题来自 Hux / qiubaiying，已改成「王镭的杂货铺」。

- 作者：王镭（署名 `WL` 或 `WY`，用户没指定时用 `WL`）
- 语言：简体中文
- 内容：硬件项目（ESP32、打鼓装置）、旅行、乐器、个人思考。口吻第一人称，可以有一点文学性，不要写成产品说明书或营销稿
- 正文配图：阿里云 OSS `https://nibilu.oss-cn-beijing.aliyuncs.com/...`
- 文章头图：仓库 `img/` 下的本地文件
- 推到 `master` 后，`.github/workflows/jekyll-gh-pages.yml` 自动构建部署（约 1 分钟）

现有文章都在 `_posts/`，写新文前先看 1～2 篇同类文章对齐语气和章节。

---

## 2. 新文章（最常用）

### 文件名

```
_posts/YYYY-MM-DD-短标题.md
```

- 日期用当天或用户指定的日期，**不要用未来日期**（Jekyll 默认不发布未来文）
- 短标题可用中文；会变成 URL：`https://wanglei.gaoxiaoxue.life/YYYY/MM/DD/短标题/`
- 文件必须放在 `_posts/`，不能放子目录

### Front matter（必须原样这种结构，放在文件最开头）

```yaml
---
layout:     post
title:      标题（首页大字，可与文件名不同）
subtitle:   副标题（一行，技术文常用「硬件 + 场景」）
date:       YYYY-MM-DD
author:     WL
header-img: img/post-bg-desk1.jpg
catalog: true
tags:
    - 标签
---
```

字段约定：

- `layout` 必须是 `post`
- `date` 与文件名日期一致
- `catalog: true` 打开右侧目录
- `tags` 每行一个，前面三个空格 + `- `。能复用已有标签就复用：`Drum` `esp32s3` `game` `Tools` `旅行` `Didgeridoo` `神经` `南沙群岛`
- `header-img` 相对仓库根目录。没有新图时按主题选用：

| 主题 | 头图 |
|---|---|
| 默认 / 杂记 | `img/post-bg-desk1.jpg` |
| ESP32 / 嵌入式 | `img/post-wl-eps32chat.jpg` |
| 打鼓 / Ableton | `img/post-bg-drum.jpg` |
| 旅行 | `img/blog-wl-Osaka01.jpg` |
| Didgeridoo | `img/post_bg_mago.jpg` |
| 工具 / GitHub | `img/post-bg-markdown.jpg` |
| 思考 | `img/post-bg-pigJumpin.jpg` |
| 南海 | `img/bolg-wl-HughesReef.png` |

新头图：把图片放进 `img/`，`header-img` 写成 `img/文件名.jpg`。头图要够宽、偏深色（标题是白字）。

### 正文结构（按主题选，不要每篇都堆满）

**硬件 / 项目文**（对齐 Gameboy、语音助手、打鼓）：

```markdown
> 三到五行短句，说明这是什么、用了什么、想纪念什么

### 实物图
（OSS 图片）

### 测试效果 / 现场
（B 站或图片）

### 电路原理图
### PCB / 结构
### 代码或仓库
https://github.com/leiwangsnow/...

### 写在最后
一小段个人感受，不要总结成 bullet
```

**旅行 / 生活文**（对齐日本旅行）：

```markdown
> 一句总起

### 地点 A
图片 + 一句说明

### 地点 B
...
```

**思考文**：blockquote + 若干 `###` 小节，少用列表。

正文习惯：

- 中文。标题用 `###`，不要用 `#`（`#` 会和页面大标题抢）
- 开头常用 `>` 引用块
- 技术文可以有仓库链接、原理图；结尾「写在最后」偏感受
- 需要 HTML 时可以直接写（Jekyll 允许 Markdown 里嵌 HTML）

### 图片

优先 OSS 外链（用户现有做法）。用户只给了本地路径、没有 OSS 地址时：把图拷到 `img/`，用站点相对路径 `/img/文件名.jpg`。

单图：

```markdown
![](https://nibilu.oss-cn-beijing.aliyuncs.com/目录/图片.jpg)
```

控制大小（项目里常用）：

```html
<img src="https://nibilu.oss-cn-beijing.aliyuncs.com/目录/图片.jpg"
style="width:80%;display:block;margin:auto;">
```

或 Typora 风格：`style="zoom:50%;"`

并排两张：

```html
<div style="display: flex; flex-wrap: wrap; justify-content: center;">
    <img src="OSS地址1" style="width: 48%; margin: 1%;" />
    <img src="OSS地址2" style="width: 48%; margin: 1%;" />
</div>
```

用户没给图片时：不要编造 OSS 地址；用文字占位并标明「待补图」。

### B 站视频

用户给出 BV / aid 后使用（`autoplay=0`）：

```html
<div style="position: relative; padding: 30% 45%;">
  <iframe style="position: absolute; width: 100%; height: 100%; left: 0; top: 0;" src="https://player.bilibili.com/player.html?bvid=BVxxxxxx&page=1&as_wide=1&high_quality=1&danmaku=0&autoplay=0" frameborder="no" scrolling="no"> </iframe>
</div>
```

---

## 3. 改「界面」时动哪些文件

用户说的「界面」多数是页面上看到的文案，不是改主题代码。

| 想改的界面 | 文件 |
|---|---|
| 首页文章列表 | 不要手改列表。写好 `_posts/` 即可，`index.html` 会自动列出 |
| 首页副文案 | `index.html` 顶部 YAML 的 `description` |
| 站点标题、侧栏介绍、头像、友链、社交账号 | `_config.yml` |
| 关于页 | `about.html` |
| 标签页头图 | `tags.html` |
| 文章页骨架（目录、评论、上下篇） | `_layouts/post.html` |
| 导航 | `_includes/nav.html` |
| 全局样式 | `css/hux-blog.css`（改完如需压缩再动 `css/hux-blog.min.css`） |

`_config.yml` 要点：`title` `SEOTitle` `url` `sidebar-about-description` `sidebar-avatar` `friends`。`url` 已是 `https://wanglei.gaoxiaoxue.life/`，不要改回 github.io。

不要为了发文去改 layout。不要引入新的 JS 框架。

---

## 4. 完整最小示例

用户说：「写一篇今天做完的 ESP32 温湿度监测，署名 WL，标签沿用嵌入式。」

则创建 `_posts/2026-09-09-esp32温湿度监测.md`：

```markdown
---
layout:     post
title:      基于ESP32的温湿度监测
subtitle:   ESP32 + 传感器 + 一次能看懂的小装置
date:       2026-09-09
author:     WL
header-img: img/post-wl-eps32chat.jpg
catalog: true
tags:
    - esp32s3
---

> 一块板子，一组数字  
> 把房间的呼吸变成可以看见的东西

### 实物图

（待补图）

### 原理

- 传感器读温湿度，ESP32 采集后显示 / 上报

### 写在最后

（用用户提供的素材写一段；没有素材就短写，不要编造经历）
```

日期、标题、细节一律用用户原话和当天日期，不要编造项目经历、照片或 GitHub 仓库。

---

## 5. 写完后自检

- [ ] 文件在 `_posts/`，名字是 `YYYY-MM-DD-标题.md`
- [ ] 开头 `---` front matter 完整，`layout: post`
- [ ] `date` 不是未来
- [ ] 头图路径在 `img/` 里真实存在，或用户已提供新图
- [ ] 没有虚构的 OSS 链接
- [ ] 没改 `_site/`、workflow、密钥
- [ ] 用户没说发布的话，不要 git commit / push

---

## 6. 发布到 GitHub

用户明确说发布、push、上线时，在仓库根目录执行（PowerShell）：

```powershell
git add _posts/刚才那篇.md
# 若还有新头图：
# git add img/新头图.jpg

git commit -m "Add post: 文章标题"

git push origin master
```

提交说明用英文或中文均可，一句话说清「发了哪篇」。不要 `git push --force`，不要改 git config。

推送后让用户打开 [Actions](https://github.com/leiwangsnow/leiwangsnow.github.io/actions)，绿灯后再刷：

- https://wanglei.gaoxiaoxue.life/
- https://leiwangsnow.github.io/

若 Actions 失败：先看日志（常见是 YAML 缩进或 front matter 损坏），修好后重新 push，不要改 workflow 来绕过。

本地可选预览（未装 Jekyll 可跳过，直接靠 Actions）：

```powershell
jekyll serve
```

打开 `http://127.0.0.1:4000/`。

---

## 7. 用户怎么对 AI 说话（可复制）

发文：

```text
按 AGENTS.md 写一篇新文章。
标题：……
副标题：……
日期：今天
标签：……
头图：用 ESP32 那张（或：我已经把图放到 img/xxx.jpg）
正文要点：
1. ……
2. ……
图片链接（OSS）：
- ……
先生成文件，不要 push。
```

改完要上线：

```text
把这篇 commit 并 push 到 master。
```

改侧栏或关于页：

```text
按 AGENTS.md 改界面：把侧栏介绍改成「……」，不要动文章。
```
