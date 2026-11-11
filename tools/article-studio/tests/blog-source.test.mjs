import test from 'node:test';
import assert from 'node:assert/strict';
import { extractBlogSource, formatBlogSource, formatBlogSourceFootnote, sourceFromMeta } from '../public/blog-source.js';

test('moves an existing blog attribution out of article body', () => {
  const source = {
    account: 'Scond',
    publishedAt: '2026-09-25T17:29',
    url: 'https://mp.weixin.qq.com/s/iN0eO_5WpdBDWMl_60yWcA'
  };
  const markdown = `${formatBlogSource(source)}\n\n正文第一段。`;
  assert.deepEqual(extractBlogSource(markdown), { body: '正文第一段。', source });
});

test('does not remove a source-like paragraph without a valid link', () => {
  const markdown = '> 公众号：Scond　|　发布时间：2026-09-25 17:29\n\n正文第一段。';
  assert.deepEqual(extractBlogSource(markdown), { body: markdown, source: null });
});

test('reads source metadata without adding it to article body', () => {
  assert.deepEqual(sourceFromMeta({ source_account: 'Scond', source_published_at: '2026-09-29T00:00', source_url: 'https://mp.weixin.qq.com/s/abc' }), {
    account: 'Scond', publishedAt: '2026-09-29T00:00', url: 'https://mp.weixin.qq.com/s/abc'
  });
  assert.equal(sourceFromMeta({ source_url: 'javascript:alert(1)' }), null);
});

test('puts a small literal-star source note before the About separator and removes it on edit', () => {
  const url = 'https://mp.weixin.qq.com/s/KBWB7uU5zCP1ne957LBO3w';
  const note = formatBlogSourceFootnote({ title: 'Apple Watch Ultra 4使用一周，应该不会双持佳明了', url });
  assert.equal(note, `\\*原文链接：[Apple Watch Ultra 4使用一周，应该不会双持佳明了](${url})\n{: .post-source }`);
  const markdown = `正文。\n\n${note}\n\n---\n\n**关于我**  \n旅行、跑步。`;
  assert.deepEqual(extractBlogSource(markdown), {
    body: '正文。\n\n---\n\n**关于我**  \n旅行、跑步。',
    source: { account: 'Scond', publishedAt: '', url }
  });
  assert.deepEqual(extractBlogSource(`正文。\n\n${note}`), {
    body: '正文。\n',
    source: { account: 'Scond', publishedAt: '', url }
  });
});
