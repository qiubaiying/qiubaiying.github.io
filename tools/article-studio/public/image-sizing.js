const dimensions = /^(\d{1,4})(?:x(\d{1,4}))?$/;

export function imageLabel(label) {
  const value = String(label);
  const split = value.lastIndexOf('|');
  const match = split < 0 ? null : value.slice(split + 1).match(dimensions);
  const width = match ? Number(match[1]) : 0;
  const height = match?.[2] ? Number(match[2]) : 0;
  if (!width || width > 3000 || height > 3000) return { alt: value, width: 0, height: 0 };
  return { alt: value.slice(0, split), width, height };
}

export function normalizeObsidian(md) {
  return md.replace(/!\[\[([^\]]+)\]\]/g, (_, embed) => {
    const [name, ...parts] = embed.split('|');
    const size = parts.length ? imageLabel(`image|${parts.at(-1)}`) : null;
    const label = size?.width ? `${name}|${size.width}${size.height ? `x${size.height}` : ''}` : name;
    return `![${label}](<${name}>)`;
  }).replace(/(?<!!)\[\[([^\]]+)\]\]/g, (_, link) => link.split('|').pop().replace(/\.md$/i, ''));
}

export function blogImageSize(width, height = 0) {
  return width ? `{: width="${width}"${height ? ` height="${height}"` : ''} }` : '';
}
