import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
import { validateArticle } from "./public-schema.mjs";
const data = JSON.parse(
  readFileSync(new URL("../content/articles.json", import.meta.url)),
);
const config = JSON.parse(
  readFileSync(new URL("../content/connections.json", import.meta.url)),
);
const slugs = new Set();
const ids = new Set();
for (const a of data) {
  validateArticle(a);
  assert(a.id && !ids.has(a.id), "Unique article id");
  ids.add(a.id);
  assert(/^[a-z0-9-]+$/.test(a.slug) && !slugs.has(a.slug), "Unique slug");
  slugs.add(a.slug);
  assert(
    a.title && a.summary && a.date && a.status && a.sections.length,
    "Complete content metadata",
  );
  const sectionIds = new Set();
  for (const s of a.sections) {
    assert(s.id && !sectionIds.has(s.id), "Unique section id");
    sectionIds.add(s.id);
    assert(s.title, "Section title");
    if (s.download) {
      assert(/^\/downloads\/[a-z0-9-]+\.md$/.test(s.download.path));
      assert(
        existsSync(new URL("../public" + s.download.path, import.meta.url)),
        `Download missing: ${s.download.path}`,
      );
    }
  }
}
for (const a of data)
  for (const s of a.related || [])
    assert(slugs.has(s), `Related article missing: ${s}`);
for (const s of [
  "chat-guide",
  "production-guide",
  "venue-guide",
  "topic-guide",
  "partner-guide",
  "revenue",
  "rights",
  "privacy",
  "bono",
  "first-meeting",
  "ai-workflow",
  "open-source",
])
  assert(slugs.has(s), `Required route missing: ${s}`);
for (const f of Object.values(config.forms)) {
  assert(
    /^https:\/\/my\.feishu\.cn\/share\/base\//.test(f.url),
    "Only verified public form links",
  );
  assert(f.verified === true, "Form must be verified before publication");
}
assert(
  !JSON.stringify(data).match(
    /(?:access_token|app_secret|device_code|verification_url)/i,
  ),
  "No credentials in content",
);
console.log(
  `Content checked: ${data.length} articles and ${Object.keys(config.forms).length} verified forms.`,
);
