/*
 * xiuxing-extract.mjs
 * 从既有自包含 3D 页反解出共享运行时、共享样式与全部图配置。
 *
 * 用法：node scripts/xiuxing-extract.mjs
 * 产物：
 *   css/xiuxing-3d.css          共享样式（含内嵌字体，零外部请求）
 *   js/xiuxing-runtime.js       共享 Three.js r186 + 装配器运行时
 *   _data/xiuxing/pages/*.json  既有各图的完整业务配置（几何数据的站内副本）
 *
 * 既有 21 页保持原样不动；反解产物只供新增图谱复用。
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const XIU = path.join(ROOT, 'xiuxing');
const PAGES = path.join(ROOT, '_data', 'xiuxing', 'pages');
const BASE = 'shierjing';

const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, s) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s, 'utf8');
};

const base = read(path.join(XIU, BASE + '.html'));
const st = base.indexOf('<style>');
const en = base.indexOf('</style>');
const sc = base.indexOf('<script type="module">');
const cfg = base.indexOf('var Qg=');
if ([st, en, sc, cfg].some((v) => v < 0)) {
  throw new Error('基准页结构不符，停止反解');
}

const openTag = '<script type="module">';
const css = base.slice(st + '<style>'.length, en);
const runtime = base.slice(sc + openTag.length, cfg);

if (/<\/script/i.test(runtime)) {
  throw new Error('运行时含 </script，抽成外部文件会破坏页面');
}
const nonData = [...css.matchAll(/url\(([^)]{0,80})/g)]
  .map((m) => m[1])
  .filter((u) => !u.trim().startsWith('data:'));
if (nonData.length) {
  throw new Error('样式含外部资源引用，需先处理：' + JSON.stringify(nonData));
}

write(path.join(ROOT, 'css', 'xiuxing-3d.css'), css.trim() + '\n');

const tail = [
  '',
  '/* 图配置由页面在运行时之前注入；既有自包含页不受影响 */',
  'var Qg=window.__XIUXING_CONFIG;',
  'if(Qg&&Qg.id){Kg(Qg)}else{console.error("[xiuxing] 缺少图配置")}',
  ''
].join('\n');
write(path.join(ROOT, 'js', 'xiuxing-runtime.js'), runtime + tail);

const htmlFiles = fs.readdirSync(XIU)
  .filter((f) => f.endsWith('.html') && fs.statSync(path.join(XIU, f)).size > 100000);
let ok = 0;
for (const f of htmlFiles) {
  const s = read(path.join(XIU, f));
  const i = s.indexOf('var Qg=');
  const j = s.indexOf(';Kg(Qg)');
  if (i < 0 || j < 0) {
    console.warn('跳过（无配置块）', f);
    continue;
  }
  let o;
  try {
    o = vm.runInNewContext('(' + s.slice(i + 'var Qg='.length, j) + ')');
  } catch (e) {
    console.warn('求值失败', f, e.message);
    continue;
  }
  write(path.join(PAGES, path.basename(f, '.html') + '.json'), JSON.stringify(o, null, 2) + '\n');
  ok++;
}
console.log(`反解完成：样式 ${css.length} 字符，运行时 ${runtime.length} 字符，配置 ${ok}/${htmlFiles.length} 份`);
