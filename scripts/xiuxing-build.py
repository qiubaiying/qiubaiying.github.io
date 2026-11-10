#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
xiuxing-build.py —— 新增 3D 图谱生成器

数据源：_data/xiuxing/pages/*.json（既有 21 图配置，由 xiuxing-extract.mjs 反解）
产出：
  _data/xiuxing/pages/<slug>.json   新图完整配置
  xiuxing/<slug>.html               共享运行时页面（约 12 KB，无 front matter）
  xiuxing/cover-<slug>.png          静态总览 / 卡片封面（WebGL 回退用）
  img/og/xiuxing-<slug>.png         1200x630 分享卡

用法：python scripts/xiuxing-build.py [--no-images]
新增一张图：在 SPECS 增加一个构造函数，再跑一次本脚本。
"""
import copy
import html
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "_data/xiuxing/pages"
XIU = ROOT / "xiuxing"
OGDIR = ROOT / "img/og"
SITE = "https://jimadela.github.io"

PAPER = "#ece7dc"
INK = "#262824"
DIM = "#6b6a62"
RULE = "#d5cfc0"
ACCENT = "#c4442c"
GOLD = "#b0842c"
TEAL = "#4c817a"

F_CN = "C:/Windows/Fonts/msyh.ttc"
F_CN_B = "C:/Windows/Fonts/msyhbd.ttc"
F_MONO = "C:/Windows/Fonts/consola.ttf"


def load(slug):
    return json.loads((PAGES / (slug + ".json")).read_text(encoding="utf-8"))


BASE = load("shierjing")
QI = load("qijingbamai")
WZ = load("wuzang")
XX = load("xiaoxi")
NE = load("neijingtu")

V12 = BASE["vessels"]
C12 = {k: v for k, v in BASE["curves"].items() if k not in ("du", "ren")}
DU = BASE["curves"]["du"]
REN = BASE["curves"]["ren"]


def new_cfg(slug, title, kicker, subtitle, disclaimer, stage_label):
    c = copy.deepcopy(BASE)
    c.update({
        "id": slug, "slug": slug, "title": title, "kicker": kicker,
        "subtitle": subtitle, "disclaimer": disclaimer,
        "stageLabel": stage_label, "cover": "cover-" + slug + ".png",
        "backLabel": "返回修仙", "backHref": "./", "duration": 120,
        "breath": 24, "breathLabels": ["相位 · 前半", "相位 · 后半"],
        "extras": {"spine": True, "spineCurve": "du", "belt": True, "big": True},
        "gates": [], "tour": copy.deepcopy(BASE["tour"]),
    })
    return c


def vessel(v, vid, label, color, hot, opacity, group=None, short=None):
    d = copy.deepcopy(v)
    d.update({"id": vid, "label": label, "short": short or d.get("short", label),
              "color": color, "hot": hot, "baseOpacity": opacity})
    if group is not None:
        d["group"] = group
    return d


def stage(n, name, en, desc, hint, groups, store=20, pool=None):
    hot = {"type": "sequential", "poolIds": pool} if pool else {"type": "sequential", "group": groups[0]}
    return {
        "n": n, "name": name, "en": en, "desc": desc, "hint": hint,
        "path": {"type": "activeVessel"}, "hotRule": hot,
        "vesselFilter": groups, "chipRule": "vesselGroup",
        "siteRule": "activeVessel", "hot": {}, "intensity": 0.55, "store": store,
    }


def node(nid, name, sub, p, steps, ntype="node", side=1):
    return {"id": nid, "name": name, "sub": sub, "p": p,
            "type": ntype, "side": side, "steps": steps}


def metric(mid, label, unit, source, mx, bar=None):
    d = {"id": mid, "label": label, "unit": unit, "source": source, "max": mx}
    if bar:
        d["bar"] = bar
    return d


def chips(title, en, items):
    return {"title": title, "en": en, "items": items, "on": " · 当令", "off": " · —"}


def legend(items):
    return [{"key": k, "label": l} for k, l in items]


def mid_point(pts):
    p = pts[len(pts) // 2]
    return [round(p[0], 2), round(p[1], 2), round(p[2], 2)]


def derived_curves(suffix, dz=0.0, branch=False):
    out = {"du": DU, "ren": REN}
    for k, pts in C12.items():
        if branch:
            m = pts[len(pts) // 2]
            out["l_" + k] = [
                [round(m[0], 3), round(m[1], 3), round(m[2], 3)],
                [round(m[0] * 0.62, 3), round(m[1] - 0.28, 3), round(m[2] + 0.2, 3)],
                [0.28, round(m[1] - 0.55, 3), 0.7],
            ]
        else:
            out[suffix + "_" + k] = [
                [round(p[0], 3), round(p[1], 3), round(p[2] + dz, 3)] for p in pts
            ]
    return out


def pick_ring(obj, exclude=("du", "ren")):
    for k, v in obj.get("curves", {}).items():
        if k not in exclude and len(v) >= 3:
            return k, v
    return None, None


# --------------------------------------------------------------------------
# 卷 F · 经络补遗
# --------------------------------------------------------------------------

CATS = ["五输穴", "原络穴", "郄募俞穴", "八会交会", "三田三关"]
ACU = [
    ("少商", 0, "手太阴肺经", [2.35, 8.05, 0.22], "井穴，肺经气所出，见《灵枢·本输》"),
    ("鱼际", 0, "手太阴肺经", [2.20, 8.35, 0.24], "荥穴，肺经气所溜"),
    ("太渊", 0, "手太阴肺经", [2.05, 8.80, 0.26], "输穴兼原穴，脉会太渊"),
    ("经渠", 0, "手太阴肺经", [1.90, 9.60, 0.28], "经穴，肺经气所行"),
    ("尺泽", 0, "手太阴肺经", [1.75, 10.60, 0.30], "合穴，肺经气所入"),
    ("足三里", 0, "足阳明胃经", [0.85, 4.20, 0.50], "胃经合穴，亦为下合穴"),
    ("合谷", 1, "手阳明大肠经", [2.30, 8.10, 0.40], "大肠经原穴，四总穴之一"),
    ("列缺", 1, "手太阴肺经", [2.10, 9.00, 0.30], "肺经络穴，通任脉"),
    ("内关", 1, "手厥阴心包经", [2.00, 10.00, -0.25], "心包络穴，通阴维脉"),
    ("外关", 1, "手少阳三焦经", [2.10, 10.20, -0.30], "三焦络穴，通阳维脉"),
    ("神门", 1, "手少阴心经", [2.20, 8.60, -0.22], "心经原穴"),
    ("太冲", 1, "足厥阴肝经", [0.80, 1.20, 0.40], "肝经原穴"),
    ("孔最", 2, "手太阴肺经", [1.98, 9.90, 0.29], "肺经郄穴"),
    ("中脘", 2, "任脉", [0.00, 10.70, 0.85], "胃之募穴，又为腑会"),
    ("膻中", 2, "任脉", [0.00, 12.10, 0.82], "心包募穴，又为气会"),
    ("关元", 2, "任脉", [0.00, 7.35, 0.34], "小肠募穴，丹道多指此处为下丹田"),
    ("肺俞", 2, "足太阳膀胱经", [0.55, 12.60, -0.75], "肺之背俞穴"),
    ("肾俞", 2, "足太阳膀胱经", [0.55, 8.90, -0.78], "肾之背俞穴"),
    ("大椎", 3, "督脉", [0.00, 13.30, -0.74], "手足三阳与督脉交会"),
    ("百会", 3, "督脉", [0.00, 16.62, 0.00], "督脉与足太阳交会，真法指为上丹田"),
    ("章门", 3, "足厥阴肝经", [0.90, 9.60, 0.60], "脾之募穴，又为脏会"),
    ("阳陵泉", 3, "足少阳胆经", [1.00, 4.00, 0.45], "胆经合穴，又为筋会"),
    ("悬钟", 3, "足少阳胆经", [0.90, 1.80, 0.45], "髓会"),
    ("膈俞", 3, "足太阳膀胱经", [0.55, 11.80, -0.76], "血会"),
    ("上丹田 · 百会", 4, "真气运行法", [0.00, 16.62, 0.00], "真法三田之上田，在头顶百会，与丹道泥丸不同"),
    ("中丹田 · 心窝", 4, "真气运行法", [0.00, 12.10, 0.85], "真法三田之中田，在心窝部，与丹道绛宫不同"),
    ("下丹田 · 小腹", 4, "真气运行法", [0.00, 7.85, 0.62], "真法三田之下田，在小腹部"),
    ("尾闾", 4, "丹道通行", [0.00, 5.30, 0.00], "三关之一，位置异说见术语表"),
    ("夹脊", 4, "丹道通行", [0.00, 10.35, -0.82], "三关之一，位置异说见术语表"),
    ("玉枕", 4, "丹道通行", [0.00, 15.05, -0.55], "三关之一，位置异说见术语表"),
]


def f0_acupoints():
    c = new_cfg(
        "xuewei", "穴位全图 · 五输与原络郄募俞", "ACUPOINTS ATLAS",
        "穴位分层 · 五类三十穴",
        "示意性可视化，非医疗或修炼指导；穴位与循行线为教学示意，不承诺定位精度，不作取穴依据",
        "穴位次第",
    )
    c["curves"] = copy.deepcopy(BASE["curves"])
    c["vessels"] = [vessel(v, v["id"], v["label"], v["color"], v["hot"], 0.26)
                    for v in V12]
    c["nodes"] = [
        node("acu%02d" % i, name, CATS[cat] + " · " + meridian, p,
             [cat + 1], "tian" if cat == 4 else "node", 0 if p[0] == 0 else 1)
        for i, (name, cat, meridian, p, _note) in enumerate(ACU)
    ]
    descs = [
        "井、荥、输、经、合五穴，依《灵枢·本输》以经气由浅入深为序；此处以手太阴肺经为主例，另标胃经合穴足三里。",
        "原穴为脏腑原气经过留止之处，络穴为经脉分支联络表里之处；十五络脉另见 F3。",
        "郄穴主急症、募俞分胸腹与背腰；此处取肺经郄穴孔最与任脉三募、膀胱经二俞作示意。",
        "八会穴见《难经·四十五难》，交会穴为多经相交之处；取督脉大椎、百会与四会穴示意。",
        "真气运行法三田（百会、心窝、小腹）与丹道通行三田（泥丸、绛宫、气海）定位不同，本栏目不互相套用，见术语表。",
    ]
    ens = ["FIVE SHU", "YUAN & LUO", "XI MU SHU", "EIGHT HUI", "THREE FIELDS"]
    c["stages"] = [
        stage(i + 1, CATS[i], ens[i], descs[i],
              "按 1–5 切换穴位类别；空间位置为教学示意，不承诺定位精度。",
              [0, 1, 2, 3], 20 + i * 6,
              pool=[v["id"] for v in c["vessels"]])
        for i in range(5)
    ]
    c["metrics"] = [
        metric("active", "当令穴类", "/5", "activeIndex", 5),
        metric("flow", "相位推进", "%", "flow", 100),
        metric("count", "背景经脉", "经", "vesselCount", 12, "fixed"),
        metric("cycles", "巡览周数", "周", "cycles", 9, "phase"),
    ]
    c["chips"] = chips("五类穴位", "FIVE GROUPS", CATS)
    c["legend"] = legend([
        ("shu", "五输穴"), ("yuan", "原络穴"), ("xi", "郄募俞"),
        ("hui", "八会交会"), ("tian", "三田三关"), ("bg", "十二经背景"),
    ])
    c["acupoints"] = [
        {"id": "acu%02d" % i, "name": n, "cat": CATS[cat],
         "meridian": mer, "note": note, "step": cat + 1}
        for i, (n, cat, mer, _p, note) in enumerate(ACU)
    ]
    c["notes"] = ["《灵枢·本输》《灵枢·九针十二原》", "《灵枢·经脉》（十五络）",
                  "《难经·四十五难》（八会穴）", "《针灸甲乙经》（募俞穴）",
                  "真气运行法公开所述三田定位", "异说见 glossary.yml 三田、三关条"]
    return c


def f_layer(slug, title, kicker, subtitle, stage_label, suffix, dz, branch,
            color, hot, opacity, groups_desc, ens, disclaimer, notes):
    c = new_cfg(slug, title, kicker, subtitle, disclaimer, stage_label)
    cs = derived_curves(suffix, dz, branch)
    if branch:
        cs["luo_ren"] = [[0, 10.7, 0.85], [0.45, 10.2, 0.8], [0.9, 9.6, 0.6]]
        cs["luo_du"] = [[0, 13.3, -0.74], [0.5, 12.9, -0.6], [0.95, 12.4, -0.35]]
        cs["luo_spleen"] = [[0.6, 9.0, 0.6], [1.1, 8.6, 0.55], [1.5, 8.1, 0.4]]
    c["curves"] = cs
    ids = [k for k in cs if k not in ("du", "ren")]
    vs = []
    for i, k in enumerate(ids):
        src = V12[i] if i < len(V12) else V12[-1]
        vs.append(vessel(src, k, src["label"].replace("经", groups_desc[0]),
                         color, hot, opacity, src["group"] if i < len(V12) else 4,
                         src["short"] + groups_desc[1]))
    c["vessels"] = vs
    c["nodes"] = []
    for gi in range(4):
        pool = [v for v in vs if v["group"] == gi]
        for v in pool[:3]:
            pts = cs[v["id"]]
            c["nodes"].append(node(v["id"], v["short"], groups_desc[2],
                                   mid_point(pts), [gi + 1], "node", 1))
    c["stages"] = []
    for gi, (nm, en, desc, hint) in enumerate(groups_desc[4]):
        c["stages"].append(stage(gi + 1, nm, en, desc, hint, [gi], 20 + gi * 6,
                                 pool=[v["id"] for v in vs if v["group"] == gi]))
    c["stages"].append(stage(5, "合而观之", ens[4],
                             "四条层次同屏，可见同一起源在不同组织层上的展开；此为结构示意，非解剖层次复原。",
                             "按 V 换机位；按 E 拆解人体部件。", [0, 1, 2, 3, 4] if branch else [0, 1, 2, 3],
                             52, pool=[v["id"] for v in vs]))
    c["metrics"] = [
        metric("count", groups_desc[5], "条", "vesselCount", len(vs), "fixed"),
        metric("active", "当令层次", "/5", "activeIndex", 5),
        metric("flow", "相位推进", "%", "flow", 100),
        metric("cycles", "巡览周数", "周", "cycles", 9, "phase"),
    ]
    c["chips"] = chips(groups_desc[6], ens[5], [x[0] for x in groups_desc[4]] + ["合观"])
    c["legend"] = legend([(ens[i].lower().replace(" ", ""), groups_desc[4][i][0])
                          for i in range(4)] + [("all", "合而观之")])
    c["notes"] = notes
    return c


def f1_jingjin():
    gs = ("筋", "·筋", "经筋结聚", "经筋", None, "经筋总数", "四类经筋")
    groups = [
        ("手三阴筋", "CHEST TO HAND", "手三阴之筋起于手指，循臂内上行结于胸中。", "依《灵枢·经筋》，经筋「结」「聚」于关节，不入脏腑。"),
        ("手三阳筋", "HAND TO HEAD", "手三阳之筋起于手指，循臂外上行结于头面。", "经筋走向由十二正经示意派生，非独立定位数据。"),
        ("足三阳筋", "HEAD TO FOOT", "足三阳之筋自头面下行，经躯干外侧结于足。", "按 E 可散开部件，看筋线与骨性标志的相对位置。"),
        ("足三阴筋", "FOOT TO BELLY", "足三阴之筋自足上行，循股内结于腹。", "四条层次共用一具底模，便于对照而非主张同源。"),
    ]
    return f_layer(
        "jingjin", "十二经筋 · 筋之维系", "TWELVE SINEW CHANNELS",
        "经筋层次 · 结聚关节", "经筋次第", "j", 0.18, False,
        "#8a6a22", "#dfa336", 0.6, (gs[0], gs[1], gs[2], gs[3], groups, gs[5], gs[6]),
        ["SINEW YIN", "SINEW YANG", "LEG YANG", "LEG YIN", "ALL LAYERS", "FOUR GROUPS"],
        "示意性可视化，非医疗或修炼指导；经筋依《灵枢·经筋》整理，曲线由十二正经示意派生，不承诺定位精度",
        ["《灵枢·经筋》十二经筋", "经筋「结、聚、散、络」为结构描述，非解剖学筋膜"],
    )


def f2_pibu():
    groups = [
        ("太阳皮部", "TAIYANG", "太阳为开，皮部居表，卫气最先达于此。", "《素问·皮部论》：「皮有分部，脉有经纪」；开阖枢为三阴三阳之气机描述。"),
        ("阳明皮部", "YANGMING", "阳明为阖，皮部在躯干正面与四肢外侧前缘。", "皮部范围由十二正经示意外扩，非体表分区实测。"),
        ("少阳皮部", "SHAOYANG", "少阳为枢，皮部居身侧，介于表里之间。", "颜色与透明度只作分层标识，不表示深浅或强度。"),
        ("三阴皮部", "THREE YIN", "太阴为开、厥阴为阖、少阴为枢，合为三阴之表。", "按 C 切换剖切模式，可看皮部与内部脏腑的相对层次。"),
    ]
    gs = ("部", "·部", "皮部分区", "皮部", None, "皮部总数", "四类皮部")
    return f_layer(
        "pibu", "十二皮部 · 卫气之表", "TWELVE SKIN REGIONS",
        "皮部层次 · 开阖枢", "皮部次第", "p", 0.42, False,
        "#4c817a", "#7fbfae", 0.38, (gs[0], gs[1], gs[2], gs[3], groups, gs[5], gs[6]),
        ["TAIYANG", "YANGMING", "SHAOYANG", "THREE YIN", "ALL LAYERS", "FOUR REGIONS"],
        "示意性可视化，非医疗或修炼指导；皮部依《素问·皮部论》整理，分区由十二正经示意外扩，不承诺定位精度",
        ["《素问·皮部论》", "《灵枢·营卫生会》卫气在脉外", "开阖枢见《素问·阴阳离合论》"],
    )


def f3_luomai():
    groups = [
        ("经别之离", "DIVERGENCE", "十二经别从正经别出，深入体腔，是「离」。", "《灵枢·经别》述六合：经别离、入、出、合。"),
        ("经别之合", "CONVERGENCE", "表里两经的经别在头面或躯干相合，是「合」。", "分支曲线为结构示意，不是独立循行实测数据。"),
        ("十五络脉", "FIFTEEN LUO", "十二经络穴加任、督之络与脾之大络，合为十五络。", "《灵枢·经脉》列十五络穴与各自循行，此图只作关系示意。"),
        ("表里相合", "INTERIOR EXTERIOR", "络脉沟通表里两经，使十二经不只是一条条孤立的线。", "按 V 换机位，可看分支如何从本经斜出走向躯干中线。"),
    ]
    gs = ("络", "·络", "络脉分支", "络脉", None, "络脉总数", "四类离合")
    return f_layer(
        "luomai", "十五络脉与十二经别", "LUO & DIVERGENT CHANNELS",
        "离合出入 · 表里相合", "络脉次第", "l", 0.0, True,
        "#9b3a26", "#e8734c", 0.62, (gs[0], gs[1], gs[2], gs[3], groups, gs[5], gs[6]),
        ["DIVERGENCE", "CONVERGENCE", "FIFTEEN LUO", "PAIRING", "ALL LAYERS", "FOUR PHASES"],
        "示意性可视化，非医疗或修炼指导；络脉与经别依《灵枢·经脉》《灵枢·经别》整理，分支为示意派生，不承诺定位精度",
        ["《灵枢·经脉》十五络脉", "《灵枢·经别》六合", "络穴名称见 B0 与 F0 穴位全图"],
    )


# --------------------------------------------------------------------------
# 卷 G · 通览与异说
# --------------------------------------------------------------------------

def g0_he():
    c = new_cfg(
        "hecan", "五卷合图 · 一具人体同屏", "ATLAS OVERLAY",
        "图层叠合 · 五卷同参", "图层次第",
        "示意性可视化，非医疗或修炼指导；不同时代的身体观叠于同一具底模只为对照结构，不主张其出自同一体系",
    )
    cs = {"du": DU, "ren": REN}
    for k, v in C12.items():
        cs["b_" + k] = v
    for k, v in QI.get("curves", {}).items():
        if k not in ("du", "ren") and len(v) >= 3:
            cs["b_" + k] = v
    rk, rv = pick_ring(WZ)
    if rv:
        cs["c_" + rk] = rv
    rk2, rv2 = pick_ring(XX)
    if rv2:
        cs["d_" + rk2] = rv2
    rk3, rv3 = pick_ring(NE)
    if rv3:
        cs["e_" + rk3] = rv3
    c["curves"] = cs

    vs = []
    vs.append(vessel(V12[0], "du", "督脉 · A 卷路径", "#9b3a26", "#e85c34", 0.8, 0, "督脉"))
    vs.append(vessel(V12[0], "ren", "任脉 · A 卷路径", "#8a6a22", "#dfa336", 0.8, 0, "任脉"))
    for v in V12:
        vs.append(vessel(v, "b_" + v["id"], v["label"] + " · B 卷网络",
                         v["color"], v["hot"], 0.5, 1, v["short"]))
    for v in QI.get("vessels", []):
        if v["id"] in ("du", "ren"):
            continue
        vs.append(vessel(v, "b_" + v["id"], v["label"] + " · B 卷网络",
                         v.get("color", "#8a6a22"), v.get("hot", "#dfa336"), 0.55, 1,
                         v.get("short", v["label"])))
    for pref, label, col, hot in (("c_", "C 卷 · 五行关系环", "#b0842c", "#dfa336"),
                                  ("d_", "D 卷 · 卦气刻度环", "#3f6f68", "#6fc4b0"),
                                  ("e_", "E 卷 · 古图隐喻环", "#993c1d", "#e8734c")):
        keys = [k for k in cs if k.startswith(pref)]
        if keys:
            gi = {"c_": 2, "d_": 3, "e_": 4}[pref]
            vs.append(vessel(V12[0], keys[0], label, col, hot, 0.6, gi, label[:4]))
    c["vessels"] = vs
    c["curves"] = {k: cs[k] for k in [v["id"] for v in vs] if k in cs}
    c["curves"]["du"] = DU
    c["curves"]["ren"] = REN

    c["nodes"] = [
        node("ov_a", "A · 路径", "任督一圈 · 内丹次第", [0, 10.7, 0.85], [1], "tian", 0),
        node("ov_b", "B · 网络", "十二正经与奇经八脉", [1.9, 10.2, 0.3], [2], "tian", 1),
        node("ov_c", "C · 关系", "五脏与五行生克", [0.9, 9.0, 0.6], [3], "tian", 1),
        node("ov_d", "D · 刻度", "卦气、时辰与火候", [0, 13.3, -0.74], [4], "tian", 0),
        node("ov_e", "E · 图式", "隐喻逐件标回人体", [0, 7.35, 0.34], [5], "tian", 0),
        node("ov_all", "同屏", "五种问法 · 同一具底模", [0, 16.62, 0], [6], "tian", 0),
    ]
    st = [
        ("A 问路径", "ASK THE PATH", "内丹卷只取任督一圈作路径骨架，问的是「气怎么走」。", "先只看 A 组图层，再逐层叠加。", [0]),
        ("B 问网络", "ASK THE NETWORK", "经络卷把这张网拆成十二正经、奇经八脉、时辰与营卫。", "底模相同不等于体系相同。", [1]),
        ("C 问关系", "ASK THE RELATION", "脏腑卷问五脏之间的生克制化与气机升降。", "五行环是关系线，不是解剖结构。", [2]),
        ("D 问刻度", "ASK THE SCALE", "火候卷借卦气、月相与宿度把时间刻度画成环。", "刻度是符号层，不作时刻建议。", [3]),
        ("E 问图式", "ASK THE DIAGRAM", "古图卷把山水、星宿等隐喻逐件标回人体。", "是概念对照，不是古画数字复原。", [4]),
        ("五卷同屏", "ALL TOGETHER", "五组图层同屏，便于看出同一具身体上压着不同时代的身体观。", "按 1–6 切层；按 H 隐藏面板。", [0, 1, 2, 3, 4]),
    ]
    c["stages"] = [stage(i + 1, *s[:4], s[4], 20 + i * 8,
                         pool=[v["id"] for v in vs if v["group"] in s[4]])
                   for i, s in enumerate(st)]
    c["metrics"] = [
        metric("count", "同屏脉络", "条", "vesselCount", len(vs), "fixed"),
        metric("active", "当令卷次", "/6", "activeIndex", 6),
        metric("flow", "相位推进", "%", "flow", 100),
        metric("cycles", "巡览周数", "周", "cycles", 9, "phase"),
    ]
    c["chips"] = chips("五卷图层", "FIVE VOLUMES",
                       ["A 路径", "B 网络", "C 关系", "D 刻度", "E 图式", "同屏"])
    c["legend"] = legend([("a", "A 路径"), ("b", "B 网络"), ("c", "C 关系"),
                          ("d", "D 刻度"), ("e", "E 图式"), ("all", "同屏")])
    c["notes"] = ["A–E 五卷图目见 /xiuxing/", "源流层位见总览 #lineage",
                  "底模与性别边界见总览「体系边界」", "叠图只为对照结构，不主张同源"]
    return c


def g1_yishuo():
    c = new_cfg(
        "santian", "三田三关 · 异说对照", "THREE FIELDS IN CONTRAST",
        "同名异实 · 两套定位", "对照次第",
        "示意性可视化，非医疗或修炼指导；两套三田定位各依其所述体系标注，不互相套用，三关位置历代有出入",
    )
    c["curves"] = {"du": DU, "ren": REN}
    c["vessels"] = [
        vessel(V12[0], "du", "督脉", "#9b3a26", "#e85c34", 0.5, 0, "督脉"),
        vessel(V12[0], "ren", "任脉", "#8a6a22", "#dfa336", 0.5, 0, "任脉"),
    ]
    c["nodes"] = [
        node("zf_s", "上丹田 · 百会", "真法：头顶百会", [0, 16.62, 0], [1], "tian", 0),
        node("zf_m", "中丹田 · 心窝", "真法：心窝部", [0, 12.1, 0.85], [1], "tian", 0),
        node("zf_x", "下丹田 · 小腹", "真法：小腹部", [0, 7.85, 0.62], [1], "tian", 0),
        node("dd_s", "上丹田 · 泥丸", "丹道：泥丸（脑中）", [0, 15.55, 0.8], [2], "tian", 0),
        node("dd_m", "中丹田 · 绛宫", "丹道：绛宫（心下）", [0, 11.6, 0.84], [2], "tian", 0),
        node("dd_x", "下丹田 · 气海", "丹道：气海／关元一带", [0, 7.35, 0.34], [2], "tian", 0),
        node("g1", "尾闾", "三关之一 · 位置有异说", [0, 5.3, 0], [3], "tian", 0),
        node("g2", "夹脊", "三关之一 · 位置有异说", [0, 10.35, -0.82], [3], "tian", 0),
        node("g3", "玉枕", "三关之一 · 位置有异说", [0, 15.05, -0.55], [3], "tian", 0),
    ]
    c["stages"] = [
        stage(1, "真法三田", "ZHENQI FIELDS",
              "真气运行法公开所述：上丹田在头顶百会，中丹田在心窝部，下丹田在小腹部。",
              "此定位依李少波真气运行研究所公开所述，见 N1；不与丹道三田混用。",
              [0], 20, pool=["du", "ren"]),
        stage(2, "丹道三田", "DANDAO FIELDS",
              "丹道通行说法：上丹田泥丸、中丹田绛宫、下丹田气海，与真法三田定位不同。",
              "历代丹书对三田位置另有异说，统一记在术语表，不强行调和。",
              [0], 32, pool=["du", "ren"]),
        stage(3, "三关异说", "THREE PASSES",
              "尾闾、夹脊、玉枕为通行三关；另有以天柱、神道、命门为三关等说法。",
              "本栏目已删去未核原句，只保留「位置有异说」的口径，不作定点结论。",
              [0], 44, pool=["du", "ren"]),
    ]
    c["metrics"] = [
        metric("count", "背景经脉", "条", "vesselCount", 2, "fixed"),
        metric("active", "当令体系", "/3", "activeIndex", 3),
        metric("flow", "相位推进", "%", "flow", 100),
        metric("cycles", "巡览周数", "周", "cycles", 9, "phase"),
    ]
    c["chips"] = chips("三套对照", "THREE VIEWS", ["真法三田", "丹道三田", "三关异说"])
    c["legend"] = legend([("zf", "真法三田"), ("dd", "丹道三田"), ("pass", "三关"), ("bg", "任督背景")])
    c["notes"] = ["真气运行法三田：兰州李少波真气运行研究所公开所述",
                  "丹道三田：明清丹书通行说法", "异说见 glossary.yml「三田」「三关」条",
                  "总览「异说保留在术语表」条"]
    return c


SPECS = [f0_acupoints, f1_jingjin, f2_pibu, f3_luomai, g0_he, g1_yishuo]


# --------------------------------------------------------------------------
# 页面、封面、分享卡
# --------------------------------------------------------------------------

HEAD = """<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title} - 无意 Blog</title>
<meta name="description" content="{desc}">
<meta name="author" content="WY">
<meta name="theme-color" content="#ece7dc">
<link rel="canonical" href="{canonical}">
<link rel="icon" href="../img/favicon.ico">
<meta property="og:type" content="website">
<meta property="og:site_name" content="无意 Blog">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{og_image}">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/css/xiuxing-3d.css">
</head>
<body>
<div id="app"></div>
<script>window.__XIUXING_CONFIG={config};</script>
<script type="module" src="/js/xiuxing-runtime.js"></script>
<script src="/js/xiuxing-atlas.js" defer></script>
</body>
</html>
"""


def write_page(c):
    desc = html.escape(c["title"] + "：" + c["subtitle"] + "。" + c["disclaimer"], quote=True)
    cfg = json.dumps(c, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    page = HEAD.format(
        title=html.escape(c["title"]),
        desc=desc,
        canonical="%s/xiuxing/%s.html" % (SITE, c["slug"]),
        og_image="%s/img/og/xiuxing-%s.png" % (SITE, c["slug"]),
        config=cfg,
    )
    (XIU / (c["slug"] + ".html")).write_text(page, encoding="utf-8")


def wrap(text, fnt, maxw):
    lines, cur = [], ""
    for ch in text:
        if fnt.getlength(cur + ch) > maxw and cur:
            lines.append(cur)
            cur = ch
        else:
            cur += ch
    if cur:
        lines.append(cur)
    return lines


def cover(c, out):
    W, H = 2000, 1125
    im = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(im)
    for x in range(0, W, 100):
        d.line((x, 0, x, H), fill="#e0dacb", width=1)
    for y in range(0, H, 100):
        d.line((0, y, W, y), fill="#e0dacb", width=1)
    d.rectangle((0, 0, W, 8), fill=ACCENT)
    d.line((70, 108, W - 70, 108), fill=RULE, width=2)

    mono = ImageFont.truetype(F_MONO, 26)
    small = ImageFont.truetype(F_CN, 24)
    body = ImageFont.truetype(F_CN, 28)
    big = ImageFont.truetype(F_CN_B, 68)
    d.text((78, 46), "XIUXING / ATLAS", font=mono, fill=ACCENT)
    d.text((W - 470, 46), "3D STRUCTURAL MODEL", font=mono, fill=DIM)

    y = 150
    for line in wrap(c["title"], big, 660):
        d.text((78, y), line, font=big, fill=INK)
        y += 88
    y += 18
    d.text((80, y), c["kicker"], font=mono, fill=GOLD)
    y += 56
    d.text((80, y), c["subtitle"], font=body, fill=DIM)
    y += 76
    d.line((78, y, 700, y), fill=ACCENT, width=3)
    y += 34
    d.text((80, y), c["stageLabel"] + " / STAGES", font=small, fill=DIM)
    y += 44
    for i, s in enumerate(c["stages"]):
        active = i == 0
        d.rounded_rectangle((78, y, 690, y + 52), radius=6,
                            fill="#dfd8c8" if active else PAPER,
                            outline=ACCENT if active else RULE, width=2 if active else 1)
        d.text((94, y + 10), "%d" % (i + 1), font=mono, fill=ACCENT if active else DIM)
        d.text((140, y + 9), s["name"], font=small, fill=INK if active else DIM)
        y += 62

    cx, top, sc = 1190, 150, 51
    def proj(p):
        return (cx + p[0] * sc * 1.9, top + (17 - p[1]) * sc)

    shade = "#e2dccb"
    d.ellipse((cx - 30, top + 10, cx + 30, top + 84), fill=shade, outline="#bdb6a5", width=2)
    d.polygon([(cx - 20, top + 84), (cx + 20, top + 84),
               (cx + 34, top + 380), (cx - 34, top + 380)], fill=shade)
    d.line((cx - 52, top + 150, cx - 95, top + 430), fill=shade, width=16)
    d.line((cx + 52, top + 150, cx + 95, top + 430), fill=shade, width=16)
    d.line((cx - 18, top + 380, cx - 34, top + 850), fill=shade, width=18)
    d.line((cx + 18, top + 380, cx + 34, top + 850), fill=shade, width=18)
    d.line((cx, top + 84, cx, top + 380), fill="#d3ccba", width=2)
    palette = [ACCENT, GOLD, TEAL, "#3f6f68", "#8a6a22", "#993c1d"]
    keys = [k for k in c["curves"] if k not in ("du", "ren")][:12]
    for i, k in enumerate(keys):
        pts = c["curves"][k]
        if len(pts) < 2:
            continue
        d.line([proj(p) for p in pts], fill=palette[i % len(palette)], width=4, joint="curve")
    for p in (DU, REN):
        d.line([proj(x) for x in p], fill=GOLD, width=5, joint="curve")
    for n in c["nodes"][:8]:
        x, y2 = proj(n["p"])
        d.ellipse((x - 6, y2 - 6, x + 6, y2 + 6), fill=ACCENT, outline=PAPER, width=2)

    px = 1520
    d.rounded_rectangle((px, 150, W - 70, 620), radius=8, fill="#f4f0e6", outline=RULE, width=2)
    d.text((px + 26, 176), "LIVE TELEMETRY", font=mono, fill=ACCENT)
    d.line((px + 26, 216, W - 96, 216), fill=RULE, width=2)
    rows = [
        ("PHASE", "%d%%" % 21),
        ("STAGE", "1 / %d" % len(c["stages"])),
        ("VESSELS", "%d" % len(c["vessels"])),
        ("POINTS", "%d" % len(c["nodes"])),
    ]
    yy = 244
    for k, v in rows:
        d.text((px + 26, yy), k, font=mono, fill=DIM)
        d.text((W - 190, yy), v, font=mono, fill=INK)
        yy += 56
    d.line((px + 26, yy + 6, W - 96, yy + 6), fill=RULE, width=2)
    d.text((px + 26, yy + 26), "QI INTENSITY", font=mono, fill=DIM)
    wave = [(px + 26 + i * 12, yy + 100 + (i % 7) * -8) for i in range(28)]
    d.line(wave, fill=ACCENT, width=3)

    d.line((70, H - 118, W - 70, H - 118), fill=RULE, width=2)
    d.text((78, H - 96), "E 拆解   C 玻璃体   V 换机位   S 速度   T 导览   R 复位   1-9 切次第",
           font=small, fill=DIM)
    note = "示意性可视化 · 非医疗或修炼指导 · 位置不承诺精度"
    d.text((78, H - 52), note, font=small, fill=ACCENT)
    d.text((W - 330, H - 52), "无意 BLOG / XIUXING", font=small, fill=DIM)
    im.save(out, optimize=True)


def og_card(cover_path, out):
    im = Image.open(cover_path).convert("RGB")
    W, H = im.size
    ratio = 1200 / 630
    nh = int(W / ratio)
    if nh < H:
        top = (H - nh) // 2
        im = im.crop((0, top, W, top + nh))
    im = im.resize((1200, 630), Image.LANCZOS)
    im.save(out, optimize=True)


def main():
    images = "--no-images" not in sys.argv
    OGDIR.mkdir(parents=True, exist_ok=True)
    for fn in SPECS:
        c = fn()
        (PAGES / (c["slug"] + ".json")).write_text(
            json.dumps(c, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        write_page(c)
        if images:
            cp = XIU / c["cover"]
            cover(c, cp)
            og_card(cp, OGDIR / ("xiuxing-" + c["slug"] + ".png"))
        print("%-10s %-34s vessels=%2d nodes=%2d stages=%d page=%dKB" % (
            c["slug"], c["title"], len(c["vessels"]), len(c["nodes"]),
            len(c["stages"]), (XIU / (c["slug"] + ".html")).stat().st_size // 1024))
    print("生成完成，共 %d 张图" % len(SPECS))


if __name__ == "__main__":
    main()
