# -*- coding: utf-8 -*-
"""
Jekyll → Hugo 迁移脚本
作者：Claude (for June6699)

功能：
  1. 扁平结构：content/posts/{slug}.md（保留“名字”，如 卜算子·自嘲.md）
  2. 文章图双写：content/posts/images/{slug}/（Typora 用 ./images/）+ static/posts/images/{slug}/（Hugo Render Hook 用 ../images/ → /posts/images/）
  3. 共享图（header_img 等）复制到 static/images/
  4. 正文路径统一 ./images/；Hugo 用 render-image.html 把 ./images/ 转为 ../images/，HTML 可显示
  5. front matter：去掉 layout，header-img 转为 cover.image

用法：
  python migrate_to_hugo.py
"""

import os
import re
import shutil
import sys
from pathlib import Path

# Windows 下避免 print 中文/特殊字符 GBK 报错
if getattr(sys.stdout, "encoding", "").lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", buffering=1)

# ─────────────────────── 配置（按需修改） ───────────────────────
JEKYLL_ROOT = r"C:\Files\项目\June6699.github.io"
HUGO_ROOT   = r"C:\Files\项目\my-hugo-blog"
# ────────────────────────────────────────────────────────────────

POSTS_SRC       = Path(JEKYLL_ROOT) / "_posts"
IMAGES_SRC      = Path(JEKYLL_ROOT) / "images"
HUGO_POSTS_DST  = Path(HUGO_ROOT) / "content" / "posts"
HUGO_STATIC_DST = Path(HUGO_ROOT) / "static" / "images"
HUGO_POSTS_IMAGES = Path(HUGO_ROOT) / "static" / "posts" / "images"   # 文章图 static/posts/images/<slug>/（Render Hook 用 ../images/ → /posts/images/）


def parse_jekyll_filename(name: str):
    """从 '2026-03-05-my-post.md' 解析出 (date_str, slug)"""
    m = re.match(r"^(\d{4}-\d{2}-\d{2})-(.+)\.md$", name)
    if m:
        return m.group(1), m.group(2)
    return None, None


def remove_layout_field(content: str) -> str:
    """删除 front matter 里的 layout: xxx 行"""
    def strip_layout(fm_block: str) -> str:
        lines = fm_block.splitlines(keepends=True)
        return "".join(l for l in lines if not re.match(r"^layout\s*:", l))

    pattern = re.compile(r"^(---\n)(.*?)(---\n)", re.DOTALL)
    m = pattern.match(content)
    if m:
        cleaned_fm = strip_layout(m.group(2))
        return m.group(1) + cleaned_fm + m.group(3) + content[m.end() :]
    return content


def jekyll_header_img_to_cover(fm_block: str) -> str:
    """把 header-img: images/xxx 转为 PaperMod 的 cover.image: /images/xxx"""
    if "header-img:" not in fm_block and "header_img:" not in fm_block:
        return fm_block
    out = []
    cover_line = None
    for line in fm_block.splitlines(keepends=True):
        m = re.match(r"^header-img:\s*(.+)\s*$", line)
        if m:
            path = m.group(1).strip().strip('"\'')
            if not path.startswith("/"):
                path = "/" + path
            cover_line = f"cover:\n  image: {path}\n"
            continue
        out.append(line)
    if cover_line:
        # 在 tags 或第一个 key 前插入 cover
        inserted = False
        for i, l in enumerate(out):
            if re.match(r"^[a-zA-Z]", l) and "cover" not in l:
                out.insert(i, cover_line)
                inserted = True
                break
        if not inserted:
            out.append(cover_line)
    return "".join(out)


def convert_header_img_to_cover(content: str) -> str:
    """在 front matter 中将 header-img 转为 cover.image"""
    pattern = re.compile(r"^(---\n)(.*?)(---\n)", re.DOTALL)
    m = pattern.match(content)
    if m:
        fm = jekyll_header_img_to_cover(m.group(2))
        return m.group(1) + fm + m.group(3) + content[m.end() :]
    return content


def fix_image_paths(content: str) -> str:
    """
    正文图片路径统一为 ./images/（相对路径，Typora 从 content/posts/ 打开时解析到 content/posts/images/）
    """
    content = re.sub(r"\((/images/)", r"(./images/", content)
    content = re.sub(r'(src=["\'])(/images/)', r"\1./images/", content)
    return content


