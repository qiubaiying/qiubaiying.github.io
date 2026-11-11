import test from 'node:test';
import assert from 'node:assert/strict';
import { imageLabel, normalizeObsidian } from '../public/image-sizing.js';
import { normalizeImageLinks } from '../blog-image-links.mjs';

test('keeps Obsidian image widths for preview, blog Markdown and copied images', () => {
  const source = '![[IMG_7430.jpeg|482]]\n![[IMG_7405.png|111]]\n![[未设尺寸.png]]';
  const imported = normalizeObsidian(source);
  assert.match(imported, /!\[IMG_7430\.jpeg\|482\]\(<IMG_7430\.jpeg>\)/);
  assert.match(imported, /!\[IMG_7405\.png\|111\]\(<IMG_7405\.png>\)/);
  assert.deepEqual(imageLabel('IMG_7430.jpeg|482'), { alt: 'IMG_7430.jpeg', width: 482, height: 0 });
  const blog = normalizeImageLinks(imported, new Map([
    ['IMG_7430.jpeg', '/img/first.jpg'], ['IMG_7405.png', '/img/second.png'], ['未设尺寸.png', '/img/third.png']
  ]));
  assert.match(blog, /!\[IMG_7430\.jpeg\]\(\/img\/first\.jpg\)\{: width="482" \}/);
  assert.match(blog, /!\[IMG_7405\.png\]\(\/img\/second\.png\)\{: width="111" \}/);
  assert.match(blog, /!\[未设尺寸\.png\]\(\/img\/third\.png\)/);
});
