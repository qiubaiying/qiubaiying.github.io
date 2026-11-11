#!/bin/zsh
cd "$(dirname "$0")/tools/article-studio" || exit 1
tool_url='http://127.0.0.1:4174'
health_url="$tool_url/api/health"
if curl --silent --show-error --fail --max-time 2 "$health_url" 2>/dev/null | grep -Fq '"app":"scond-article-studio"'; then
  open "$tool_url"
  echo '排版工具已经在运行，页面已打开。'
  exit 0
fi
if ! command -v node >/dev/null 2>&1; then
  echo '没有找到 Node.js。请先安装 Node.js，再重新打开。'
  read '?按回车键关闭窗口…'
  exit 1
fi
node server.mjs &
server_pid=$!
for attempt in 1 2 3 4 5; do
  if curl --silent --show-error --fail --max-time 2 "$health_url" 2>/dev/null | grep -Fq '"app":"scond-article-studio"'; then
    open "$tool_url"
    echo '排版工具正在运行。关闭此窗口即可停止。'
    wait "$server_pid"
    exit $?
  fi
  if ! kill -0 "$server_pid" 2>/dev/null; then break; fi
  sleep 1
done
wait "$server_pid" 2>/dev/null
echo '启动失败。如果 4174 端口被其他程序占用，请先关闭该程序。'
read '?按回车键关闭窗口…'
exit 1
