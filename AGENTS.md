# 博客项目协作

开发前读取 `.ai/PROJECT.md`、`.ai/CURRENT.md`、`.ai/DECISIONS.md`，并检查 `git status`。

博客为 Jekyll，原文在 `_posts/`，主样式在 `css/main.css`。本地文章工具在 `tools/article-studio/`。改动后运行最小相关检查和 Jekyll 构建。

不要读取或提交凭据，不要覆盖已有文章。`git push origin master` 会触发线上博客更新；只有用户明确要求发布，或用户在排版工具中点击“发布到线上博客”后才能执行。只暂存当前任务文件。
