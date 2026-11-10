/* ===========================================================
 * xiuxing-practice.js
 * 跟练节拍器 + 行持卡 + 本机行持日志
 * 数据来源：js/xiuxing-practice-data.js（由 _data/xiuxing/practice.yml 生成）
 * 相位基准：与 3D 运行时同为 cfg.breath / cfg.duration；吸气为每息前半。
 * 日志只写 localStorage，不上传；27 页只增本文件的一行 script 引用。
 * ========================================================== */
(function () {
  'use strict';

  var DATA = window.__XIUXING_PRACTICE;
  if (!DATA) return;

  function readConfig() {
    if (window.__XIUXING_CONFIG) return window.__XIUXING_CONFIG;
    if (window.Qg) return window.Qg;
    // 旧 21 页的打包 JS 在 <script type="module"> 里，var Qg 不是 window 属性：
    // 从脚本文本回退解析，旧页一行都不必改。
    var scripts = document.querySelectorAll('script[type="module"]');
    for (var i = 0; i < scripts.length; i++) {
      var m = (scripts[i].textContent || '').match(/var Qg=(\{[\s\S]*?\});Kg\(Qg\)/);
      if (m) {
        try { return new Function('return ' + m[1])(); } catch (e) { /* 换下一个 */ }
      }
    }
    return null;
  }

  var CFG = readConfig();
  if (!CFG) return;

  var slug = CFG.slug || CFG.id || '';
  var cardId = DATA.bySlug ? DATA.bySlug[slug] : '';
  var byId = {};
  (DATA.cards || []).forEach(function (c) { byId[c.id] = c; });
  var raw = byId[cardId] || {};
  if (!cardId) return;

  var card = {};
  Object.keys(DATA.defaults || {}).forEach(function (k) { card[k] = DATA.defaults[k]; });
  Object.keys(raw).forEach(function (k) { card[k] = raw[k]; });

  var params = new URLSearchParams(location.search);
  var breath = Math.max(1, Number(params.get('breath')) || Number(CFG.breath) || 10);
  var duration = Math.max(breath, Number(CFG.duration) || 120);
  var stages = CFG.stages || [];
  var title = CFG.title || cardId;
  var overridden = params.has('breath') && Number(params.get('breath')) !== Number(CFG.breath);

  var LOG_KEY = 'xiuxing-practice-log';
  var OPEN_KEY = 'xiuxing-practice-open';
  var CHECKS = ['睡眠', '食欲', '情绪', '人际'];

  /* ---------------------------------------------------------- 样式 */
  var css = [
    // 贴右下角：图页底部有满屏控制条（阶段按钮／导览／复位）与操作提示，左下角必然压住它们
    '.xp-root{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:flex;flex-direction:column-reverse;align-items:flex-end;font:13px/1.6 var(--font-sans,system-ui,sans-serif);color:#e8e6e0}',
    '.xp-toggle{background:rgba(18,20,24,.92);color:#e8e6e0;border:1px solid rgba(200,151,90,.55);border-radius:999px;padding:8px 16px;cursor:pointer;font-size:13px;letter-spacing:.04em}',
    '.xp-toggle:hover{border-color:#c8975a}',
    '.xp-panel{display:none;width:340px;max-width:calc(100vw - 32px);max-height:78vh;overflow:auto;background:rgba(18,20,24,.95);border:1px solid rgba(200,151,90,.4);border-radius:12px;padding:14px 16px;margin-bottom:10px;box-shadow:0 8px 28px rgba(0,0,0,.35)}',
    '.xp-root.open .xp-panel{display:block}',
    '.xp-root.open .xp-toggle{border-color:#c8975a}',
    '.xp-hd{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:8px}',
    '.xp-hd strong{font-weight:500;font-size:14px;color:#f2efe8}',
    '.xp-hd span{color:#c8975a;font-size:12px;white-space:nowrap}',
    '.xp-sec{border-top:1px solid rgba(232,230,224,.14);margin-top:12px;padding-top:10px}',
    '.xp-sec h4{margin:0 0 8px;font-size:12px;font-weight:500;color:#c8975a;letter-spacing:.08em}',
    '.xp-grid{display:grid;grid-template-columns:56px 1fr;gap:5px 10px;margin:0;font-size:12px}',
    '.xp-grid dt{color:#9c9a94}',
    '.xp-grid dd{margin:0;color:#e8e6e0}',
    '.xp-note{color:#f2efe8;background:rgba(200,151,90,.1);border-left:2px solid #c8975a;padding:7px 10px;margin:0 0 8px;font-size:12px}',
    '.xp-beat{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}',
    '.xp-phase{font:500 20px/1.2 var(--font-mono,ui-monospace,monospace);color:#f2efe8;letter-spacing:.04em}',
    '.xp-meta{font:12px/1.4 var(--font-mono,ui-monospace,monospace);color:#9c9a94}',
    '.xp-bar{height:4px;background:rgba(232,230,224,.14);border-radius:2px;margin:9px 0;overflow:hidden}',
    '.xp-bar i{display:block;height:100%;width:0;background:#c8975a}',
    '.xp-btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}',
    '.xp-btns button{background:transparent;color:#e8e6e0;border:1px solid rgba(232,230,224,.3);border-radius:6px;padding:5px 12px;cursor:pointer;font-size:12px}',
    '.xp-btns button:hover{border-color:#c8975a}',
    '.xp-checks{display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;font-size:12px;margin-bottom:8px}',
    '.xp-checks label{display:flex;gap:6px;align-items:center;cursor:pointer;color:#e8e6e0}',
    '.xp-input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.06);color:#e8e6e0;border:1px solid rgba(232,230,224,.24);border-radius:6px;padding:6px 8px;font:12px/1.4 inherit;margin-bottom:8px}',
    '.xp-input option{color:#e8e6e0;background:#15181c}',
    '.xp-log{font-size:12px;color:#c9c6bf;margin:6px 0 0;padding:0;list-style:none;max-height:120px;overflow:auto}',
    '.xp-log li{padding:3px 0;border-bottom:1px dashed rgba(232,230,224,.1)}',
    '.xp-tip{font-size:11px;color:#8f8d87;margin:8px 0 0}',
    '.xp-root button:focus-visible,.xp-root input:focus-visible{outline:2px solid #c8975a;outline-offset:2px}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------------------------------------------------------- 结构 */
  var root = document.createElement('div');
  root.className = 'xp-root';
  root.setAttribute('aria-label', '跟练与行持卡');
  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'xp-toggle';
  toggle.textContent = '跟练 · ' + cardId + ' 行持卡';
  toggle.setAttribute('aria-expanded', 'false');
  var panel = document.createElement('div');
  panel.className = 'xp-panel';
  root.appendChild(toggle);
  root.appendChild(panel);
  document.body.appendChild(root);

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  var hd = el('div', 'xp-hd');
  hd.appendChild(el('strong', '', title));
  var hdTag = el('span', '', cardId + ' · 一息 ' + breath + ' 秒');
  hd.appendChild(hdTag);
  panel.appendChild(hd);

  /* ---------------------------------------------------------- 我的一门 */
  var schools = DATA.schools || [];
  var SCHOOL_KEY = 'xiuxing-school';
  var sSchool = el('section', 'xp-sec');
  sSchool.appendChild(el('h4', '', '我的一门 · 读图前先定坐标'));
  var sel = document.createElement('select');
  sel.className = 'xp-input';
  sel.setAttribute('aria-label', '选择自己这一门');
  var opt0 = document.createElement('option');
  opt0.value = '';
  opt0.textContent = '未选定 · 三套坐标不可混用';
  sel.appendChild(opt0);
  schools.forEach(function (sc) {
    var o = document.createElement('option');
    o.value = sc.key;
    o.textContent = sc.name;
    sel.appendChild(o);
  });
  sSchool.appendChild(sel);
  var schoolDef = el('dl', 'xp-grid');
  sSchool.appendChild(schoolDef);
  sSchool.appendChild(el('p', 'xp-tip',
    '两套三田、两套周天不是同一套坐标；选定后按这一门读全站各图，别在两种火候之间来回试。'));
  panel.appendChild(sSchool);

  function byKey(k) {
    for (var i = 0; i < schools.length; i++) if (schools[i].key === k) return schools[i];
    return null;
  }
  function renderSchool(k) {
    var sc = byKey(k);
    schoolDef.textContent = '';
    var rows = sc
      ? [['门', sc.name + ' · ' + sc.brief], ['三田', sc.fields], ['周天', sc.orbit],
         ['三关', sc.passes], ['依据', sc.source]]
      : [['提示', '尚未选定；先到《第六问 · 行》择一门，再回来看图。']];
    rows.forEach(function (pair) {
      schoolDef.appendChild(el('dt', '', pair[0]));
      schoolDef.appendChild(el('dd', '', pair[1]));
    });
    sel.value = k || '';
    hdTag.textContent = cardId + ' · 一息 ' + breath + ' 秒' + (sc ? ' · ' + sc.name : '');
  }
  var savedSchool = '';
  try { savedSchool = localStorage.getItem(SCHOOL_KEY) || ''; } catch (e) { /* 隐私模式 */ }
  sel.addEventListener('change', function () {
    try { localStorage.setItem(SCHOOL_KEY, sel.value); } catch (e) { /* 隐私模式 */ }
    renderSchool(sel.value);
  });
  renderSchool(byKey(savedSchool) ? savedSchool : '');

  var sCard = el('section', 'xp-sec');
  sCard.appendChild(el('h4', '', '行持卡 · 这一张图在坐垫上对应什么'));
  sCard.appendChild(el('p', 'xp-note', card.note || DATA.defaults.note));
  var dl = el('dl', 'xp-grid');
  [['坐', card.sit], ['息', card.breath], ['多久', card.time],
   ['收', card.close], ['验', card.check]].forEach(function (pair) {
    dl.appendChild(el('dt', '', pair[0]));
    dl.appendChild(el('dd', '', pair[1] || '—'));
  });
  sCard.appendChild(dl);
  panel.appendChild(sCard);

  var sBeat = el('section', 'xp-sec');
  sBeat.appendChild(el('h4', '', '跟练节拍 · 与画面同一 breath 基准'));
  var beat = el('div', 'xp-beat');
  var phase = el('span', 'xp-phase', '待开始');
  var meta = el('span', 'xp-meta', '');
  beat.appendChild(phase);
  beat.appendChild(meta);
  sBeat.appendChild(beat);
  var bar = el('div', 'xp-bar');
  var barFill = el('i');
  bar.appendChild(barFill);
  sBeat.appendChild(bar);
  var btns = el('div', 'xp-btns');
  var bStart = el('button', '', '开始');
  bStart.type = 'button';
  var bReset = el('button', '', '归零');
  bReset.type = 'button';
  btns.appendChild(bStart);
  btns.appendChild(bReset);
  sBeat.appendChild(btns);
  sBeat.appendChild(el('p', 'xp-tip',
    '按下开始后从 0 起算；与画面同用一息 ' + breath + ' 秒的基准，不逐帧对齐。空格与画面同步暂停；一息前半为吸 · 上行。' +
    (overridden ? '当前 breath 已由网址覆盖，与画面基准不同。' : '')));
  panel.appendChild(sBeat);

  var sLog = el('section', 'xp-sec');
  sLog.appendChild(el('h4', '', '今日一坐 · 生活四验（只存本机）'));
  var checks = el('div', 'xp-checks');
  var boxes = CHECKS.map(function (name) {
    var lab = el('label');
    var box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = true;
    lab.appendChild(box);
    lab.appendChild(document.createTextNode(name + '未变差'));
    checks.appendChild(lab);
    return box;
  });
  sLog.appendChild(checks);
  var note = document.createElement('input');
  note.className = 'xp-input';
  note.type = 'text';
  note.placeholder = '一句备注：今天坐了多久、有无走神（可留空）';
  note.setAttribute('aria-label', '行持备注');
  sLog.appendChild(note);
  var logBtns = el('div', 'xp-btns');
  var bSave = el('button', '', '记一笔');
  bSave.type = 'button';
  var bClear = el('button', '', '清空本机日志');
  bClear.type = 'button';
  logBtns.appendChild(bSave);
  logBtns.appendChild(bClear);
  sLog.appendChild(logBtns);
  var logList = el('ul', 'xp-log');
  sLog.appendChild(logList);
  sLog.appendChild(el('p', 'xp-tip', '两项以上持续变差就先减量；数据只写 localStorage，不上传。'));
  panel.appendChild(sLog);

  /* ---------------------------------------------------------- 展开/收起 */
  function setOpen(v) {
    root.classList.toggle('open', v);
    toggle.setAttribute('aria-expanded', String(v));
    try { localStorage.setItem(OPEN_KEY, v ? '1' : '0'); } catch (e) { /* 隐私模式 */ }
  }
  toggle.addEventListener('click', function () { setOpen(!root.classList.contains('open')); });
  try { if (localStorage.getItem(OPEN_KEY) === '1') setOpen(true); } catch (e) { /* noop */ }
  if (params.get('practice') === '1') setOpen(true);

  /* ---------------------------------------------------------- 节拍 */
  var t = 0;
  var running = false;
  var last = 0;

  function stageName() {
    if (!stages.length) return '';
    var idx = Math.min(stages.length - 1, Math.floor(t / duration * stages.length));
    return stages[idx].name || ('第 ' + (idx + 1) + ' 段');
  }
  function render() {
    var i = (t % breath) / breath;
    var inhale = i < 0.5;
    var cycle = Math.floor(t / breath) + 1;
    var remain = Math.max(0, duration - t);
    phase.textContent = (inhale ? '吸 · 上行' : '呼 · 下行');
    meta.textContent = '第 ' + cycle + ' 息 · 余 ' + Math.ceil(remain) + ' 秒' + (stageName() ? ' · ' + stageName() : '');
    barFill.style.width = Math.min(100, t / duration * 100).toFixed(1) + '%';
  }
  function tick(now) {
    if (!running) return;
    t += (now - last) / 1000;
    last = now;
    if (t >= duration) t = 0;
    render();
    requestAnimationFrame(tick);
  }
  function setRunning(v) {
    if (v === running) return;
    running = v;
    bStart.textContent = running ? '暂停' : '开始';
    if (running) {
      last = performance.now();
      requestAnimationFrame(tick);
    }
  }
  bStart.addEventListener('click', function () { setRunning(!running); });
  bReset.addEventListener('click', function () { t = 0; render(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== ' ') return;
    var tag = (e.target && e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'button') return;
    setRunning(!running);
  });
  render();

  /* ---------------------------------------------------------- 日志 */
  function readLog() {
    try {
      var v = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function writeLog(v) {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(v.slice(-60))); } catch (e) { /* 隐私模式 */ }
  }
  function renderLog() {
    logList.textContent = '';
    var rows = readLog().slice(-7).reverse();
    if (!rows.length) {
      logList.appendChild(el('li', '', '还没有记录。'));
      return;
    }
    rows.forEach(function (r) {
      logList.appendChild(el('li', '', r.day + ' · ' + r.id + ' · ' + r.ok + '/4' + (r.note ? ' · ' + r.note : '')));
    });
  }
  bSave.addEventListener('click', function () {
    var now = new Date();
    var day = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    var ok = boxes.filter(function (b) { return b.checked; }).length;
    var rows = readLog();
    rows.push({ day: day, id: cardId, slug: slug, ok: ok, note: note.value.trim().slice(0, 80) });
    writeLog(rows);
    note.value = '';
    bSave.textContent = '已记下 ✓';
    setTimeout(function () { bSave.textContent = '记一笔'; }, 1200);
    renderLog();
  });
  bClear.addEventListener('click', function () {
    if (!window.confirm('清空本机全部行持记录？此操作不可撤销。')) return;
    writeLog([]);
    renderLog();
  });
  renderLog();
})();
