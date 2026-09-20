import { config } from "./content.js";
export function analyticsAllowed() {
  if (typeof window === "undefined" || !config.analyticsEnabled) return false;
  try {
    return (
      localStorage.getItem("bb-analytics") !== "off" &&
      navigator.doNotTrack !== "1" &&
      !navigator.globalPrivacyControl
    );
  } catch {
    return false;
  }
}
export function track(event, data = {}) {
  if (!analyticsAllowed()) return;
  try {
    const now = Date.now();
    let session = JSON.parse(sessionStorage.getItem("bb-session") || "null");
    if (!session || now - session.last > 1800000) {
      session = { id: crypto.randomUUID(), last: now };
      sessionStorage.removeItem("bb-source");
    }
    session.last = now;
    sessionStorage.setItem("bb-session", JSON.stringify(session));
    const source = new URLSearchParams(location.search).get("utm_source");
    if (["douyin", "wechat", "event", "friend", "github"].includes(source))
      sessionStorage.setItem("bb-source", source);
    const body = {
      id: crypto.randomUUID(),
      session: session.id,
      event,
      path: data.path || location.pathname,
      source: sessionStorage.getItem("bb-source") || "unknown",
      ...(data.role ? { role: data.role } : {}),
    };
    fetch(new URL("/api/events", location.origin), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* Statistics never interrupt reading or participation. */
  }
}
