import test from "node:test";
import assert from "node:assert/strict";
import { semanticSegments, normalizeSearch, searchPublicArticles, formatArticleDate } from "../src/semantic.js";
import { articles, categories, downloads, searchCatalogue, searchEntries } from "../src/data/catalogue.js";

const fixture = [
  { id: "fee", title: "费用评审", summary: "核对报价范围。", status: "演示资料", tags: ["Excel"], sections: [{ title: "来源", paragraphs: ["附件保留来源。"], table: { headers: ["用途", "比例"], rows: [["项目留存", "20%"]] } }], privateNote: "不公开的字段" },
  { id: "rights", title: "录制与授权", summary: "开机前确认。", status: "草案", tags: ["节目"], sections: [{ title: "声音", paragraphs: ["公开声音单独确认。"] }] },
];

test("search matches all terms across public fields and table values", () => {
  assert.deepEqual(searchPublicArticles(fixture, " EXCEL 20% ").map((item) => item.id), ["fee"]);
  assert.deepEqual(searchPublicArticles(fixture, "授权 声音").map((item) => item.id), ["rights"]);
});

test("search uses literal text, handles full width, and excludes unrelated private fields", () => {
  assert.equal(normalizeSearch("  ＥＸＣＥＬ  "), "excel");
  assert.equal(searchPublicArticles(fixture, "[.*]").length, 0);
  assert.equal(searchPublicArticles(fixture, "不公开的字段").length, 0);
});

test("empty and absent queries retain source order without mutating records", () => {
  const before = JSON.stringify(fixture);
  const result = searchPublicArticles(fixture, "  ");
  assert.deepEqual(result.map((item) => item.id), ["fee", "rights"]);
  assert.notEqual(result, fixture);
  assert.equal(JSON.stringify(fixture), before);
  assert.equal(searchPublicArticles(fixture, "找不到的词").length, 0);
});

test("semantic segments preserve names, amounts, punctuation, and the original wording", () => {
  const text = "BB 箱子在深圳。课程线上 199 元。许可为 CC BY-SA 4.0。";
  const parts = semanticSegments(text);
  assert.equal(parts.join(""), text);
  assert.ok(parts.some((part) => part.includes("199 元")));
  assert.ok(parts.some((part) => part.includes("CC BY-SA 4.0")));
  assert.deepEqual(semanticSegments(""), []);
});

test("semantic segments keep closing punctuation and dependent relations together", () => {
  const text = "使用前确认（范围、期限）。如果，时间有变化，再确认。";
  const parts = semanticSegments(text);
  assert.equal(parts.join(""), text);
  assert.equal(parts[0], "使用前确认（范围、期限）。");
  assert.ok(parts.every((part) => !/^[，。！？；：）】]/u.test(part)));
  assert.ok(parts.every((part) => !/^再/u.test(part)));
});

test("reading copy keeps conditional instructions complete and avoids repeated next sentences", () => {
  const text = "涉及事实更正时，说明哪句话有误，并提供可核对的信息。需要撤回某段内容时，尽早说清范围。";
  const parts = semanticSegments(text);
  assert.deepEqual(parts, ["事实更正须指出有误的话。", "提供可以核对的信息。", "撤回内容时尽早说清范围。"]);
  assert.ok(parts.every((part) => !/(?:时|前|后)[，：；]$/u.test(part)));
  assert.deepEqual(semanticSegments("课程材料与宣传片，各自保留检查状态。"), ["课程材料保留自己的检查状态。", "宣传片也有单独的检查记录。"]);
  assert.deepEqual(semanticSegments("有继续合作意向，再谈时间、角色和工作量。"), ["有合作意向就讨论时间与角色。", "工作量也要一起讨论。"]);
});

test("reading copy keeps the measured 320px summary relations complete", () => {
  assert.deepEqual(semanticSegments("把一个大题目，变成参与者愿意接话的具体问题。"), ["大题目需要落到具体问题。", "问题要让参与者愿意接话。"]);
  assert.deepEqual(semanticSegments("桌椅、电源、噪声和拍摄许可，都要在约定录制前确认。"), ["录制前确认桌椅与电源。", "噪声和拍摄许可也要先确认。"]);
  assert.deepEqual(semanticSegments("先接一个清楚的小任务，把素材、声音、字幕和交付逐项做实。"), ["先接一个范围清楚的小任务。", "素材、声音和字幕逐项做实。", "交付也要逐项做实。"]);
  assert.deepEqual(semanticSegments("试聊后整理追问，再确认具体录制安排。"), ["试聊后整理追问。", "随后确认具体录制安排。"]);
  assert.deepEqual(semanticSegments("商业化准备：说明服务、交付、参与入口与实际费用。"), ["商业化准备：", "说明服务与交付。", "写清参与入口与实际费用。"]);
});

