/**
 * 将 Kramdown 输出的 blockquote 转为 GitHub 风格 Callout
 * 识别 > [!NOTE] / [!TIP] / [!IMPORTANT] / [!CAUTION] / [!WARNING]
 */
(function() {
  var MAP = {
    'NOTE': 'callout-note',
    'TIP': 'callout-tip',
    'IMPORTANT': 'callout-important',
    'CAUTION': 'callout-caution',
    'WARNING': 'callout-warning'
  };
  var re = /^\[\!(NOTE|TIP|IMPORTANT|CAUTION|WARNING)\](?:\s+(.*))?$/i;

  function processBlockquote(bq) {
    var first = bq.querySelector('p');
    if (!first) return;
    var text = (first.textContent || '').trim();
    var m = text.match(re);
    if (!m) return;
    var type = m[1].toUpperCase();
    var customTitle = m[2] ? m[2].trim() : null;
    var cls = MAP[type];
    if (!cls) return;

    bq.classList.add(cls);
    var titleEl = document.createElement('strong');
    titleEl.className = 'callout-title';
    var icon = document.createElement('i');
    icon.className = 'fa fa-fw ' + ({
      'NOTE': 'fa-info-circle',
      'TIP': 'fa-lightbulb-o',
      'IMPORTANT': 'fa-exclamation-circle',
      'CAUTION': 'fa-times-circle',
      'WARNING': 'fa-exclamation-triangle'
    }[type] || 'fa-info-circle');
    titleEl.appendChild(icon);
    titleEl.appendChild(document.createTextNode(customTitle || (type.charAt(0) + type.slice(1).toLowerCase())));
    first.textContent = '';
    first.appendChild(titleEl);

    var rest = [];
    var next = first.nextElementSibling;
    while (next) {
      rest.push(next);
      next = next.nextElementSibling;
    }
    rest.forEach(function(node) { first.parentNode.removeChild(node); });
    var wrap = document.createElement('div');
    wrap.className = 'callout-body';
    rest.forEach(function(node) { wrap.appendChild(node); });
    first.parentNode.insertBefore(wrap, first.nextSibling);
  }

  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.post-container blockquote, .postlist-container blockquote').forEach(function(bq) {
      if (bq.classList.contains('callout-note') || bq.classList.contains('callout-tip') ||
          bq.classList.contains('callout-important') || bq.classList.contains('callout-caution') ||
          bq.classList.contains('callout-warning')) return;
      processBlockquote(bq);
    });
  });
})();
