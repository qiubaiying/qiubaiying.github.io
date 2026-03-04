@echo off
cd /d "%~dp0"
python 0.sync_articles.py
REM Win11 资源由 sync_articles.py 已拷到 img/，此处用 Python 兜底复制（避免 bat 中文编码问题）
python -c "import shutil; from pathlib import Path; r=Path('.').resolve(); s=r/'_articles'/'Win11_right_click.assets'; d=r/'img'; d.mkdir(exist_ok=True); [shutil.copy2(f, d/('win11-right-click_'+f.name)) for f in s.iterdir() if f.is_file()]"
pause
