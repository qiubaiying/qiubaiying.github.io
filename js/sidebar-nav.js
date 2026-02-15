/**
 * 左侧标签导航：折叠=只保留一级标签，展开=全部展开。
 * 文章页右侧：原 theme side-catalog，多级标题 h1~h6；折叠=只保留一级标题，展开=全部；始终 sticky 显示。
 */
(function () {
  function slugify(text) {
    return String(text).replace(/\s+/g, '-').replace(/[^\w\u4e00-\u9fff-]/g, '').toLowerCase() || 'heading';
  }

  function buildCatalog() {
    var body = document.getElementById('catalog-body');
    var container = document.querySelector('.post-container');
    if (!body || !container) return;
    var headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) return;
    var usedIds = {};
    var fragment = document.createDocumentFragment();
    var minLevel = 6;
    headings.forEach(function (h) {
      var id = h.id;
      if (!id) {
        id = slugify(h.textContent);
        if (usedIds[id]) {
        var n = 1;
        while (usedIds[id + '-' + n]) n++;
        id = id + '-' + n;
        }
        usedIds[id] = true;
        h.id = id;
      }
      var tag = h.tagName.toLowerCase();
      var level = parseInt(tag.charAt(1), 10);
      if (level < minLevel) minLevel = level;
      var li = document.createElement('li');
      li.className = tag + '_nav';
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.textContent.trim();
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      li.appendChild(a);
      fragment.appendChild(li);
    });
    body.appendChild(fragment);
    var catalog = document.getElementById('side-catalog');
    if (catalog) {
      for (var i = 1; i <= 6; i++) catalog.classList.remove('catalog-has-min-' + i);
      catalog.classList.add('catalog-has-min-' + minLevel);
    }
  }

  function initTagTreeToggle() {
    var tree = document.getElementById('tag-tree');
    if (!tree) return;
    var wrap = tree.closest('.tag-tree-wrap');
    if (!wrap) wrap = tree;
    tree.querySelectorAll('.nav-toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        if (action === 'collapse') {
          wrap.classList.add('tag-tree-fold-level1');
          tree.querySelectorAll('.tag-tree-node, .tag-tree-group').forEach(function (n) { n.classList.remove('open'); });
        } else {
          wrap.classList.remove('tag-tree-fold-level1');
          tree.querySelectorAll('.tag-tree-node, .tag-tree-group').forEach(function (n) { n.classList.add('open'); });
        }
      });
    });
  }

  function initCatalogFoldExpand() {
    var catalog = document.getElementById('side-catalog');
    if (!catalog) return;
    var foldBtn = catalog.querySelector('.catalog-fold-sub');
    var expandBtn = catalog.querySelector('.catalog-expand-sub');
    if (foldBtn) {
      foldBtn.addEventListener('click', function () { catalog.classList.add('catalog-fold-sub'); });
    }
    if (expandBtn) {
      expandBtn.addEventListener('click', function () { catalog.classList.remove('catalog-fold-sub'); });
    }
  }

  function initTagTreeTagClick() {
    var tree = document.getElementById('tag-tree');
    if (!tree) return;
    tree.querySelectorAll('.tag-tree-node').forEach(function (el) {
      var tagLink = el.querySelector('.tag-tree-tag');
      var posts = el.querySelector('.tag-tree-posts');
      if (!tagLink || !posts || !posts.children.length) return;
      tagLink.addEventListener('click', function (e) {
        var href = tagLink.getAttribute('href') || '';
        if (href.indexOf('/tags/') >= 0) return;
        if (href.indexOf('#') === -1) return;
        e.preventDefault();
        el.classList.toggle('open');
        var id = el.getAttribute('data-target');
        if (id) {
          var section = document.getElementById(id);
          if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  function run() {
    initTagTreeToggle();
    initCatalogFoldExpand();
    initTagTreeTagClick();
    buildCatalog();
  }
})();
