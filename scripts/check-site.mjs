import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const required = [
  '_config.yml',
  'index.html',
  '_includes/head.html',
  '_includes/nav.html',
  '_includes/footer.html',
  '_layouts/default.html',
  '_layouts/page.html',
  '_layouts/post.html',
  'css/custom.css',
  'js/site.js',
  'pwa/manifest.json'
];

const errors = [];
const templateFiles = [
  'index.html', 'about.html', 'photos.html', 'tags.html', '404.html', 'offline.html', 'feed.xml',
  '_includes/head.html', '_includes/nav.html', '_includes/footer.html',
  '_layouts/default.html', '_layouts/page.html', '_layouts/post.html', '_layouts/photo-page.html', '_layouts/keynote.html'
];

for (const file of required) {
  const content = await readFile(new URL(file, root), 'utf8');
  if (!content.trim()) errors.push(`${file} is empty`);
}

JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
JSON.parse(await readFile(new URL('pwa/manifest.json', root), 'utf8'));

const openTags = new Set(['if', 'unless', 'for', 'case', 'capture', 'raw']);
for (const file of templateFiles) {
  const source = (await readFile(new URL(file, root), 'utf8'))
    .replace(/{%\s*comment\s*%}[\s\S]*?{%\s*endcomment\s*%}/g, '');
  const stack = [];
  for (const match of source.matchAll(/{%\s*([^%]+?)\s*%}/g)) {
    const command = match[1].trim().split(/\s+/)[0];
    if (openTags.has(command)) stack.push(command);
    if (command.startsWith('end')) {
      const expected = command.slice(3);
      const actual = stack.pop();
      if (actual !== expected) errors.push(`${file} has mismatched Liquid tags: expected end${actual || '(none)'}, found ${command}`);
    }
  }
  if (stack.length) errors.push(`${file} has unclosed Liquid tag: ${stack.at(-1)}`);
}

const postYears = await readdir(new URL('_posts/', root));
for (const year of postYears) {
  const files = await readdir(new URL(`_posts/${year}/`, root));
  for (const file of files.filter((name) => name.endsWith('.md'))) {
    const content = await readFile(new URL(`_posts/${year}/${file}`, root), 'utf8');
    if (!content.startsWith('---')) errors.push(join('_posts', year, file) + ' is missing front matter');
    const headerImage = content.match(/^header-img:\s*(?:"([^"]+)"|'([^']+)'|([^\r\n]+))/m);
    if (headerImage) {
      const imagePath = (headerImage[1] || headerImage[2] || headerImage[3]).trim().replace(/^\//, '');
      try { await access(new URL(imagePath, root)); } catch { errors.push(`${join('_posts', year, file)} references missing ${imagePath}`); }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Site structure OK · ${required.length} core files · ${templateFiles.length} Liquid templates · ${postYears.length} post folders`);
