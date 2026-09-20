import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { approvedArticle, mergePublic, validateArticle } from '../scripts/public-schema.mjs';
import { searchArticles } from '../src/lib/search.js';

const articles = JSON.parse(readFileSync(new URL('../content/articles.json', import.meta.url)));
const packet = () => ({ approval: { approvedBy: 'test-reviewer', approvedAt: '2026-09-21T00:00:00Z', scope: 'public' }, article: structuredClone(articles[0]) });
test('search finds every suggested topic and handles empty and missing queries', () => {
  for(const q of ['参与','制作','分成','开源','AI','设备','ai native']) assert(searchArticles(q,articles).length, `No result for ${q}`);
  assert.deepEqual(searchArticles('   ', articles), []);
  assert.deepEqual(searchArticles('不存在的测试关键词qzx', articles), []);
  assert(searchArticles('分成', articles).some(a=>a.slug==='revenue'));
});
test('all published article fields follow the public schema', () => articles.forEach(validateArticle));
test('import accepts reviewed public fields and excludes approval metadata', () => {
  const p = packet();
  assert.deepEqual(approvedArticle(p), p.article);
  assert.equal(approvedArticle(p).approval, undefined);
});
test('private fields, internal links and credentials cannot enter an import', () => {
  for (const mutate of [p => p.article.contact = 'private', p => p.article.sections[0].ownerEmail = 'private', p => p.article.summary = 'https://my.feishu.cn/base/private', p => p.article.summary = 'access_token=secret', p => p.approval.scope = 'internal', p => p.approval.approvedAt = 'unknown']) {
    const p = packet(); mutate(p); assert.throws(() => approvedArticle(p));
  }
});
test('updates keep stable addresses and valid related content', () => {
  const a = approvedArticle(packet());
  a.title = '测试更新';
  const merged = mergePublic(articles, a);
  assert.equal(merged.length, articles.length);
  assert.equal(merged[0].title, '测试更新');
  assert.notEqual(articles[0].title, '测试更新');
  assert.throws(() => mergePublic(articles, { ...a, slug: 'changed' }));
  assert.throws(() => mergePublic(articles, { ...a, related: ['missing'] }));
});
