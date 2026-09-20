import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  List,
  X,
  MagnifyingGlass,
  Check,
} from "@phosphor-icons/react";
import { href, asset, articleHref, config, roles } from "./lib/content.js";
import { track } from "./lib/analytics.js";
export function Text({ children }) {
  return (
    <>
      {String(children)
        .split(/(?<=[，。！？；：])/u)
        .filter(Boolean)
        .map((s, i) => (
          <span className="phrase" key={i}>
            {s}
          </span>
        ))}
    </>
  );
}
export function Brand() {
  return (
    <a className="brand" href={href("/")} aria-label="BB 箱子首页">
      <img src={asset("bb-rabbit-mark.png")} alt="" width="50" height="46" />
      <span className="wordmark">
        <b>BB</b>
        <strong>箱子</strong>
      </span>
    </a>
  );
}
export function LinkButton({ children, to, secondary = false, ...props }) {
  return (
    <a
      className={`button ${secondary ? "button-secondary" : ""}`}
      href={to}
      {...props}
    >
      {children}
      <ArrowRight size={18} />
    </a>
  );
}
export function Shell({ children, path }) {
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const nav = [
    ["节目", "/show/"],
    ["这些人", "/people/"],
    ["近况", "/updates/"],
    ["幕后资料", "/backstage/"],
    ["参与", "/join/"],
  ];
  return (
    <>
      <a className="skip" href="#main">
        跳到正文
      </a>
      <header className={`header ${path === "/" ? "header-home" : ""}`}>
        <div className="nav container">
          <Brand />
          <nav
            className={menu ? "is-open" : ""}
            aria-label="主导航"
            id="navigation"
          >
            {nav.map(([label, url]) => (
              <a
                href={href(url)}
                aria-current={path === url ? "page" : undefined}
                key={url}
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            className="search-link"
            href={href("/search/")}
            aria-label="搜索网站"
          >
            <MagnifyingGlass size={22} />
          </a>
          <button
            className="menu-button"
            aria-expanded={menu}
            aria-controls="navigation"
            aria-label={menu ? "关闭导航" : "打开导航"}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X size={24} /> : <List size={25} />}
          </button>
        </div>
      </header>
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
    </>
  );
}
export function ArticleRow({ article }) {
  return (
    <a className="article-row" href={articleHref(article.slug)}>
      <div>
        <p className="meta">
          {article.status} <span>·</span> {article.date}
        </p>
        <h3>
          <Text>{article.title}</Text>
        </h3>
        <p className="muted">
          <Text>{article.summary}</Text>
        </p>
      </div>
      <ArrowUpRight size={23} aria-hidden="true" />
    </a>
  );
}
export function Contact() {
  const [copied, setCopied] = useState(false);
  return (
    <section className="contact container" id="contact">
      <div>
        <p className="eyebrow">先打个招呼</p>
        <h2>
          <Text>有兴趣，就从这里开始。</Text>
        </h2>
        <p>
          <Text>说说你想来聊什么，或者能帮上哪一块。</Text>
        </p>
        <p className="muted">
          <Text>可以先了解，再决定投入。提交意向之后，我们再具体聊。</Text>
        </p>
      </div>
      <div className="contact-actions">
        {config.wechatQr && (
          <img
            className="qr"
            src={href(config.wechatQr)}
            alt="Bono 微信联系二维码"
          />
        )}
        {config.wechatId && (
          <button
            className="text-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(config.wechatId);
                setCopied(true);
                track("contact_copy");
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? <Check /> : null}
            {copied ? "已复制微信号" : `微信：${config.wechatId}`}
          </button>
        )}
        <div className="contact-links">
          {roles.map((r) =>
            config.forms[r.id]?.url ? (
              <a
                key={r.id}
                target="_blank"
                rel="noopener noreferrer"
                href={config.forms[r.id].url}
                onClick={() => track("form_outbound", { role: r.id })}
              >
                {r.action}
                <ArrowUpRight size={18} />
              </a>
            ) : (
              <a key={r.id} href={articleHref(r.slug)}>
                {r.action}
                <ArrowRight size={18} />
              </a>
            ),
          )}
        </div>
        <small>
          <Text>表单信息只用于沟通，未经同意不会公开。</Text>
        </small>
      </div>
    </section>
  );
}
function Footer() {
  const [off, setOff] = useState(false);
  useEffect(() => {
    try {
      setOff(localStorage.getItem("bb-analytics") === "off");
    } catch {}
  }, []);
  return (
    <footer>
      <div className="footer-top container">
        <Brand />
        <p>深圳。我们先把这桌人凑起来。</p>
        <a href={config.repository} target="_blank" rel="noopener noreferrer">
          公开仓库 <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="footer-bottom container">
        <span>© {new Date().getFullYear()} BB 箱子</span>
        <a href={articleHref("privacy")}>隐私与统计</a>
        <a href={articleHref("open-source")}>资料使用说明</a>
        <button
          onClick={() => {
            try {
              localStorage.setItem("bb-analytics", off ? "on" : "off");
              setOff(!off);
            } catch {}
          }}
        >
          {off ? "已关闭可选统计" : "关闭可选统计"}
        </button>
        <span className="footer-note">
          {config.analyticsEnabled
            ? "按隐私说明收集有限访问事件"
            : "本站暂未开启访问统计"}
        </span>
      </div>
    </footer>
  );
}
