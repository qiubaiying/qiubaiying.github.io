import path from 'node:path';
import { blogImageSize, imageLabel } from './public/image-sizing.js';
import { decodeRef } from './local-images.mjs';

export function normalizeImageLinks(markdown, imageMap) {
  return markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)|!\[\[([^\]]+)\]\]/g, (all, alt, url, wiki) => {
    const raw = (url || wiki).split('|')[0].trim().replace(/^<|>$/g, '');
    const key = decodeRef(raw).replace(/^\.\//, '');
    const target = imageMap.get(key) || imageMap.get(path.basename(key));
    const label = imageLabel(alt || `${path.basename(key)}${wiki?.includes('|') ? `|${wiki.split('|').at(-1)}` : ''}`);
    return target || (url && label.width) ? `![${label.alt}](${target || url})${blogImageSize(label.width, label.height)}` : all;
  });
}
