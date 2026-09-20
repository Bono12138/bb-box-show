import { readFile, writeFile, rename, access } from 'node:fs/promises';
import { approvedArticle, mergePublic } from './public-schema.mjs';

const [filename, option] = process.argv.slice(2);
if (!filename || (option && option !== '--apply')) throw Error('Usage: node scripts/import-public.mjs <approved-public.json> [--apply]');
const target = new URL('../content/articles.json', import.meta.url);
const packet = JSON.parse(await readFile(filename, 'utf8'));
const article = approvedArticle(packet);
for (const s of article.sections) if (s.download) await access(new URL('../public' + s.download.path, import.meta.url));
const articles = mergePublic(JSON.parse(await readFile(target, 'utf8')), article);
if (option === '--apply') {
  const temporary = new URL(`../content/.import-${process.pid}.json`, import.meta.url);
  await writeFile(temporary, JSON.stringify(articles, null, 2) + '\n', { flag: 'wx' });
  await rename(temporary, target);
  console.log(`Updated public article ${article.id}. Review the Git diff, build and inspect before publishing.`);
} else {
  console.log(`Checked ${article.id}. No file changed. Approval metadata must be retained in the private publishing record.`);
}
