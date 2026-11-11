const sourceLine = /^>\s*公众号[：:]\s*(.+?)(?:\s*[|｜]\s*发布时间[：:]\s*(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?))?\s*$/;
const sourceLink = /^\[(?:原文公众号链接|原文链接)\]\((https:\/\/mp\.weixin\.qq\.com\/s(?:\/|\?)[^\s)]+)\)\s*$/;
const footnoteLine = /^\\\*原文链接：\[.*\]\((https:\/\/mp\.weixin\.qq\.com\/s(?:\/|\?)[^\s)]+)\)\s*$/;
const footnoteStyle = /^\{:\s*\.post-source\s*\}$/;

export function extractBlogSource(markdown) {
  let lines = String(markdown).replace(/^\uFEFF/, '').split(/\r?\n/);
  let source = null;
  let start = 0;
  while (start < lines.length && !lines[start].trim()) start++;
  const info = lines[start]?.match(sourceLine);
  if (info) {
    let linkLine = start + 1;
    while (linkLine < lines.length && !lines[linkLine].trim()) linkLine++;
    const link = lines[linkLine]?.match(sourceLink);
    if (link) {
      source = { account: info[1].trim(), publishedAt: info[2]?.replace(' ', 'T') || '', url: link[1] };
      lines = lines.slice(linkLine + 1);
      while (lines.length && !lines[0].trim()) lines.shift();
    }
  }
  for (let i = lines.length - 2; i >= 0; i--) {
    const note = lines[i].match(footnoteLine);
    if (!note || !footnoteStyle.test(lines[i + 1])) continue;
    const after = lines.slice(i + 2).join('\n').trim();
    if (after && !/^---\s*\n\s*\n\*\*关于我\*\*/.test(after)) continue;
    source ||= { account: 'Scond', publishedAt: '', url: note[1] };
    lines.splice(i, 2);
    if (!lines[i]?.trim() && !lines[i - 1]?.trim()) lines.splice(i, 1);
    break;
  }
  return { body: source ? lines.join('\n') : markdown, source };
}

export function formatBlogSource({ account, publishedAt, url }) {
  if (!url) return '';
  const name = account || 'Scond';
  const time = publishedAt ? `　|　发布时间：${publishedAt.replace('T', ' ')}` : '';
  return `> 公众号：${name}${time}\n\n[原文公众号链接](${url})`;
}

export function formatBlogSourceFootnote({ title, url }) {
  if (!url) return '';
  const label = String(title).replace(/\s+/g, ' ').replace(/[\\[\]*_]/g, '\\$&');
  return `\\*原文链接：[${label}](${url})\n{: .post-source }`;
}

export function sourceFromMeta(meta) {
  const url = String(meta.source_url || '');
  if (!/^https:\/\/mp\.weixin\.qq\.com\/s(?:\/|\?)[^\s<>]*$/.test(url)) return null;
  return {
    account: String(meta.source_account || 'Scond'),
    publishedAt: String(meta.source_published_at || ''),
    url
  };
}
