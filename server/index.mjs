import http from "node:http";
import { readFileSync, mkdirSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { createStore, normalizeEvent, authorized } from "./events.mjs";
const root = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const articles = JSON.parse(
  readFileSync(path.join(root, "content/articles.json")),
);
const routes = [
  "/",
  "/show/",
  "/people/",
  "/updates/",
  "/backstage/",
  "/join/",
  "/search/",
  "/intro/",
  ...articles.map((a) => `/read/${a.slug}/`),
];
const allowedPaths = new Set(routes.flatMap((p) => [p, `/bb-box-show${p}`]));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};
export function createApp({
  store,
  secret,
  origin,
  enabled = false,
  staticDir = path.join(root, "dist/client"),
} = {}) {
  if (enabled) store.startCollection();
  store.retain();
  const rate = new Map();
  let lastSweep = 0;
  const send = (res, status, body) => {
    res.writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    });
    res.end(JSON.stringify(body));
  };
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://local");
      if (url.pathname === "/api/events") {
        if (!enabled) return send(res, 503, { error: "analytics_disabled" });
        if (req.method !== "POST")
          return send(res, 405, { error: "method_not_allowed" });
        if (!origin || req.headers.origin !== origin)
          return send(res, 403, { error: "origin_not_allowed" });
        if (!req.headers["content-type"]?.startsWith("application/json"))
          return send(res, 415, { error: "json_required" });
        if (Number(req.headers["content-length"] || 0) > 4096)
          return send(res, 413, { error: "body_too_large" });
        const now = Date.now();
        if (now - lastSweep > 60000) {
          for (const [k, v] of rate) if (now - v.start > 60000) rate.delete(k);
          lastSweep = now;
        }
        const ip = req.socket.remoteAddress;
        const limit = rate.get(ip) || { start: now, count: 0 };
        if (now - limit.start > 60000) {
          limit.start = now;
          limit.count = 0;
        }
        limit.count++;
        rate.set(ip, limit);
        if (limit.count > 120) return send(res, 429, { error: "rate_limit" });
        let raw = "";
        for await (const chunk of req) {
          raw += chunk;
          if (Buffer.byteLength(raw) > 4096)
            return send(res, 413, { error: "body_too_large" });
        }
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          return send(res, 400, { error: "invalid_json" });
        }
        const event = normalizeEvent(data, allowedPaths);
        if (!event) return send(res, 400, { error: "invalid_event" });
        if (
          /bot|spider|crawler|headless/i.test(req.headers["user-agent"] || "")
        )
          return send(res, 202, { ignored: true });
        store.record(event);
        return send(res, 202, { accepted: true });
      }
      if (url.pathname === "/api/admin/stats") {
        if (req.method !== "GET")
          return send(res, 405, { error: "method_not_allowed" });
        if (!authorized(req.headers.authorization, secret))
          return send(res, 401, { error: "unauthorized" });
        return send(res, 200, store.stats());
      }
      if (url.pathname.startsWith("/api/"))
        return send(res, 404, { error: "not_found" });
      if (!["GET", "HEAD"].includes(req.method))
        return send(res, 405, { error: "method_not_allowed" });
      let pathname;
      try {
        pathname = decodeURIComponent(url.pathname);
      } catch {
        return send(res, 400, { error: "bad_path" });
      }
      if (pathname.includes("\0")) return send(res, 400, { error: "bad_path" });
      let file = path.resolve(staticDir, "." + pathname);
      if (!file.startsWith(staticDir + path.sep) && file !== staticDir)
        return send(res, 403, { error: "forbidden" });
      try {
        if (statSync(file).isDirectory()) file = path.join(file, "index.html");
      } catch {}
      let body;
      let status = 200;
      try {
        body = await readFile(file);
      } catch {
        file = path.join(staticDir, "404.html");
        try {
          body = await readFile(file);
        } catch {
          body = Buffer.from("Not found");
        }
        status = 404;
      }
      res.writeHead(status, {
        "content-type": mime[path.extname(file)] || "application/octet-stream",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin",
        "content-security-policy":
          "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'",
        "cache-control": file.endsWith(".html")
          ? "no-cache"
          : "public, max-age=3600",
      });
      res.end(req.method === "HEAD" ? undefined : body);
    } catch {
      send(res, 500, { error: "server_error" });
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const runtime = process.env.BB_DATA_DIR || path.join(root, "runtime");
  mkdirSync(runtime, { recursive: true, mode: 0o700 });
  const enabled = process.env.BB_ANALYTICS_ENABLED === "true";
  const secret = process.env.BB_ADMIN_KEY;
  const origin = process.env.BB_SITE_ORIGIN;
  if (enabled && (!origin || !secret || secret.length < 32))
    throw Error(
      "Analytics needs BB_SITE_ORIGIN and a management key of at least 32 characters.",
    );
  const store = createStore(path.join(runtime, "analytics.sqlite"));
  const server = createApp({ store, secret, origin, enabled });
  const interval = setInterval(() => store.retain(), 3600000);
  interval.unref();
  server.listen(Number(process.env.PORT || 4174), "127.0.0.1", () =>
    console.log(
      "BB Box server listening. Analytics " +
        (enabled ? "enabled" : "disabled") +
        ".",
    ),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () =>
      server.close(() => {
        clearInterval(interval);
        store.close();
        process.exit(0);
      }),
    );
}
