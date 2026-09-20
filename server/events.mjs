import { DatabaseSync } from "node:sqlite";
import { timingSafeEqual } from "node:crypto";
export const events = new Set([
  "page_view",
  "engaged_read",
  "form_outbound",
  "contact_copy",
  "download",
]);
const sources = new Set([
  "douyin",
  "wechat",
  "event",
  "friend",
  "github",
  "unknown",
]);
const roles = new Set(["chat", "production", "venue", "topic", "partner"]);
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function normalizeEvent(value, paths) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (
    Object.keys(value).some(
      (k) => !["id", "session", "event", "path", "source", "role"].includes(k),
    )
  )
    return null;
  if (
    !uuid.test(value.id) ||
    !uuid.test(value.session) ||
    !events.has(value.event) ||
    !paths.has(value.path) ||
    !sources.has(value.source)
  )
    return null;
  if (value.role && !roles.has(value.role)) return null;
  if (value.event === "form_outbound" && !roles.has(value.role)) return null;
  return { ...value, role: value.role || "" };
}
export function authorized(header, secret) {
  if (!secret || secret.length < 32 || !header?.startsWith("Bearer "))
    return false;
  const actual = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function createStore(filename = ":memory:") {
  const db = new DatabaseSync(filename);
  db.exec(
    `PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY, session TEXT NOT NULL, event TEXT NOT NULL,path TEXT NOT NULL,source TEXT NOT NULL,role TEXT NOT NULL,created INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS daily(day TEXT NOT NULL,path TEXT NOT NULL,event TEXT NOT NULL,source TEXT NOT NULL,role TEXT NOT NULL,count INTEGER NOT NULL,PRIMARY KEY(day,path,event,source,role)); CREATE TABLE IF NOT EXISTS metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);`,
  );
  const insert = db.prepare(
    "INSERT OR IGNORE INTO events VALUES(?,?,?,?,?,?,?)",
  );
  const aggregate = db.prepare(
    "INSERT INTO daily VALUES(?,?,?,?,?,1) ON CONFLICT(day,path,event,source,role) DO UPDATE SET count=count+1",
  );
  function retain(now = Date.now()) {
    db.prepare("DELETE FROM events WHERE created < ?").run(now - 30 * 86400000);
    const cutoff = new Date(now);
    cutoff.setUTCMonth(cutoff.getUTCMonth() - 12);
    db.prepare("DELETE FROM daily WHERE day < ?").run(
      cutoff.toISOString().slice(0, 10),
    );
  }
  return {
    startCollection(now = Date.now()) {
      db.prepare("INSERT OR IGNORE INTO metadata VALUES('collectionStartedAt', ?)").run(new Date(now).toISOString());
    },
    record(event, now = Date.now()) {
      retain(now);
      const day = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);
      db.exec("BEGIN");
      try {
        const r = insert.run(
          event.id,
          event.session,
          event.event,
          event.path,
          event.source,
          event.role,
          now,
        );
        if (r.changes)
          aggregate.run(day, event.path, event.event, event.source, event.role);
        db.exec("COMMIT");
        return Boolean(r.changes);
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
    stats(now = Date.now()) {
      retain(now);
      return {
        timeZone: "Asia/Shanghai",
        collectionStartedAt: db.prepare("SELECT value FROM metadata WHERE key='collectionStartedAt'").get()?.value || null,
        daily: db
          .prepare("SELECT * FROM daily ORDER BY day DESC,path,event")
          .all(),
        sessions30d: db
          .prepare("SELECT count(DISTINCT session) AS count FROM events")
          .get().count,
      };
    },
    retain,
    close: () => db.close(),
  };
}
