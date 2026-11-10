/*
 * xiuxing-atlas.js
 * 新增共享运行时图谱的索引面板。只读取 window.__XIUXING_CONFIG 的自定义字段
 * （acupoints / notes / stages），通过点击既有 .qi-step 按钮驱动 3D 次第，
 * 不修改也不依赖 xiuxing-runtime.js 的内部状态。
 */
(function () {
  'use strict';

  var cfg = window.__XIUXING_CONFIG;
  if (!cfg || !cfg.id) return;

  var esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  var gotoStep = function (n, attempt) {
    var el = document.querySelector('.qi-step[data-step="' + n + '"]');
    if (el && typeof el.click === 'function') {
      el.click();
      return;
    }
    if ((attempt || 0) < 12) {
      setTimeout(function () { gotoStep(n, (attempt || 0) + 1); }, 250);
    }
  };

  var build = function () {
    var box = document.createElement('aside');
    box.className = 'x-atlas collapsed';
    box.setAttribute('aria-label', '本图索引');
    box.innerHTML =
      '<style>' +
      '.x-atlas{position:absolute;right:1rem;bottom:4.6rem;width:17.5rem;max-height:52vh;' +
      'overflow:auto;z-index:30;background:rgba(236,231,220,.96);color:#262824;' +
      'border:1px solid #b9b2a1;border-radius:8px;font-family:system-ui,"Noto Sans SC",sans-serif;' +
      'font-size:12px;line-height:1.6;box-shadow:0 6px 22px rgba(38,40,36,.14)}' +
      '.x-atlas h2{margin:0;padding:.7rem .85rem;font-size:13px;font-weight:600;' +
      'border-bottom:1px solid #d5cfc0;display:flex;justify-content:space-between;align-items:center}' +
      '.x-atlas h2 button{border:1px solid #b9b2a1;background:transparent;color:#6b6a62;' +
      'border-radius:4px;cursor:pointer;font:inherit;padding:0 .45rem}' +
      '.x-atlas .x-body{padding:.6rem .85rem .9rem}' +
      '.x-atlas h3{margin:.7rem 0 .35rem;font-size:11px;letter-spacing:.08em;' +
      'color:#b0842c;font-weight:600;text-transform:uppercase}' +
      '.x-atlas ul{list-style:none;margin:0;padding:0}' +
      '.x-atlas li{margin:.15rem 0}' +
      '.x-atlas button.x-item{display:block;width:100%;text-align:left;border:1px solid transparent;' +
      'background:transparent;color:#262824;font:inherit;padding:.28rem .45rem;border-radius:4px;cursor:pointer}' +
      '.x-atlas button.x-item:hover,.x-atlas button.x-item:focus-visible{border-color:#c4442c;color:#c4442c;outline:none}' +
      '.x-atlas button.x-item.on{background:#e0d8c8;border-color:#c4442c;color:#c4442c}' +
      '.x-atlas .x-note{margin:.3rem 0 .7rem;padding:.5rem .6rem;background:#f4f0e6;' +
      'border-left:2px solid #c4442c;color:#5c5a52}' +
      '.x-atlas .x-src{color:#6b6a62;font-size:11px}' +
      '.x-atlas .x-foot{margin-top:.7rem;padding-top:.5rem;border-top:1px solid #d5cfc0;' +
      'color:#6b6a62;font-size:11px}' +
      '.x-atlas.collapsed .x-body{display:none}' +
      '@media(max-width:760px){.x-atlas{width:14rem;max-height:38vh;bottom:4.2rem}}' +
      '</style>' +
      '<h2><span>本图索引 / INDEX</span><button type="button" class="x-fold" aria-expanded="false">展开</button></h2>' +
      '<div class="x-body"></div>';

    var body = box.querySelector('.x-body');
    var html = '';
    var points = cfg.acupoints || [];

    if (points.length) {
      var groups = {};
      points.forEach(function (p) { (groups[p.cat] = groups[p.cat] || []).push(p); });
      html += '<h3>穴位分类</h3><ul>';
      Object.keys(groups).forEach(function (g, gi) {
        html += '<li><button type="button" class="x-item x-step" data-step="' + (gi + 1) + '">' +
          esc(g) + ' <span class="x-src">(' + groups[g].length + ')</span></button></li>';
      });
      html += '</ul><h3>穴位详情</h3><div class="x-note" id="x-detail">点上方分类切换 3D 次第，再点穴位查看归属与出处。</div><ul>';
      points.forEach(function (p, i) {
        html += '<li><button type="button" class="x-item x-point" data-i="' + i +
          '" data-step="' + p.step + '">' + esc(p.name) +
          ' <span class="x-src">· ' + esc(p.meridian) + '</span></button></li>';
      });
      html += '</ul>';
    } else {
      html += '<h3>次第</h3><ul>';
      (cfg.stages || []).forEach(function (s, i) {
        html += '<li><button type="button" class="x-item x-step" data-step="' + (i + 1) + '">' +
          esc(s.name) + '</button></li>';
      });
      html += '</ul>';
    }

    if (cfg.notes && cfg.notes.length) {
      html += '<h3>文献依据</h3><ul class="x-src">';
      cfg.notes.forEach(function (n) { html += '<li>· ' + esc(n) + '</li>'; });
      html += '</ul>';
    }
    html += '<div class="x-foot">位置为教学示意，不承诺定位精度；非医疗或修炼指导。</div>';
    body.innerHTML = html;

    box.querySelector('.x-fold').addEventListener('click', function () {
      var folded = box.classList.toggle('collapsed');
      this.textContent = folded ? '展开' : '收起';
      this.setAttribute('aria-expanded', folded ? 'false' : 'true');
    });

    body.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button.x-item');
      if (!btn) return;
      body.querySelectorAll('button.x-item.on').forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      gotoStep(Number(btn.dataset.step || 1));
      if (btn.classList.contains('x-point')) {
        var p = points[Number(btn.dataset.i)];
        var detail = body.querySelector('#x-detail');
        if (p && detail) {
          detail.textContent = p.name + ' · ' + p.cat + ' · ' + p.meridian + '：' + p.note;
        }
      }
    });

    document.body.appendChild(box);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
