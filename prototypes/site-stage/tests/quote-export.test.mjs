import test from "node:test";
import assert from "node:assert/strict";
import { initialQuotes, quoteCsv, quoteExportUrl } from "../src/quote-model.js";
import { quoteExportResponse } from "../worker/quote-export.js";
import worker from "../worker/index.js";

const requestFor = (rows, options) => new Request(new URL(quoteExportUrl(rows), "https://example.test"), options);

test("downloads current values as an uncached CSV attachment", async () => {
  const rows = initialQuotes.map((row) => row.id === "C" ? { ...row, extra: "0.5" } : { ...row });
  const response = quoteExportResponse(requestFor(rows));
  assert.equal(response.status, 200);
  assert.equal(Buffer.from(await response.arrayBuffer()).toString("utf8"), quoteCsv(rows));
  assert.match(response.headers.get("content-disposition"), /attachment;.*filename\*=UTF-8''/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-type"), /text\/csv/);
});

test("missing fees remain missing in the downloadable file", async () => {
  const response = quoteExportResponse(requestFor(initialQuotes));
  assert.match(await response.text(), /C,9.5,,,费用待补齐/);
});

test("rejects unknown, repeated, incomplete and non-numeric parameters", () => {
  const valid = new URL(quoteExportUrl(initialQuotes), "https://example.test");
  for (const change of [
    (url) => url.searchParams.set("A_base", "=1+1"),
    (url) => url.searchParams.set("B_extra", "-1"),
    (url) => url.searchParams.set("C_base", "10001"),
    (url) => url.searchParams.set("private", "value"),
    (url) => url.searchParams.append("A_base", "2"),
    (url) => url.searchParams.delete("C_extra"),
  ]) {
    const url = new URL(valid);
    change(url);
    assert.equal(quoteExportResponse(new Request(url)).status, 400);
  }
});

test("supports HEAD and rejects write methods", async () => {
  const head = quoteExportResponse(requestFor(initialQuotes, { method: "HEAD" }));
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  assert.equal(quoteExportResponse(requestFor(initialQuotes, { method: "POST" })).status, 405);
  assert.equal(quoteExportResponse(new Request("https://example.test/another.csv")), null);
});

test("the deployed worker handles downloads before static routing", async () => {
  const response = await worker.fetch(requestFor(initialQuotes), { ASSETS: { fetch() { throw new Error("Static assets should not handle generated downloads"); } } });
  assert.equal(response.status, 200);
  assert.equal(Buffer.from(await response.arrayBuffer()).toString("utf8"), quoteCsv(initialQuotes));
});
