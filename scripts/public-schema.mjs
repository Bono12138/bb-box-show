import assert from 'node:assert/strict';

const fields = (object, allowed, label) => {
  assert(object && typeof object === 'object' && !Array.isArray(object), `${label}: expected object`);
  for (const key of Object.keys(object)) assert(allowed.includes(key), `${label}: unknown field ${key}`);
};
const text = (value, label, max = 2000) => assert(typeof value === 'string' && value.trim() && value.length <= max, `${label}: invalid text`);
const array = (value, label, max = 100) => assert(Array.isArray(value) && value.length <= max, `${label}: invalid list`);
const keyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateArticle(a) {
  fields(a, ['id','slug','type','title','summary','date','status','tags','related','sections'], 'article');
  for (const name of ['id', 'slug']) assert(keyPattern.test(a[name]), `Invalid ${name}`);
  assert(['show','people','guide','method','updates'].includes(a.type), 'Invalid content type');
  for (const name of ['title', 'summary', 'status']) text(a[name], name, 300);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(a.date) && new Date(a.date).toISOString().startsWith(a.date), 'Invalid date');
  for (const name of ['tags','related']) {
    array(a[name], name, 30);
    a[name].forEach(v => text(v, name, 100));
  }
  array(a.sections, 'sections', 40);
  assert(a.sections.length, 'Article needs content');
  const ids = new Set();
  for (const s of a.sections) {
    fields(s, ['id','title','paragraphs','bullets','table','download'], 'section');
    assert(keyPattern.test(s.id) && !ids.has(s.id), 'Invalid or duplicate section id');
    ids.add(s.id);
    text(s.title, 'section title', 150);
    for (const name of ['paragraphs','bullets']) if (s[name]) {
      array(s[name], name);
      s[name].forEach(v => text(v, name));
    }
    if (s.table) {
      fields(s.table, ['headers','rows'], 'table');
      array(s.table.headers, 'headers', 8);
      assert(s.table.headers.length, 'Table needs headers');
      s.table.headers.forEach(v => text(v, 'header', 100));
      array(s.table.rows, 'rows');
      for (const row of s.table.rows) {
        array(row, 'row', 8);
        assert(row.length === s.table.headers.length, 'Table column count mismatch');
        row.forEach(v => text(v, 'cell'));
      }
    }
    if (s.download) {
      fields(s.download, ['label','path'], 'download');
      text(s.download.label, 'download label', 100);
      assert(/^\/downloads\/[a-z0-9-]+\.md$/.test(s.download.path), 'Invalid download path');
    }
  }
  const serialized = JSON.stringify(a);
  assert(!/(?:access_token|app_secret|refresh_token|device_code|verification_url|ghp_[a-z0-9]{20}|github_pat_|-----BEGIN .*PRIVATE KEY)/i.test(serialized), 'Possible credential in public content');
  assert(!/https:\/\/[^/]*feishu\.cn\/(?:base|wiki|docx)\//i.test(serialized), 'Internal Feishu links cannot be imported');
  return a;
}

export function approvedArticle(packet) {
  fields(packet, ['approval','article'], 'packet');
  fields(packet.approval, ['approvedBy','approvedAt','scope'], 'approval');
  text(packet.approval.approvedBy, 'reviewer', 100);
  assert(packet.approval.scope === 'public', 'Public approval required');
  assert(typeof packet.approval.approvedAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(packet.approval.approvedAt) && Number.isFinite(Date.parse(packet.approval.approvedAt)), 'Approval timestamp required');
  return structuredClone(validateArticle(packet.article));
}

export function mergePublic(articles, article) {
  articles.forEach(validateArticle);
  assert(!articles.some(a => a.slug === article.slug && a.id !== article.id), 'Slug belongs to another article');
  const old = articles.find(a => a.id === article.id);
  assert(!old || old.slug === article.slug, 'Changing a published address requires a redirect migration');
  const result = old ? articles.map(a => a.id === article.id ? article : a) : [...articles, article];
  const slugs = new Set(result.map(a => a.slug));
  for (const a of result) for (const related of a.related) assert(slugs.has(related), `Missing related article: ${related}`);
  return result;
}
