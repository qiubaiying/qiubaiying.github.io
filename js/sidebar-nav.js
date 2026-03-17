/**
 * 左侧标签导航：单击=跳转，双击=展开/折叠；初始仅一级+二级；有子项显示倒三角。
 * 文章页右侧：同上；初始仅一级+二级；有子项显示倒三角。
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
    var parentStack = [];
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
      while (parentStack.length && parentStack[parentStack.length - 1].level >= level) parentStack.pop();
      var parentId = parentStack.length ? parentStack[parentStack.length - 1].id : '';
      parentStack.push({ id: id, level: level });
      var li = document.createElement('li');
      li.className = tag + '_nav';
      li.setAttribute('data-level', level);
      li.setAttribute('data-id', id);
      if (parentId) li.setAttribute('data-parent-id', parentId);
      var a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.textContent.trim();
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
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
      catalog.classList.add('catalog-initial');
      markCatalogHasChildren(catalog);
      initCatalogDoubleClick(catalog, minLevel);
    }
  }

  function markCatalogHasChildren(catalog) {
    catalog.querySelectorAll('.catalog-body li[data-id]').forEach(function (li) {
      var myId = li.getAttribute('data-id');
      if (catalog.querySelector('.catalog-body li[data-parent-id="' + myId + '"]')) {
        li.setAttribute('data-has-children', '1');
      }
    });
  }

  function getCatalogDescendants(catalog, parentId) {
    var parentMap = {};
    catalog.querySelectorAll('.catalog-body li[data-parent-id]').forEach(function (el) {
      var pid = el.getAttribute('data-parent-id');
      if (!parentMap[pid]) parentMap[pid] = [];
      parentMap[pid].push(el);
    });
    var out = [], stack = [parentId];
    while (stack.length) {
      (parentMap[stack.pop()] || []).forEach(function (el) {
        out.push(el);
        stack.push(el.getAttribute('data-id'));
      });
    }
    return out;
  }

  function initCatalogDoubleClick(catalog, minLevel) {
    var body = catalog && catalog.querySelector('.catalog-body');
    if (!body) return;
    var isFoldMode = function () { return catalog.classList.contains('catalog-fold-sub') || catalog.classList.contains('catalog-initial'); };
    catalog.querySelectorAll('.catalog-body li[data-has-children="1"]').forEach(function (li) {
      var a = li.querySelector('a');
      if (!a) return;
      a.addEventListener('dblclick', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var myId = li.getAttribute('data-id');
        var directChildren = body.querySelectorAll('li[data-parent-id="' + myId + '"]');
        if (isFoldMode()) {
          var isExpanded = li.classList.contains('catalog-peek-open');
          if (isExpanded) {
            li.classList.remove('catalog-peek-open');
            directChildren.forEach(function (c) { c.classList.remove('catalog-direct-child-show'); });
          } else {
            li.classList.add('catalog-peek-open');
            directChildren.forEach(function (c) { c.classList.add('catalog-direct-child-show'); });
          }
        } else {
          var isCollapsed = li.classList.contains('catalog-branch-collapsed');
          var desc = getCatalogDescendants(catalog, myId);
          if (isCollapsed) {
            li.classList.remove('catalog-branch-collapsed');
            desc.forEach(function (c) { c.classList.remove('catalog-force-hide'); });
          } else {
            li.classList.add('catalog-branch-collapsed');
            desc.forEach(function (c) { c.classList.add('catalog-force-hide'); });
          }
        }
      });
    });
  }

  function initTagTreeToggle() {
    var tree = document.getElementById('tag-tree');
    if (!tree) return;
    var wrap = tree.closest('.tag-tree-wrap');
    if (!wrap) wrap = tree;
    setTagTreeInitialState(tree, wrap);
    tree.querySelectorAll('.nav-toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = this.getAttribute('data-action');
        if (action === 'collapse') {
          wrap.classList.add('tag-tree-fold-level1');
          tree.querySelectorAll('.tag-tree-node, .tag-tree-group').forEach(function (n) { n.classList.remove('open'); n.classList.remove('tag-tree-peek-open'); });
        } else {
          wrap.classList.remove('tag-tree-fold-level1');
          tree.querySelectorAll('.tag-tree-node, .tag-tree-group').forEach(function (n) { n.classList.add('open'); n.classList.remove('tag-tree-peek-open'); });
        }
      });
    });
  }

  function setTagTreeInitialState(tree, wrap) {
    wrap.classList.remove('tag-tree-fold-level1');
    tree.querySelectorAll('.tag-tree-node, .tag-tree-group').forEach(function (n) { n.classList.remove('open'); n.classList.remove('tag-tree-peek-open'); });
  }

  function initCatalogFoldExpand() {
    var catalog = document.getElementById('side-catalog');
    if (!catalog) return;
    var foldBtn = catalog.querySelector('.catalog-fold-sub');
    var expandBtn = catalog.querySelector('.catalog-expand-sub');
    if (foldBtn) {
      foldBtn.addEventListener('click', function () {
        catalog.classList.remove('catalog-initial');
        catalog.classList.add('catalog-fold-sub');
        catalog.querySelectorAll('.catalog-body .catalog-peek-open, .catalog-body .catalog-direct-child-show, .catalog-body .catalog-branch-collapsed, .catalog-body .catalog-force-hide').forEach(function (n) {
          n.classList.remove('catalog-peek-open', 'catalog-direct-child-show', 'catalog-branch-collapsed', 'catalog-force-hide');
        });
      });
    }
    if (expandBtn) {
      expandBtn.addEventListener('click', function () {
        catalog.classList.remove('catalog-fold-sub');
        catalog.classList.remove('catalog-initial');
        catalog.querySelectorAll('.catalog-body .catalog-peek-open, .catalog-body .catalog-direct-child-show, .catalog-body .catalog-branch-collapsed, .catalog-body .catalog-force-hide').forEach(function (n) {
          n.classList.remove('catalog-peek-open', 'catalog-direct-child-show', 'catalog-branch-collapsed', 'catalog-force-hide');
        });
      });
    }
  }

  function initTagTreeTagClick() {
    var tree = document.getElementById('tag-tree');
    if (!tree) return;
    var wrap = tree.closest('.tag-tree-wrap');
    tree.querySelectorAll('.tag-tree-node').forEach(function (el) {
      var tagLink = el.querySelector('.tag-tree-tag');
      var posts = el.querySelector('.tag-tree-posts');
      if (!tagLink) return;
      tagLink.addEventListener('dblclick', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (wrap && wrap.classList.contains('tag-tree-fold-level1')) {
          var group = el.closest('.tag-tree-group');
          if (group && el.classList.contains('tag-tree-node-parent')) {
            var isExpanded = group.classList.contains('tag-tree-peek-open');
            if (isExpanded) {
              group.classList.remove('tag-tree-peek-open');
            } else {
              tree.querySelectorAll('.tag-tree-group.tag-tree-peek-open').forEach(function (g) { g.classList.remove('tag-tree-peek-open'); });
              group.classList.add('tag-tree-peek-open');
            }
            return;
          }
        }
        if (posts && posts.children.length) {
          var group = el.closest('.tag-tree-group');
          if (group && el.classList.contains('tag-tree-node-parent')) {
            var isOpen = group.classList.contains('open');
            if (isOpen) {
              group.classList.remove('open');
              group.querySelectorAll('.tag-tree-node').forEach(function (n) { n.classList.remove('open'); });
            } else {
              group.classList.add('open');
              group.querySelectorAll('.tag-tree-node').forEach(function (n) { n.classList.add('open'); });
            }
          } else {
            el.classList.toggle('open');
          }
        }
      });
      tagLink.addEventListener('click', function (e) {
        var id = el.getAttribute('data-target');
        if (id) {
          var section = document.getElementById(id);
          if (section) {
            e.preventDefault();
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
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
