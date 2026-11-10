#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
xiuxing-verify.py —— 修仙栏目静态校验（不依赖 Ruby/Jekyll）

覆盖：卷册数据、图目文件、配置 schema、页面注入、Liquid 标签配对、
search.json 的 JSON 结构、硬编码图数残留、离线缓存清单、JS 语法。
用法：python scripts/xiuxing-verify.py
"""
import json
import re
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
ERRORS = []
WARNS = []

# 改 _data/xiuxing/practice.yml 后，用 --sync 重新生成静态页的数据脚本
if "--sync" in sys.argv:
    pr = yaml.safe_load((ROOT / "_data/xiuxing/practice.yml").read_text(encoding="utf-8"))
    out = dict(pr)
    out["bySlug"] = {c["slug"]: c["id"] for c in pr["cards"]}
    js = "window.__XIUXING_PRACTICE=" + json.dumps(out, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "js/xiuxing-practice-data.js").write_text(js, encoding="utf-8")
    print("已同步 js/xiuxing-practice-data.js（%d 卡 / %d 日）" % (len(pr["cards"]), len(pr["days"])))
    sys.exit(0)


def ck(cond, msg):
    if not cond:
        ERRORS.append(msg)


def rel(p):
    return str(Path(p).relative_to(ROOT)) if str(p).startswith(str(ROOT)) else str(p)


# ---------------------------------------------------------------- 卷册数据
volfile = ROOT / "_data/xiuxing/volumes.yml"
vols = yaml.safe_load(volfile.read_text(encoding="utf-8"))
ck(isinstance(vols, list) and len(vols) == 8, "volumes.yml 应为 8 卷")
total = 0
new_slugs = []
for v in vols:
    key = v["key"]
    f = ROOT / "_data/xiuxing" / (key + ".yml")
    ck(f.exists(), "缺卷数据 " + rel(f))
    if not f.exists():
        continue
    d = yaml.safe_load(f.read_text(encoding="utf-8")) or {}
    items = d.get("items") or []
    total += len(items)
    ck(bool(d.get("intro")), key + " 缺 intro")
    for it in items:
        tag = "%s/%s" % (v["id"], it.get("n"))
        # 既有 A–E 各图的逐图依据写在总览「典籍索引」，按只增不改原则不回填；
        # 新增图按准入规则必须在卷数据里标 source。
        ck(bool(it.get("source")), tag + " 缺 source（准入规则）")
        ck(bool(it.get("driver")), tag + " 缺 driver")
        ck(it.get("status") == "已上线", tag + " 状态非已上线")
        u, c = it.get("url"), it.get("cover")
        if u:
            ck((ROOT / u.lstrip("/")).exists(), tag + " 页面缺失 " + u)
            slug = Path(u).stem
            og = ROOT / "img/og" / ("xiuxing-" + slug + ".png")
            if og.exists():
                ptxt = (ROOT / u.lstrip("/")).read_text(encoding="utf-8")
                ck(("img/og/xiuxing-" + slug + ".png") in ptxt,
                   tag + " 有专属 OG 卡但未引用")
            if v["id"] in ("F", "G", "H"):
                new_slugs.append(slug)
                ck(og.exists(), tag + " OG 卡缺失 " + rel(og))
        if c:
            ck((ROOT / c.lstrip("/")).exists(), tag + " 封面缺失 " + c)
    topic = ROOT / "xiuxing" / (key + ".html")
    ck(topic.exists(), "缺专题页 " + rel(topic))
    if topic.exists():
        tt = topic.read_text(encoding="utf-8")
        ck('id="boundary"' in tt or "boundary=" in tt,
           "专题页缺内容边界 " + key)
ck(total == 31, "图目总数应为 31，实际 %d" % total)
ck(len(new_slugs) == 10, "新图应为 10 张，实际 %d" % len(new_slugs))

# ---------------------------------------------------------------- 配置与页面
for slug in new_slugs:
    pf = ROOT / "_data/xiuxing/pages" / (slug + ".json")
    hf = ROOT / "xiuxing" / (slug + ".html")
    ck(pf.exists(), "缺配置 " + rel(pf))
    ck(hf.exists(), "缺页面 " + rel(hf))
    if not (pf.exists() and hf.exists()):
        continue
    c = json.loads(pf.read_text(encoding="utf-8"))
    ids = set(c["curves"])
    ck(all(v["id"] in ids for v in c["vessels"]), slug + " 有 vessels 缺少对应曲线")
    groups = {v["group"] for v in c["vessels"]}
    ck(all(g in groups for s in c["stages"] for g in s["vesselFilter"]),
       slug + " 有 stage 的 vesselFilter 指向不存在的组")
    ck(all(len(n["p"]) == 3 for n in c["nodes"]), slug + " 有节点坐标不是三维")
    ck(c["extras"]["spineCurve"] in ids, slug + " spineCurve 不在 curves 中")
    ck(c["cover"] == "cover-" + slug + ".png", slug + " cover 名不匹配")

    page = hf.read_text(encoding="utf-8")
    ck(page.startswith("<!doctype html>"), slug + " 不应有 YAML front matter")
    for asset in ("/css/xiuxing-3d.css", "/js/xiuxing-runtime.js", "/js/xiuxing-atlas.js"):
        ck(asset in page, slug + " 未引用 " + asset)
        ck((ROOT / asset.lstrip("/")).exists(), "共享资源缺失 " + asset)
    m = re.search(r"window\.__XIUXING_CONFIG=(\{.*?\});</script>", page, re.S)
    ck(bool(m), slug + " 页面未注入配置")
    if m:
        try:
            injected = json.loads(m.group(1))
            ck(injected["id"] == slug and len(injected["nodes"]) == len(c["nodes"]),
               slug + " 页面配置与数据文件不一致")
        except json.JSONDecodeError as e:
            ERRORS.append(slug + " 页面配置不是合法 JSON：" + str(e))
    ck("https://jimadela.github.io/img/og/xiuxing-" + slug + ".png" in page,
       slug + " og:image 未指向专属分享卡")

# ---------------------------------------------------------------- Liquid 配对
liquid_files = [
    ROOT / "xiuxing/index.html", ROOT / "xiuxing/xing.html",
    ROOT / "xiuxing/buxu.html", ROOT / "xiuxing/tonglan.html",
    ROOT / "search.json", ROOT / "_includes/xiuxing-topic.html",
    ROOT / "_includes/xiuxing-card.html",
]
for f in liquid_files:
    s = f.read_text(encoding="utf-8")
    for open_tag, close_tag in (("for", "endfor"), ("if", "endif"),
                                ("comment", "endcomment"), ("capture", "endcapture")):
        a = len(re.findall(r"\{%\s*" + open_tag + r"\b", s))
        b = len(re.findall(r"\{%\s*" + close_tag + r"\b", s))
        ck(a == b, "%s 的 %s/%s 不配对（%d/%d）" % (rel(f), open_tag, close_tag, a, b))
    ck(s.count("{{") == s.count("}}"), rel(f) + " 的 {{ }} 不配对")
    ck(s.count("{%") == s.count("%}"), rel(f) + " 的 {% %} 不配对")

# ---------------------------------------------------------------- search.json
sj = (ROOT / "search.json").read_text(encoding="utf-8")
sim = re.sub(r"\{% comment %\}[\s\S]*?\{% endcomment %\}", "", sj)
sim = re.sub(r"\{% for post in site\.posts %\}[\s\S]*?\{% endfor %\}", "", sim)
sim = re.sub(r"\{% for item in live %\}[\s\S]*?\{% endfor %\}", "", sim)
sim = re.sub(r"\{%[^%]*%\}", "", sim)
sim = sim.replace("{{ atlas | size }}", "31")
sim = re.sub(r"\{\{[^}]*\}\}", '"/x"', sim)
sim = re.sub(r"^---[\s\S]*?---", "", sim).strip()
try:
    parsed = json.loads(sim)
    ck(len(parsed) == 10, "search.json 固定条目应为 10 条，实际 %d" % len(parsed))
    ck(any("31 张图谱" in x.get("c", "") for x in parsed),
       "search.json 总览文案未使用动态计数")
except json.JSONDecodeError as e:
    ERRORS.append("search.json 模拟渲染后不是合法 JSON：" + str(e))
ck("xiuxing.buxu.items" in sj and "xiuxing.tonglan.items" in sj
   and "xiuxing.xingchi.items" in sj, "search.json 未接入 F/G/H 三卷数据源")

# ---------------------------------------------------------------- 硬编码残留
hard = re.compile(r"21\s*图|二十一图|五卷二十一|共 21 图|不再增图")
scan = [ROOT / "xiuxing/index.html", ROOT / "xiuxing/xing.html",
        ROOT / "xiuxing/jingluo.html", ROOT / "xiuxing/neidan.html",
        ROOT / "search.json", ROOT / "_data/xiuxing/glossary.yml",
        ROOT / "_includes/xiuxing-topic.html"]
for f in scan:
    for i, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
        if hard.search(line):
            ERRORS.append("%s:%d 仍有硬编码图数：%s" % (rel(f), i, line.strip()[:90]))

# ---------------------------------------------------------------- 术语与缓存
gl = yaml.safe_load((ROOT / "_data/xiuxing/glossary.yml").read_text(encoding="utf-8"))
ck(isinstance(gl, list) and len(gl) == 53, "术语表应为 53 条，实际 %d" % (len(gl) if isinstance(gl, list) else -1))
sw = (ROOT / "sw.js").read_text(encoding="utf-8")
ck("VERSION = 'v5'" in sw, "sw.js 未升到 v5")
ck("RUNTIME_MAX = 150" in sw, "sw.js 未调大 RUNTIME_MAX")
for asset in ("css/xiuxing-3d.css", "js/xiuxing-runtime.js", "js/xiuxing-atlas.js"):
    ck("'" + asset + "'" in sw, "sw.js 预缓存缺 " + asset)
    ck((ROOT / asset).exists(), "预缓存文件不存在 " + asset)
for p in ("offline.html", "css/paper.css", "css/syntax.css", "js/paper.js"):
    ck((ROOT / p).exists(), "原有预缓存文件缺失 " + p)

# ---------------------------------------------------------------- JS 语法
for js in ("js/xiuxing-runtime.js", "js/xiuxing-atlas.js",
           "js/xiuxing-practice-data.js", "js/xiuxing-practice.js", "sw.js"):
    r = subprocess.run(["node", "--check", str(ROOT / js)], capture_output=True, text=True)
    ck(r.returncode == 0, "JS 语法错误 %s：%s" % (js, r.stderr.strip()[:150]))


# ---------------------------------------------------------------- 行序与跟练层
pr = yaml.safe_load((ROOT / "_data/xiuxing/practice.yml").read_text(encoding="utf-8"))
ck(isinstance(pr, dict), "practice.yml 应为字典")
if isinstance(pr, dict):
    ck(len(pr.get("days", [])) == 7, "七日入手应为 7 天")
    ck(len(pr.get("cards", [])) == 31, "行持卡应为 31 张，实际 %d" % len(pr.get("cards", [])))
    ck(bool(pr.get("defaults", {}).get("note")), "practice.yml 缺 defaults.note")
    ck(len(pr.get("schools", [])) == 3, "「我的一门」坐标应为 3 套")
    for sc in pr.get("schools", []):
        for field in ("key", "name", "brief", "fields", "orbit", "passes", "source"):
            ck(bool(sc.get(field)), "坐标 %s 缺 %s" % (sc.get("key"), field))
    url2id = {}
    for v in vols:
        vd = yaml.safe_load((ROOT / "_data/xiuxing" / (v["key"] + ".yml")).read_text(encoding="utf-8"))
        for it in vd["items"]:
            url2id[Path(it["url"]).stem] = it["n"]
    ck(set(url2id.values()) == {c["id"] for c in pr["cards"]}, "行持卡图号与卷 yml 不一致")
    for c in pr["cards"]:
        ck(url2id.get(c.get("slug")) == c.get("id"), "%s 的 slug 与卷 yml 不符" % c.get("id"))
        ck(bool(c.get("note")), "%s 缺 note" % c.get("id"))
        ck(len(c.get("note", "")) >= 12, "%s 的 note 过短" % c.get("id"))
    djs = ROOT / "js/xiuxing-practice-data.js"
    ck(djs.exists(), "缺 js/xiuxing-practice-data.js")
    if djs.exists():
        dm = re.search(r"window\.__XIUXING_PRACTICE=(\{.*\});", djs.read_text(encoding="utf-8"))
        ck(bool(dm), "practice-data.js 不是预期的赋值格式")
        if dm:
            want = dict(pr)
            want["bySlug"] = {c["slug"]: c["id"] for c in pr["cards"]}
            try:
                ck(json.loads(dm.group(1)) == want,
                   "practice-data.js 与 practice.yml 不一致，跑 python scripts/xiuxing-verify.py --sync")
            except json.JSONDecodeError as e:
                ERRORS.append("practice-data.js 不是合法 JSON：" + str(e))
    for slug in url2id:
        page = (ROOT / "xiuxing" / (slug + ".html")).read_text(encoding="utf-8")
        ck("xiuxing-practice-data.js" in page and "xiuxing-practice.js" in page,
           slug + " 未接入跟练脚本")
    for asset in ("js/xiuxing-practice-data.js", "js/xiuxing-practice.js"):
        ck("'" + asset + "'" in sw, "sw.js 预缓存缺 " + asset)
        ck((ROOT / asset).exists(), "跟练资源缺失 " + asset)
    # 浮层只能贴右下：图页底部是满屏控制条（阶段／导览／复位）加操作提示，贴左会压住它们
    pjs = (ROOT / "js/xiuxing-practice.js").read_text(encoding="utf-8")
    ck(".xp-root{position:fixed;right:16px;bottom:16px" in pjs,
       "跟练浮层须贴右下角（right:16px;bottom:16px）；贴左会压住图页底部控制条")
    # 文案随位置走：浮层贴右下后，页面里不能再写「图页左下角」
    stale = [p.name for p in list((ROOT / "xiuxing").glob("*.html")) +
             list((ROOT / "_includes").glob("*.html"))
             if "图页左下角" in p.read_text(encoding="utf-8")]
    ck(not stale, "文案与浮层位置不符（仍写「图页左下角」）：" + ", ".join(stale))
    # 七日回顾：方案组件之一，别在后续改动里被顺手删掉
    ck("function renderWeek" in pjs and "xp-week" in pjs and "七日回顾" in pjs,
       "跟练浮层缺七日回顾（renderWeek / xp-week / 七日回顾）")

# ---------------------------------------------------------------- 结果
print("卷册 %d 卷 / 图目 %d 张 / 新图 %d 张 / 术语 %d 条" %
      (len(vols), total, len(new_slugs), len(gl) if isinstance(gl, list) else -1))
if WARNS:
    for w in WARNS:
        print("WARN", w)
if ERRORS:
    for e in ERRORS:
        print("FAIL", e)
    print("校验未通过：%d 项" % len(ERRORS))
    sys.exit(1)
print("全部校验通过")
