source "https://rubygems.org"

# 锁定 Jekyll 版本，确保和 GitHub Pages 一致
gem "jekyll", "~> 3.9"

# GitHub Pages 的核心插件包
gem "github-pages", group: :jekyll_plugins

# 你配置文件里用到的分页插件
gem "jekyll-paginate"

# Windows 下 Ruby 3.0+ 必须加这个才能跑服务
gem "webrick"

# Windows 系统的时区补丁（没有这个会报错）
gem "tzinfo-data", platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# 避免监听文件变更时的轮询（Jekyll 建议）
gem "wdm", ">= 0.1.0"

# Ruby 4.0 后 fiddle 不再默认包含，提前声明以消除警告
gem "fiddle"

# Faraday v2.0+ 重试中间件，消除 "install faraday-retry" 警告
gem "faraday-retry"