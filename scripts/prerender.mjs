import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { render } from "../dist/prerender/prerender.js";
const root = new URL("../", import.meta.url);
const client = new URL("../dist/client/", import.meta.url);
const articles = JSON.parse(
  await readFile(new URL("content/articles.json", root)),
);
const config = JSON.parse(
  await readFile(new URL("content/connections.json", root)),
);
const template = await readFile(new URL("index.html", client), "utf8");
const escape = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const info = [
  ["/", "在深圳，凑一桌有话的人"],
  ["/show/", "节目与候选话题"],
  ["/people/", "这些人"],
  ["/updates/", "最近在忙什么"],
  ["/backstage/", "幕后资料"],
  ["/join/", "参与 BB 箱子"],
  ["/search/", "全站搜索"],
  ["/admin/", "内部统计"],
  ["/intro/", "一页认识 BB 箱子"],
  ...articles.map((a) => [`/read/${a.slug}/`, a.title, a.summary]),
];
for (const [route, title, summary] of info) {
  const desc =
    summary ||
    "BB 箱子在深圳组建主要中文的多人喜剧聊天节目。4–6 人，包含主持人。来聊聊，或一起把节目做出来。";
  const canonical = config.siteUrl + route;
  const meta = `<link rel="canonical" href="${escape(canonical)}"/><meta property="og:title" content="${escape(title)}｜BB 箱子"/><meta property="og:description" content="${escape(desc)}"/><meta property="og:type" content="${route.startsWith("/read/") ? "article" : "website"}"/><meta property="og:url" content="${escape(canonical)}"/><meta property="og:image" content="${escape(config.siteUrl)}/assets/hero-studio.png"/>${["/admin/", "/search/"].includes(route) ? '<meta name="robots" content="noindex,follow"/>' : ""}`;
  const html = template
    .replace(/<title>.*?<\/title>/, `<title>${escape(title)}｜BB 箱子</title>`)
    .replace(
      /<meta\s+name="description"[\s\S]*?\/>/,
      `<meta name="description" content="${escape(desc)}"/>`,
    )
    .replace("</head>", `${meta}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`);
  const dir = new URL(route.slice(1), client);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL("index.html", dir), html);
}
const sitemap = info
  .filter(([r]) => !["/admin/", "/search/"].includes(r))
  .map(([r]) => `<url><loc>${escape(config.siteUrl + r)}</loc></url>`)
  .join("");
await writeFile(
  new URL("sitemap.xml", client),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`,
);
await writeFile(
  new URL("robots.txt", client),
  `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /bb-box-show/admin/\nSitemap: ${config.siteUrl}/sitemap.xml\n`,
);
await mkdir(new URL("data/", client), { recursive: true });
await writeFile(
  new URL("data/articles.json", client),
  JSON.stringify(articles),
);
const csv = (v) => `"${String(v).replaceAll('"', '""')}"`;
await writeFile(new URL("data/index.csv", client), '\uFEFF' + [
  ['id','type','title','date','status','url'].map(csv).join(','),
  ...articles.map(a => [a.id,a.type,a.title,a.date,a.status,config.siteUrl + `/read/${a.slug}/`].map(csv).join(',')),
].join('\r\n') + '\r\n');
await writeFile(
  new URL("404.html", client),
  template
    .replace('<div id="root"></div>', `<div id="root">${render("/404/")}</div>`)
    .replace("</head>", '<meta name="robots" content="noindex"/></head>'),
);
console.log(
  `Rendered ${info.length} routes, public data, sitemap and 404 page.`,
);
