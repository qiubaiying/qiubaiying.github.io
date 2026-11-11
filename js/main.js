(function () {
  'use strict';

  /* 深色 / 浅色模式切换 */
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var html = document.documentElement;
      if (html.getAttribute('data-theme') === 'dark') {
        html.removeAttribute('data-theme');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      } else {
        html.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      }
      var dark = html.getAttribute('data-theme') === 'dark';
      html.style.colorScheme = dark ? 'dark' : 'light';
      document.querySelector('meta[name="theme-color"]').content = dark ? '#181E1B' : '#FDFDFB';
    });
  }

  /* 首页连续阅读：保留静态分页作为无 JavaScript / 旧浏览器后备。 */
  var postList = document.querySelector('[data-post-list]');
  var pagination = document.querySelector('[data-post-pagination]');
  var nextLink = pagination && pagination.querySelector('[data-next-page]');
  if (postList && nextLink && window.IntersectionObserver && window.fetch && window.AbortController) {
    var status = pagination.querySelector('[data-pagination-status]');
    var retry = pagination.querySelector('[data-pagination-retry]');
    var nextURL = new URL(nextLink.href, location.href);
    var loadedPages = new Set([location.pathname]);
    var loading = false;
    var failed = false;
    pagination.classList.add('is-continuous');
    nextLink.hidden = true;

    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; }) && !failed) loadNextPage();
    }, { rootMargin: '0px 0px 240px 0px' });

    function loadNextPage() {
      if (loading || !nextURL) return;
      loading = true;
      failed = false;
      var restoreFocus = document.activeElement === retry;
      retry.hidden = true;
      nextLink.hidden = true;
      status.hidden = false;
      status.textContent = '正在加载文章…';
      postList.setAttribute('aria-busy', 'true');
      var controller = new AbortController();
      var timeout = setTimeout(function () { controller.abort(); }, 15000);
      var requestedURL = nextURL;

      fetch(requestedURL.href, { signal: controller.signal, mode: 'same-origin' })
        .then(function (response) {
          if (!response.ok) throw new Error('Page unavailable');
          return response.text().then(function (html) {
            return { html: html, url: response.url || requestedURL.href };
          });
        })
        .then(function (result) {
          var page = new DOMParser().parseFromString(result.html, 'text/html');
          var articles = Array.prototype.slice.call(page.querySelectorAll('[data-post-list] > .post-item'));
          var existingLinks = new Set(Array.prototype.map.call(postList.querySelectorAll('h2 a'), function (a) {
            return a.getAttribute('href');
          }));
          articles = articles.filter(function (article) {
            var title = article.querySelector('h2 a');
            return title && !existingLinks.has(title.getAttribute('href'));
          });
          if (!articles.length) throw new Error('No new articles');
          var following = page.querySelector('[data-post-pagination] [data-next-page]');
          var followingURL = following ? new URL(following.getAttribute('href'), result.url) : null;
          if (followingURL && (followingURL.origin !== location.origin || loadedPages.has(followingURL.pathname) || followingURL.pathname === requestedURL.pathname)) {
            throw new Error('Invalid next page');
          }
          var fragment = document.createDocumentFragment();
          articles.forEach(function (article) { fragment.appendChild(document.importNode(article, true)); });
          var firstNewTitle = fragment.querySelector('h2 a');
          postList.appendChild(fragment);
          loadedPages.add(requestedURL.pathname);
          nextURL = followingURL;
          if (nextURL) nextLink.href = nextURL.href;
          status.textContent = nextURL ? '' : '已显示全部文章';
          status.hidden = Boolean(nextURL);
          if (!nextURL) observer.disconnect();
          if (restoreFocus && firstNewTitle) firstNewTitle.focus({ preventScroll: true });
          failed = false;
        })
        .catch(function () {
          failed = true;
          status.textContent = '文章暂时未能加载';
          retry.hidden = false;
          nextLink.hidden = false;
        })
        .then(function () {
          clearTimeout(timeout);
          loading = false;
          postList.removeAttribute('aria-busy');
        });
    }

    retry.addEventListener('click', loadNextPage);
    observer.observe(pagination);
  }

  /* Export filenames are not useful image descriptions. Keep the real caption visible. */
  document.querySelectorAll('.post-content img').forEach(function (img) {
    if (!/\.(jpe?g|png|webp)$/i.test(img.alt || '')) return;
    var known = {
      'D5EA9148': '深夜抵达羽田机场',
      'CCE4ED83': '街边咖啡店',
      '3CD28C37': '明治神宫的入口',
      '3127BC08': '神社里挂着的祈福木板'
    };
    var key = Object.keys(known).find(function (prefix) { return img.alt.indexOf(prefix) === 0; });
    img.alt = key ? known[key] : '文章配图';
  });

  /* 文章目录 */
  var content = document.querySelector('.post-content');
  var tocDesktop = document.getElementById('toc-desktop');
  var tocDesktopList = document.getElementById('toc-desktop-list');
  var tocMobile = document.getElementById('toc-mobile');
  var tocMobileList = document.getElementById('toc-mobile-list');
  if (content && tocDesktop && tocDesktopList && tocMobile && tocMobileList) {
    var headings = Array.prototype.filter.call(
      content.querySelectorAll('h1, h2, h3'),
      function (h) { return h.id; }
    );
    if (headings.length > 1) {
      var firstLevel = Math.min.apply(null, headings.map(function (heading) {
        return Number(heading.tagName.slice(1));
      }));
      headings.forEach(function (heading) {
        var li = document.createElement('li');
        li.className = 'toc-depth-' + (Number(heading.tagName.slice(1)) - firstLevel);
        var a = document.createElement('a');
        a.href = '#' + heading.id;
        a.textContent = heading.textContent;
        li.appendChild(a);
        tocDesktopList.appendChild(li.cloneNode(true));
        tocMobileList.appendChild(li);
      });
      tocDesktop.hidden = false;
      tocMobile.hidden = false;
      tocMobile.addEventListener('click', function(event) {
        if (event.target.closest('a')) tocMobile.open = false;
      });

      var desktopLinks = Array.from(tocDesktopList.querySelectorAll('a'));
      var mobileLinks = Array.from(tocMobileList.querySelectorAll('a'));
      var desktopViewport = window.matchMedia('(min-width: 1100px)');
      var activeHeading = -1;
      var tocFrame = 0;
      var tocHover = false;
      var tocPauseUntil = 0;

      function queueTocUpdate() {
        if (!tocFrame) tocFrame = requestAnimationFrame(updateToc);
      }

      function updateToc() {
        tocFrame = 0;
        var nav = document.querySelector('.site-nav');
        var readingTop = (nav ? nav.getBoundingClientRect().bottom : 60) + 24;
        if (!desktopViewport.matches) {
          readingTop = Math.max(readingTop, tocMobile.querySelector('summary').getBoundingClientRect().bottom + 16);
        }
        var anchorOffset = parseFloat(window.getComputedStyle(headings[0]).scrollMarginTop) || 0;
        readingTop = Math.max(readingTop, anchorOffset + 2);
        var current = 0;
        headings.forEach(function (heading, index) {
          if (heading.getBoundingClientRect().top <= readingTop) current = index;
        });
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = headings.length - 1;
        if (current !== activeHeading) {
          desktopLinks.concat(mobileLinks).forEach(function (link) { link.removeAttribute('aria-current'); });
          desktopLinks[current].setAttribute('aria-current', 'location');
          mobileLinks[current].setAttribute('aria-current', 'location');
          activeHeading = current;
        }

        // Scroll only the directory, never the article. Let manual browsing take priority.
        var container = desktopViewport.matches ? tocDesktopList : tocMobile.querySelector('nav');
        var keyboardFocus = container.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
        if ((!desktopViewport.matches && !tocMobile.open) || tocHover || Date.now() < tocPauseUntil || keyboardFocus) return;
        var link = desktopViewport.matches ? desktopLinks[current] : mobileLinks[current];
        var bounds = container.getBoundingClientRect();
        var item = link.getBoundingClientRect();
        if (item.top < bounds.top + 12) container.scrollTop += item.top - bounds.top - 12;
        else if (item.bottom > bounds.bottom - 12) container.scrollTop += item.bottom - bounds.bottom + 12;
      }

      [tocDesktop, tocMobile].forEach(function (panel) {
        panel.addEventListener('pointerenter', function (event) { if (event.pointerType === 'mouse') tocHover = true; });
        panel.addEventListener('pointerleave', function () { tocHover = false; queueTocUpdate(); });
        panel.addEventListener('wheel', function () { tocPauseUntil = Date.now() + 1800; }, { passive: true });
        panel.addEventListener('touchstart', function () { tocPauseUntil = Date.now() + 1800; }, { passive: true });
        panel.addEventListener('touchmove', function () { tocPauseUntil = Date.now() + 1800; }, { passive: true });
        panel.addEventListener('focusout', queueTocUpdate);
      });
      tocMobile.addEventListener('toggle', queueTocUpdate);
      window.addEventListener('scroll', queueTocUpdate, { passive: true });
      window.addEventListener('resize', queueTocUpdate);
      window.addEventListener('hashchange', queueTocUpdate);
      window.addEventListener('load', queueTocUpdate);
      if (window.ResizeObserver) new ResizeObserver(queueTocUpdate).observe(content);
      queueTocUpdate();
    }
  }

  /* 归档：标签 / 年份各自筛选，不叠加。 */
  var tagPanel = document.getElementById('tag-filters');
  var yearPanel = document.getElementById('year-filters');
  var modeGroup = document.querySelector('.archive-filter-modes');
  if (tagPanel && yearPanel && modeGroup) {
    var archiveMode = 'tag';
    var selectedFilters = { tag: '全部', year: '全部' };
    var modeButtons = Array.from(modeGroup.querySelectorAll('[data-filter-mode]'));
    var tagButtons = Array.from(tagPanel.querySelectorAll('[data-filter]'));
    var yearButtons = Array.from(yearPanel.querySelectorAll('[data-year-filter]'));
    var archiveYears = Array.from(document.querySelectorAll('.archive-year'));
    function applyArchiveFilter() {
      tagPanel.hidden = archiveMode !== 'tag';
      yearPanel.hidden = archiveMode !== 'year';
      modeButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filterMode === archiveMode)); });
      tagButtons.concat(yearButtons).forEach(function (b) {
        var selected = b.hasAttribute('data-filter') ? b.dataset.filter === selectedFilters.tag : b.dataset.yearFilter === selectedFilters.year;
        b.classList.toggle('is-active', selected);
        b.setAttribute('aria-pressed', String(selected));
      });
      archiveYears.forEach(function (year) {
        var visible = false;
        year.querySelectorAll('.archive-item').forEach(function (item) {
          var filter = selectedFilters[archiveMode];
          var matches = filter === '全部' || (archiveMode === 'year' ? year.dataset.year === filter : (' ' + item.dataset.tags + ' ').indexOf(' ' + filter + ' ') !== -1);
          item.hidden = !matches;
          visible = visible || matches;
        });
        year.hidden = !visible;
      });
    }
    modeButtons.forEach(function (b) { b.addEventListener('click', function () { archiveMode = b.dataset.filterMode; applyArchiveFilter(); }); });
    tagButtons.forEach(function (b) { b.addEventListener('click', function () { selectedFilters.tag = b.dataset.filter; applyArchiveFilter(); }); });
    yearButtons.forEach(function (b) { b.addEventListener('click', function () { selectedFilters.year = b.dataset.yearFilter; applyArchiveFilter(); }); });
    try {
      var initialTag = decodeURIComponent(location.hash.slice(1));
      if (tagButtons.some(function (b) { return b.dataset.filter === initialTag; })) selectedFilters.tag = initialTag;
    } catch (e) { /* Invalid hash leaves all articles visible. */ }
    window.addEventListener('hashchange', function () {
      try {
        var tag = decodeURIComponent(location.hash.slice(1));
        if (tagButtons.some(function (b) { return b.dataset.filter === tag; })) {
          archiveMode = 'tag'; selectedFilters.tag = tag; applyArchiveFilter();
        }
      } catch (e) {}
    });
    modeGroup.hidden = false;
    applyArchiveFilter();
  }

  /* 复制按钮 */
  var copyButtons = Array.prototype.slice.call(document.querySelectorAll('.copy-btn'));
  copyButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      if (!text) return;
      var original = btn.textContent;
      var copied = function () {
        btn.classList.add('is-copied');
        btn.textContent = '已复制';
        setTimeout(function () {
          btn.classList.remove('is-copied');
          btn.textContent = original;
        }, 1500);
      };
      var fallbackCopy = function () {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          copied();
        } catch (e) {}
        document.body.removeChild(ta);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(copied, fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  });
})();