test("reading copy keeps deployment and course conditions in complete statements", () => {
  assert.deepEqual(semanticSegments("托管日志的处理条件，随部署平台另行说明。"), ["托管日志按部署平台处理。", "具体条件另行说明。"]);
  assert.deepEqual(semanticSegments("实际保留安排，部署时重新说明。"), ["部署时说明实际保留安排。"]);
  assert.deepEqual(semanticSegments("统计启用前，先公布保留与关闭方式。"), ["启用统计前公布保留安排。", "关闭方式也须先公布。"]);
  assert.deepEqual(semanticSegments("课时与跟练安排，经实际试讲确定。"), ["实际试讲后确定课时。", "跟练安排也按试讲结果确定。"]);
  assert.deepEqual(semanticSegments("会员互动的公开范围，单独确认。"), ["会员互动的公开范围须单独确认。"]);
});

test("table reading retains every original field while allowing semantic grouping", () => {
  const fields = articles.flatMap((article) => article.sections.flatMap((section) => section.table ? [...section.table.headers, ...section.table.rows.flat()] : []));
  assert.ok(fields.length > 0);
  for (const field of fields) assert.equal(semanticSegments(field, { literal: true }).join(""), field);
  const source = "录制前确认费用、时间、清洁和复原责任。";
  assert.equal(semanticSegments(source, { literal: true }).join(""), source);
  assert.notEqual(semanticSegments(source).join(""), source);
});

test("visible reading text reports units requiring a rendered-line review", (context) => {
  const fields = articles.flatMap((article) => [article.title, article.summary, article.status, ...article.sections.flatMap((section) => [section.title, ...(section.paragraphs || []), ...(section.bullets || []), ...(section.table?.headers || []), ...(section.table?.rows || []).flat(), section.download?.label || ""])])
    .concat(categories.flatMap((category) => [category.label, category.description]), downloads.flatMap((item) => [item.title, item.summary, item.status]), searchEntries.flatMap((item) => [item.title, item.summary, item.status]));
  const equivalentWidth = (value) => [...value].reduce((width, char) => width + (/[A-Za-z0-9\s/\-_.%]/u.test(char) ? 0.5 : 1), 0);
  const long = [...new Set(fields.flatMap((field) => semanticSegments(field)))].filter((unit) => equivalentWidth(unit) > 20).map((text) => ({ text, equivalentWidth: equivalentWidth(text) }));
  context.diagnostic(`Rendered-line review candidates above 20 equivalent characters: ${JSON.stringify(long)}`);
  assert.deepEqual(long, []);
});

test("reading copy retains recorded numbers, ranges, percentages, and key names", () => {
  const fields = articles.flatMap((article) => [article.title, article.summary, ...article.sections.flatMap((section) => [section.title, ...(section.paragraphs || []), ...(section.bullets || [])])]);
  const numbers = (value) => String(value).match(/[0-9]+(?:\.[0-9]+)?(?:[—–-][0-9]+)?%?/gu) || [];
  const names = (value) => String(value).match(/CC BY-SA 4\.0|IFRS9|Pocket 4|DJI|Bono|MIT/gu) || [];
  for (const source of fields) {
    const displayed = semanticSegments(source).join("");
    assert.deepEqual(numbers(displayed), numbers(source), `Recorded numbers must remain: ${source}`);
    assert.deepEqual(names(displayed), names(source), `Recorded names must remain: ${source}`);
  }
});

test("dates retain their actual recorded day without timezone conversion", () => {
  assert.equal(formatArticleDate("2026-09-21"), "2026-09-21");
  assert.equal(formatArticleDate("2026-10-02"), "2026-10-02");
  assert.equal(formatArticleDate(undefined), "");
  assert.equal(formatArticleDate("2024.06.12"), "");
});

test("catalogue search covers actual products, people, records, participation, and downloads", () => {
  const kinds = new Set(searchCatalogue().map((item) => item.kind));
  for (const kind of ["product", "person", "update", "article", "participation", "download"]) assert.ok(kinds.has(kind));
  assert.ok(searchCatalogue("ＩＦＲＳ９").some((item) => item.kind === "person" && item.id === "bono"));
  assert.ok(searchCatalogue("199 Codex").some((item) => item.kind === "product" && item.id === "course"));
  assert.ok(searchCatalogue("空白模板 AI").some((item) => item.kind === "download" && item.id === "ai-work-log"));
});

test("public catalogue excludes removed topic records and has working article targets", () => {
  const slugs = new Set(articles.map((item) => item.slug));
  for (const slug of ["pretending-to-know", "the-price-of-face", "ask-yourself-why"]) assert.equal(slugs.has(slug), false);
  for (const item of searchEntries) {
    if (!item.href.includes("page=article")) continue;
    const slug = new URL(item.href, "https://example.invalid").searchParams.get("slug");
    assert.ok(slugs.has(slug), `Article target must exist: ${slug}`);
  }
  assert.ok(articles.every((item) => categories.some((category) => category.id === item.type)));
});

test("catalogue search treats punctuation literally and leaves public records intact", () => {
  const before = JSON.stringify(searchEntries);
  assert.equal(searchCatalogue("[.*]").length, 0);
  assert.equal(searchCatalogue("不会有这个公开词").length, 0);
  searchCatalogue("费用");
  assert.equal(JSON.stringify(searchEntries), before);
});
