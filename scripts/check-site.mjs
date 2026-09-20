import { readFile, stat, readdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/client/', import.meta.url));
const config = JSON.parse(await readFile(new URL('../content/connections.json', import.meta.url)));
const articles = JSON.parse(await readFile(new URL('../content/articles.json', import.meta.url)));
const home = await readFile(path.join(root, 'index.html'), 'utf8');
const base = home.match(/src="([^"]*)assets\/index-[^"]+\.js"/)[1];
const origin = new URL(config.siteUrl).origin;
const files = [];
async function walk(dir) { for (const entry of await readdir(dir, { withFileTypes: true })) {
  const file = path.join(dir, entry.name);
  if (entry.isDirectory()) await walk(file); else if (file.endsWith('.html')) files.push(file);
}}
await walk(root);
let links = 0;
for (const file of files) {
  const html = await readFile(file, 'utf8');
  assert(/<main\b[^>]*\bid="main"[^>]*>[\s\S]+?<\/main>/.test(html), `Missing rendered body: ${file}`);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `One H1: ${file}`);
  assert(!/access_token|app_secret|github_pat_|\/api\/auth/i.test(html), `Private field in ${file}`);
  const current = new URL(base + path.relative(root, file).replace(/index\.html$/, ''), origin);
  for (const match of html.matchAll(/(?:href|src)="([^"#]+|#[^"]+)"/g)) {
    const url = new URL(match[1].replace(/&amp;/g, '&'), current);
    if (url.origin !== origin) continue;
    const linkBase = match[1].startsWith(config.siteUrl) ? new URL(config.siteUrl).pathname.replace(/\/$/, '') + '/' : base;
    if (!url.pathname.startsWith(linkBase)) throw Error(`Link outside deployed base: ${url}`);
    let target = path.join(root, decodeURIComponent(url.pathname.slice(linkBase.length)));
    let info;
    try { info = await stat(target); } catch { throw Error(`Broken link in ${file}: ${url}`); }
    if (info.isDirectory()) target = path.join(target, 'index.html');
    await stat(target);
    if (url.hash && target.endsWith('.html')) {
      const body = await readFile(target, 'utf8');
      assert(body.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor: ${url}`);
    }
    links++;
  }
}
for (const a of articles) {
  const html = await readFile(path.join(root, `read/${a.slug}/index.html`), 'utf8');
  for (const s of a.sections) assert(html.includes(`id="${s.id}"`), `Missing section ${a.slug}/${s.id}`);
  assert(html.includes(`rel="canonical" href="${config.siteUrl}/read/${a.slug}/"`));
}
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
assert(!sitemap.includes('/admin/') && !sitemap.includes('/search/'));
assert((await readFile(path.join(root, 'admin/index.html'), 'utf8')).includes('noindex'));
assert.deepEqual(JSON.parse(await readFile(path.join(root, 'data/articles.json'))), articles);
console.log(`Checked ${files.length} rendered pages, ${links} local links, public data and private-route indexing. Base: ${base}`);
