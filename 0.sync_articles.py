#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 _articles/ 同步：1) 图片到 img/（扁平，无子文件夹，文件名加 slug_ 前缀防冲突）
                   2) 生成 _posts/（正文路径改为 /img/slug_xxx）
运行：在项目根目录执行 python sync_articles.py 或双击 run_sync.bat
"""
import re
import shutil
import sys
from pathlib import Path

# Windows 控制台编码，避免 print 中文/日文时报 UnicodeEncodeError
if sys.platform == "win32":
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", line_buffering=True)
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "_articles"   # 本地编辑用，md + 同级 .assets
IMG = ROOT / "img"
POSTS = ROOT / "_posts"

# img 下保留：整个 header_img 目录 + 这些根文件
KEEP_IMG_FILES = {"404-bg.jpg", "apple-touch-icon.png", "favicon.ico", "底特律·变包.png"}
KEEP_IMG_DIRS = {"header_img"}




def slug_from_name(name):
    """HiCPlot -> hicplot, Win11-Right-Click -> win11-right-click"""
    s = name.strip().lower().replace(" ", "-")
    return re.sub(r"-+", "-", s)


def clear_img_except_keep():
    """删除 img 下除 header_img 和 KEEP_IMG_FILES 以外的所有东西"""
    if not IMG.exists():
        return
    for p in IMG.iterdir():
        if p.name in KEEP_IMG_DIRS:
            continue
        if p.is_file() and p.name in KEEP_IMG_FILES:
            continue
        if p.is_dir():
            shutil.rmtree(p, ignore_errors=True)
        else:
            try:
                p.unlink()
            except Exception:
                pass


def get_assets_slug_map():
    """_articles 里 .md 对应的 assets 文件夹名 -> img 用的前缀 slug。优先 front matter 的 assets_folder。再扫一遍所有 .assets 目录，避免漏拷。"""
    m = {}
    if not SRC.exists():
        return m
    for f in sorted(SRC.iterdir()):
        if f.suffix != ".md":
            continue
        name = f.stem
        raw = f.read_text(encoding="utf-8").replace("\r\n", "\n").replace("\r", "\n")
        if not raw.startswith("---"):
            continue
        parts = re.split(r"\n---\n", raw, 2)
        if len(parts) < 2:
            continue
        front = parts[1]
        match = re.search(r"assets_folder:\s*(\S+)", front)
        folder = match.group(1).strip() if match else (name + ".assets")
        if not folder.endswith(".assets"):
            folder = folder + ".assets"
        adir = SRC / folder
        if adir.is_dir():
            base = folder[:-7].replace("_", "-")
            m[folder] = slug_from_name(base)
    # 兜底：_articles 下所有 .assets 目录都拷到 img，防止漏掉（如 Win11_right_click.assets）
    for p in sorted(SRC.iterdir()):
        if p.is_dir() and p.name.endswith(".assets") and p.name not in m:
            base = p.name[:-7].replace("_", "-")
            m[p.name] = slug_from_name(base)
    return m


def copy_article_assets_to_img():
    """把 _articles/*.assets 里每个文件拷到 img/，命名为 slug_原文件名（扁平，无子文件夹）"""
    amap = get_assets_slug_map()
    IMG.mkdir(parents=True, exist_ok=True)
    for folder_name, slug in sorted(amap.items()):
        src_dir = SRC / folder_name
        if not src_dir.is_dir():
            continue
        for f in src_dir.iterdir():
            if not f.is_file() or f.name == ".gitkeep":
                continue
            dest_name = slug + "_" + f.name
            shutil.copy2(f, IMG / dest_name)
        print("  img/ <- {}/ (prefix {})".format(folder_name, slug + "_"))


def rewrite_content(content, assets_to_slug):
    """正文里 ./XXX.assets/文件名 换成 /img/slug_文件名"""
    for assets_name, slug in assets_to_slug.items():
        content = content.replace("./" + assets_name + "/", "/img/" + slug + "_")
        content = content.replace("](./" + assets_name + "/", "](/img/" + slug + "_")
        content = content.replace('src="./' + assets_name + "/", 'src="/img/' + slug + "_",)
        content = content.replace('src="./' + assets_name + '/"', 'src="/img/' + slug + '_"')
    return content


def highlight_double_equals(body):
    """把正文里 ==高亮== 转为 <mark>高亮</mark>，跳过 ``` 代码块内"""
    parts = re.split(r"```", body)
    out = []
    for i, part in enumerate(parts):
        if i % 2 == 0:
            part = re.sub(r"==([^=]+?)==", r"<mark>\1</mark>", part)
        out.append(part)
    return "```".join(out)


def fix_inline_aligned_math(body):
    """\( \begin{aligned} ... \end{aligned} \) 在 KaTeX 里需用块级 \[ \] 才能正确渲染，同步时自动改掉"""
    body = re.sub(r"\(\s*\\begin\{aligned\}", r"\\[\\begin{aligned}", body)
    body = re.sub(r"\\end\{aligned\}\s*\)", r"\\end{aligned}\\]", body)
    return body


def wrap_display_math_blocks(body):
    """把 $$...$$ 块包成单 div，避免 kramdown 拆成多个 <p> 导致 KaTeX 无法识别"""
    parts = re.split(r"```", body)
    out = []
    for i, part in enumerate(parts):
        if i % 2 == 0:
            part = re.sub(
                r"\n?\$\$\n(.*?)\n\$\$",
                r'\n<div class="katex-block">$$\n\1\n$$</div>\n',
                part,
                flags=re.DOTALL,
            )
        out.append(part)
    return "```".join(out)


def parse_date_from_front_matter(text):
    """从 front matter 取 date，返回 YYYY-MM-DD（不依赖行首，兼容 CRLF）"""
    match = re.search(r"date:\s*(\d{4}-\d{2}-\d{2})", text)
    if match:
        return match.group(1)
    return "2026-01-01"


def rewrite_header_img(front, assets_folder, slug):
    """若 header-img 指向 img/xxx 且 xxx 在该文章的 .assets 中，则改写为 img/slug_xxx"""
    match = re.search(r"header-img:\s*(img/[^\s\n\"']+)", front)
    if not match:
        return front
    val = match.group(1).strip()
    m2 = re.match(r"img/([^/]+)$", val)
    if not m2:
        return front
    fname = m2.group(1)
    adir = SRC / assets_folder
    if adir.is_dir() and (adir / fname).is_file():
        new_val = "img/" + slug + "_" + fname
        return re.sub(r"header-img:\s*" + re.escape(val), "header-img: " + new_val, front, count=1)
    return front


def generate_posts(assets_to_slug):
    """从 _articles/*.md 生成 _posts/YYYY-MM-DD-slug.md。永远覆盖：每次都用 front matter 的 date，直接替换同名校验。"""
    POSTS.mkdir(parents=True, exist_ok=True)
    if not SRC.exists():
        print("  (no _articles dir)")
        return
    for f in sorted(SRC.iterdir()):
        if f.suffix != ".md":
            continue
        name = f.stem
        slug = slug_from_name(name.replace("_", "-"))
        try:
            raw = f.read_text(encoding="utf-8-sig").replace("\r\n", "\n").replace("\r", "\n")
        except Exception as e:
            print("  [skip] {} (read error: {})".format(f.name, e))
            continue
        raw = raw.lstrip("\ufeff")
        if not raw.startswith("---"):
            print("  [skip] {} (no front matter ---)".format(f.name))
            continue
        # 格式: ---\nfront\n---\nbody；按 \n---\n 分割得 [ "---\nfront", "body" ]
        parts = re.split(r"\n---\n", raw, 1)
        if len(parts) < 2:
            print("  [skip] {} (need \\n---\\n to separate front and body)".format(f.name))
            continue
        front = parts[0][4:] if parts[0].startswith("---\n") else parts[0]
        body = parts[1]
        date = parse_date_from_front_matter(front)
        match_af = re.search(r"assets_folder:\s*(\S+)", front)
        assets_folder = (match_af.group(1).strip() if match_af else (name + ".assets"))
        if not assets_folder.endswith(".assets"):
            assets_folder = assets_folder + ".assets"
        front = rewrite_header_img(front, assets_folder, assets_to_slug.get(assets_folder, slug_from_name(assets_folder[:-7].replace("_", "-"))))
        front = re.sub(r"\nassets_folder:.*", "", front)
        front = re.sub(r"\narticle:\s*true\s*", "\n", front)
        body = highlight_double_equals(body)
        body = fix_inline_aligned_math(body)
        body = wrap_display_math_blocks(body)
        body = rewrite_content(body, assets_to_slug)
        out_path = POSTS / "{}-{}.md".format(date, slug)
        try:
            out_path.write_text("---\n" + front + "\n---\n" + body, encoding="utf-8")
            print("  _posts/{} <- {}".format(out_path.name, f.name))
        except Exception as e:
            print("  [fail] {} -> _posts/{} (write error: {})".format(f.name, out_path.name, e))


def main():
    print("1. Clearing img (keep header_img + important files)...")
    clear_img_except_keep()
    amap = get_assets_slug_map()
    print("2. Copying _articles/*.assets to img/ (flat, slug_ prefix)...")
    copy_article_assets_to_img()
    print("3. Generating _posts from _articles/*.md...")
    generate_posts(amap)
    print("Done.")


if __name__ == "__main__":
    main()
