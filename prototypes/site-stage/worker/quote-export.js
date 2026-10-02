import { initialQuotes, calculateQuotes, quoteCsv } from "../src/quote-model.js";

export const quoteExportPath = "/downloads/quote-demo.csv";
const filename = "BB箱子_供应商比较_演示数据.csv";
const keys = initialQuotes.flatMap((row) => [`${row.id}_base`, `${row.id}_extra`]);
const numeric = /^\+?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/iu;

export function quoteExportResponse(request) {
  const url = new URL(request.url);
  if (url.pathname !== quoteExportPath) return null;
  if (!["GET", "HEAD"].includes(request.method)) {
    return new Response("请使用文件下载链接。", { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const params = url.searchParams;
  const malformed = url.search.length > 1000 || [...params.keys()].some((key) => !keys.includes(key)) || keys.some((key) => params.getAll(key).length !== 1);
  const rows = initialQuotes.map((row) => ({ ...row, base: params.get(`${row.id}_base`)?.trim() ?? "", extra: params.get(`${row.id}_extra`)?.trim() ?? "" }));
  const invalid = rows.some((row) => [row.base, row.extra].some((value) => value !== "" && !numeric.test(value))) || calculateQuotes(rows).rows.some((row) => row.invalid);
  if (malformed || invalid) return new Response("请核对报价数值后重新下载。", { status: 400 });
  return new Response(request.method === "HEAD" ? null : quoteCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bb-box-quote-demo.csv"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