def migrate_post(md_file: Path):
    """扁平：content/posts/{slug}.md，图片双写到 content/posts/images/{slug}/ 与 static/posts/images/{slug}/；返回用到的图片目录名"""
    filename = md_file.name
    date_str, slug = parse_jekyll_filename(filename)
    used_dir = None

    if not date_str:
        print(f"  [skip] not YYYY-MM-DD-slug: {filename}")
        return None

    out_md = HUGO_POSTS_DST / f"{slug}.md"
    print(f"  [post] {filename}  ->  content/posts/{slug}.md")

    try:
        raw = md_file.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        raw = md_file.read_text(encoding="gbk")

    raw = remove_layout_field(raw)
    raw = convert_header_img_to_cover(raw)
    raw = fix_image_paths(raw)

    HUGO_POSTS_DST.mkdir(parents=True, exist_ok=True)
    out_md.write_text(raw, encoding="utf-8")

    # 文章图双写：1) static/images/posts/{slug}/ 供 Hugo 输出 /images/posts/  2) content/posts/images/{slug}/ 供 Typora 的 ./images/
    HUGO_POSTS_IMAGES.mkdir(parents=True, exist_ok=True)
    content_images_dir = HUGO_POSTS_DST / "images"
    content_images_dir.mkdir(parents=True, exist_ok=True)
    candidates = [
        IMAGES_SRC / slug,
        IMAGES_SRC / f"{date_str}-{slug}",
    ]
    for img_src in candidates:
        if img_src.is_dir():
            dst_static = HUGO_POSTS_IMAGES / slug
            dst_content = content_images_dir / slug
            for d in (dst_static, dst_content):
                if d.exists():
                    shutil.rmtree(d)
                shutil.copytree(img_src, d)
            n = len(list(dst_static.rglob("*")))
            print(f"         [img] static/posts/images/ + content/posts/images/{slug}/  ({n} files)")
            used_dir = img_src.name
            break

    return used_dir


def copy_shared_images(used_post_dirs: set):
    """
    复制共享图片到 static/images/：header_img/、根目录单文件等。
    跳过已在 migrate_post 中复制过的文章专属目录名。
    """
    if not IMAGES_SRC.is_dir():
        return
    for item in IMAGES_SRC.iterdir():
        if item.name.startswith(".") or item.name == ".gitkeep":
            continue
        if item.is_dir():
            if item.name in used_post_dirs:
                continue
            dst = HUGO_STATIC_DST / item.name
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(item, dst)
            print(f"  [shared] static/images/{item.name}/")
        else:
            dst_file = HUGO_STATIC_DST / item.name
            if not dst_file.exists() or item.stat().st_mtime > dst_file.stat().st_mtime:
                shutil.copy2(item, dst_file)
                print(f"  [file] static/images/{item.name}")


def main():
    print("=" * 55)
    print("  Jekyll → Hugo 迁移脚本")
    print("=" * 55)
    print(f"来源：{POSTS_SRC}")
    print(f"目标：{HUGO_ROOT}")
    print()

    if not POSTS_SRC.is_dir():
        print(f"[err] _posts not found: {POSTS_SRC}")
        return

    HUGO_POSTS_DST.mkdir(parents=True, exist_ok=True)
    HUGO_STATIC_DST.mkdir(parents=True, exist_ok=True)
    HUGO_POSTS_IMAGES.mkdir(parents=True, exist_ok=True)

    # 删掉旧的 bundle 目录（content/posts/xxx/），只保留扁平 .md
    for d in list(HUGO_POSTS_DST.iterdir()):
        if d.is_dir():
            shutil.rmtree(d)
            print(f"  [del] old bundle: {d.name}/")

    md_files = sorted(POSTS_SRC.glob("*.md"))
    # 排除非文章（如没有 YYYY-MM-DD- 前缀的）
    md_files = [f for f in md_files if parse_jekyll_filename(f.name)[0]]
    print(f"找到 {len(md_files)} 篇文章，开始迁移...\n")

    used_dirs = set()
    success, skip = 0, 0
    for f in md_files:
        try:
            u = migrate_post(f)
            if u:
                used_dirs.add(u)
            success += 1
        except Exception as e:
            print(f"  [err] {f.name}  ->  {e}")
            skip += 1

    print()
    print("── 共享图片 ───────────────────────────────────────")
    copy_shared_images(used_dirs)

    # 确保 content/posts/images 有 _index.md，避免 Hugo 把该目录当正式页面
    content_images = HUGO_POSTS_DST / "images"
    if content_images.is_dir():
        idx = content_images / "_index.md"
        if not idx.exists():
            idx.write_text("---\ntitle: \"\"\ndraft: true\n_build: { list: \"never\", publishResources: false }\n---\n", encoding="utf-8")
            print("  [ok] content/posts/images/_index.md (draft, 不发布)")

    hugo_config = Path(HUGO_ROOT) / "hugo.toml"
    if not hugo_config.exists():
        hugo_config.write_text(
            '[module]\n'
            '  [[module.imports]]\n'
            '    path = "github.com/adityatelange/hugo-PaperMod"\n\n'
            'baseURL = "https://June6699.github.io/"\n'
            'languageCode = "zh-cn"\n'
            'title = "June\'s Blog"\n'
            'theme = "PaperMod"\n\n'
            '[params]\n'
            '  description = "Who Changes? Who Benefits!"\n'
            '  author = "June"\n',
            encoding="utf-8",
        )
        print("\n  [ok] hugo.toml (PaperMod) written")

    print()
    print("=" * 55)
    print(f"  Done. success={success}, skip={skip}")
    print("=" * 55)
    print()
    print("下一步：")
    print("  1. cd", HUGO_ROOT)
    print("  2. 安装主题：")
    print("       git init")
    print("       git submodule add https://github.com/adityatelange/hugo-PaperMod themes/PaperMod")
    print("  3. hugo server -D   # 本地预览")
    print("  4. hugo             # 构建，输出到 public/")


if __name__ == "__main__":
    main()
