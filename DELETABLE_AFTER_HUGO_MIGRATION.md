# 迁移到 Hugo 后可在本仓库删除的内容

迁移脚本已运行，Hugo 站点在 `C:\Files\项目\my-hugo-blog`。确认 Hugo 站正常后，可在**本 Jekyll 仓库**中删除以下内容以保持仅保留迁移脚本与备份。

## 可整目录删除

| 目录/文件 | 说明 |
|-----------|------|
| `_layouts/` | Jekyll 布局 |
| `_includes/` | Jekyll 片段 |
| `_plugins/` | Jekyll 插件（图片路径等） |
| `_config.yml` | Jekyll 配置 |
| `css/` | 原站样式（Hugo 用主题） |
| `js/` | 原站脚本 |
| `img/` | 若仍存在，已合并到 `images/` |
| `pwa/` | 原 PWA 配置（可选，Hugo 可另配） |
| `less/` | 源样式（若存在） |
| `about.html` | 关于页（可迁移到 Hugo 再删） |
| `tags.html` | 标签页（Hugo 主题提供） |
| `index.html` | 首页（Hugo 主题提供） |
| `404.html`, `offline.html` | 错误/离线页（Hugo 可另配） |
| `statistics.html` | 统计页（Hugo 可自建） |
| `.github/workflows/jekyll.yml` | Jekyll 构建工作流 |

## 可删除的脚本/杂项

| 文件 | 说明 |
|------|------|
| `0.sync_articles.py` | 原 Jekyll 同步脚本 |
| `0.run_sync.bat` | 原同步批处理 |
| `Gemfile`, `Gemfile.lock` | Jekyll 依赖（若存在） |

## 建议保留（仅作备份或再次迁移）

| 目录/文件 | 说明 |
|-----------|------|
| `_posts/` | 源文章备份（可选，Hugo 已有 content/posts） |
| `images/` | 源图片备份（可选，Hugo 已有 static + 各 bundle） |
| `migrate_to_hugo.py` | 迁移脚本，建议保留以便再次迁移或新电脑使用 |

## 操作建议

1. 先在本机跑通 Hugo：`cd C:\Files\项目\my-hugo-blog` → `hugo server -D`，确认文章与图片正常。
2. 再按上表删除本仓库中不需要的目录与文件；若想保留完整备份，可先整库打包再删。
3. 若 GitHub 上仍用 `June6699.github.io` 部署，改为用 Hugo 的 `public/` 部署（或 GitHub Actions 跑 `hugo` 后发布）。
