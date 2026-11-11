// Pure text transforms shared by the toolbar and its regression tests.
export function formatSelection(text, start, end, format) {
  const pairs = { bold: ['**', '**'], italic: ['*', '*'], underline: ['<u>', '</u>'], strike: ['~~', '~~'] };
  if (pairs[format]) {
    const [open, close] = pairs[format];
    if (text.slice(start - open.length, start) === open && text.slice(end, end + close.length) === close) {
      return { text: text.slice(0, start - open.length) + text.slice(start, end) + text.slice(end + close.length), start: start - open.length, end: end - open.length };
    }
    const selected = text.slice(start, end) || '在这里输入文字';
    return { text: text.slice(0, start) + open + selected + close + text.slice(end), start: start + open.length, end: start + open.length + selected.length };
  }
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = text.indexOf('\n', Math.max(start, end - 1));
  const lineEnd = nextBreak < 0 ? text.length : nextBreak;
  const prefix = { heading: '## ', quote: '> ', list: '- ' }[format];
  if (!prefix) return { text, start, end };
  const lines = text.slice(lineStart, lineEnd).split('\n');
  const remove = lines.every(line => line.startsWith(prefix));
  const result = lines.map(line => remove ? line.slice(prefix.length) : prefix + line).join('\n');
  return { text: text.slice(0, lineStart) + result + text.slice(lineEnd), start: lineStart, end: lineStart + result.length };
}
