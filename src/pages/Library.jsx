import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  DownloadSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react";
import { articles, roles, config, href, articleHref, peopleGroups } from "../lib/content.js";
import { Text, ArticleRow, Contact, LinkButton } from "../components.jsx";
import { track } from "../lib/analytics.js";
import { searchArticles } from "../lib/search.js";
const collections = {
  "/show/": {
    title: "几个人，能聊出什么？",
    intro: "先看看我们想聊的话题。试聊和试录有了结果，也会放在这里。",
    types: ["show"],
    label: "节目",
  },
  "/people/": {
    title: "节目好不好看，先看坐着谁。",
    intro: "Bono 先来主持。其他位置还在找，欢迎不同背景、经历和人生阶段的人。",
    types: ["people"],
    label: "这些人",
  },
  "/updates/": {
    title: "最近在忙什么。",
    intro:
      "有进展就记下来。卡在哪里，也说清楚。哪些已经发生，哪些是下一步打算，记录里分开写。",
    types: ["updates"],
    label: "近况",
  },
  "/backstage/": {
    title: "把幕后也打开。",
    intro: "想参与，先看怎么合作。想自己做，就把方法和模板带走。",
    types: ["method", "guide"],
    label: "幕后资料",
  },
};

function PeopleDirectory({ c }) {
  return (
    <>
      <div className="page-head container">
        <p className="eyebrow">{c.label}</p>
        <h1><Text>先把位置摆出来，再等真正的人坐进来。</Text></h1>
        <p className="lede">
          <Text>这些分组只是为了让新朋友看懂项目，不代表固定职位。你做了什么，我们就记录什么；同一个人可以跨组做很多事。</Text>
        </p>
      </div>
      <section className="container people-directory">
        {peopleGroups.map((group) => (
          <section className="people-group" key={group.title}>
            <div className="people-group-head">
              <p className="eyebrow">{group.title}</p>
              <p className="muted"><Text>{group.note}</Text></p>
            </div>
            <div className="people-cards">
              {group.members.map((member, i) => {
                const card = (
                  <>
                    <div className="person-avatar" aria-hidden="true">
                      {member.name === "Bono" ? "B" : "?"}
                    </div>
                    <div className="person-card-copy">
                      <p className="meta">{member.status}</p>
                      <h2>{member.name}</h2>
                      <strong>{member.role}</strong>
                      <p><Text>{member.copy}</Text></p>
                    </div>
                    {member.slug ? <ArrowUpRight size={22} /> : null}
                  </>
                );
                return member.slug ? (
                  <a className="person-card" href={articleHref(member.slug)} key={member.role + i}>{card}</a>
                ) : (
                  <div className="person-card person-card-vacant" key={member.role + i}>{card}</div>
                );
              })}
            </div>
          </section>
        ))}
        <div className="people-principle">
          <h2>职位不是边界，贡献记录才是。</h2>
          <p><Text>拍一条宣传短视频、完成一次收音、拉来一个场地、写一份选题、修一个网站问题，都可以单独留下记录。后续会把成员页逐步做成真实贡献时间线。</Text></p>
          <div className="join-actions">
            <LinkButton to={href("/join/")}>我想认识一下</LinkButton>
            <a className="text-link" href={articleHref("governance-v01")}>看治理 V0.1 <ArrowRight size={18}/></a>
          </div>
        </div>
      </section>
      <Contact />
    </>
  );
}

export function Collection({ path }) {
  const c = collections[path];
  if (path === "/people/") return <PeopleDirectory c={c} />;
  const [tag, setTag] = useState("全部");
  const list = articles.filter((a) => c.types.includes(a.type));
  const groups = {
    "先了解过程": ["new-friend-guide", "first-meeting", "pilot-procedure", "chat-guide", "production-guide", "venue-guide", "topic-guide", "partner-guide"],
    "具体记录": ["revenue", "rights", "privacy", "equipment", "weekly-review", "recording-consent"],
    "拿走方法": ["open-source", "pilot-procedure", "weekly-review", "recording-consent"],
    "AI 工作方法": ["ai-workflow"],
  };
  const tags = Object.keys(groups);
  return (
    <>
      <div className="page-head container">
        <p className="eyebrow">{c.label}</p>
        <h1>
          <Text>{c.title}</Text>
        </h1>
        <p className="lede">
          <Text>{c.intro}</Text>
        </p>
      </div>
      <div className="collection container">
        {path === "/backstage/" && (
          <div className="filters" aria-label="资料分类">
            {["全部", ...tags].map((t) => (
              <button
                key={t}
                aria-pressed={tag === t}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}
        <div className="collection-list">
          {list
            .filter((a) => tag === "全部" || groups[tag]?.includes(a.slug))
            .map((a) => (
              <ArticleRow article={a} key={a.id} />
            ))}
        </div>
        <div className="reading-next">
          <h2>想一起做点什么？</h2>
          <LinkButton to={href("/join/")}>看看参与方式</LinkButton>
        </div>
      </div>
    </>
  );
}
export function Join() {
  return (
    <>
      <div className="page-head container">
        <p className="eyebrow">参与 BB 箱子</p>
        <h1>
          <Text>先认识，再一起做。</Text>
        </h1>
        <p className="lede">
          <Text>
            不用一上来就承诺长期加入。说说你是谁，想参与哪一块，我们再聊时间和具体安排。
          </Text>
        </p>
      </div>
      <section className="container join-layout">
        <div className="join-roles">
          {roles.map((r) => (
            <section key={r.id} className="join-role">
              <h2>{r.title}</h2>
              <p>
                <Text>{r.copy}</Text>
              </p>
              <div className="join-actions">
                <a className="text-link" href={articleHref(r.slug)}>
                  先看参与说明 <ArrowRight size={18} />
                </a>
                <FormLink role={r} />
              </div>
            </section>
          ))}
        </div>
        <aside className="before-join">
          <p className="eyebrow">参与前知道这些</p>
          <h2>先把条件说清楚。</h2>
          <p>
            <Text>目前没有固定工资。未来有收入时，按事先确认的规则分配。</Text>
          </p>
          <p>
            <Text>填表只是开始沟通，不代表同意录制或公开个人资料。</Text>
          </p>
          <p>
            <Text>投入时间与署名先说清楚。现金报酬和退出安排，也在开始前确认。</Text>
          </p>
          {[
            ["钱和贡献", "revenue"],
            ["录制与素材授权", "rights"],
            ["隐私与信息使用", "privacy"],
          ].map(([t, s]) => (
            <a href={articleHref(s)} key={s}>
              {t}
              <ArrowUpRight size={18} />
            </a>
          ))}
        </aside>
      </section>
      <Contact />
    </>
  );
}
function FormLink({ role }) {
  const form = config.forms[role.id];
  return form?.url ? (
    <a
      className="button"
      href={form.url}
      rel="noopener noreferrer"
      target="_blank"
      onClick={() => track("form_outbound", { role: role.id })}
    >
      填写{role.title}意向
      <ArrowUpRight size={18} />
    </a>
  ) : (
    <p className="muted">收集入口正在接通，请先阅读参与说明。</p>
  );
}
function ContentText({ text }) {
  if (!text) return null;
  if (text.includes('/join/')) return text.split(/(?<=[，。！？；：])/u).filter(Boolean).map((clause, i) =>
    <span className="phrase" key={i}>{clause.split(/(\/join\/)/).map((part, j) =>
      part === '/join/' ? <a className="inline-link" href={href('/join/')} key={j}>参与页面</a> : part
    )}</span>
  );
  return <Text>{text}</Text>;
}
export function Article({ article: a }) {
  const role = roles.find((r) => r.slug === a.slug);
  const related = articles.filter((r) => a.related?.includes(r.slug));
  return (
    <article>
      <header className="article-head container">
        <a
          className="back-link"
          href={href(
            a.type === "method" || a.type === "guide"
              ? "/backstage/"
              : `/${a.type === "show" ? "show" : a.type === "updates" ? "updates" : "people"}/`,
          )}
        >
          返回栏目
        </a>
        <p className="meta">
          {a.status} · {a.date}
        </p>
        <h1>
          <Text>{a.title}</Text>
        </h1>
        <p className="lede">
          <Text>{a.summary}</Text>
        </p>
        {a.slug === "new-friend-guide" && <a className="text-link" href={href('/intro/')}>打开一页节目介绍 <ArrowUpRight size={18}/></a>}
      </header>
      <div className="article-layout container">
        <aside className="toc">
          <p>这篇里面</p>
          <nav aria-label="文章目录">
            {a.sections.map((s) => (
              <a href={`#${s.id}`} key={s.id}>
                <Text>{s.title}</Text>
              </a>
            ))}
          </nav>
        </aside>
        <div className="prose">
          {a.sections.map((s) => (
            <section id={s.id} key={s.id}>
              <h2>
                <Text>{s.title}</Text>
              </h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i}>
                  <ContentText text={p} />
                </p>
              ))}
              {s.bullets?.length > 0 && (
                <ul>
                  {s.bullets.map((b, i) => (
                    <li key={i}>
                      <ContentText text={b} />
                    </li>
                  ))}
                </ul>
              )}
              {s.table && (
                <div
                  className="table-scroll"
                  tabIndex="0"
                  role="region"
                  aria-label={s.title}
                >
                  <table>
                    <caption>小屏幕可左右滑动查看</caption>
                    <thead>
                      <tr>
                        {s.table.headers.map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((c, j) => (
                            <td key={j}>
                              <Text>{c}</Text>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {s.download && (
                <a
                  className="download"
                  href={href(s.download.path)}
                  download
                  onClick={() =>
                    track("download", { path: `/read/${a.slug}/` })
                  }
                >
                  <DownloadSimple size={20} />
                  {s.download.label}
                </a>
              )}
            </section>
          ))}
          {role && (
            <div className="article-action">
              <h2>想再聊聊？</h2>
              <p>留下意向，我们再具体了解。</p>
              <FormLink role={role} />
            </div>
          )}
          <div className="source-note">
            <p>资料状态：{a.status}</p>
            <p>最近整理：{a.date} · BB 箱子</p>
            <p>
              <Text>
                资料依据：项目讨论与筹备记录。具体规则和模板，请按本页状态及正文说明使用。
              </Text>
            </p>
            <a
              href={`${config.repository}/commits/main/content/articles.json`}
              target="_blank"
              rel="noopener noreferrer"
            >
              查看公开修订记录 <ArrowUpRight size={15} />
            </a>
          </div>
          {a.slug === "open-source" && <div className="public-data">
            <h2>公开数据与代码</h2>
            <p><Text>这里只包含网站已经公开的资料，报名信息不会进入下载文件。</Text></p>
            <a className="text-link" href={config.repository} target="_blank" rel="noopener noreferrer">打开 GitHub 仓库 <ArrowUpRight size={18}/></a>
            <div className="join-actions">
              <a className="download" download href={href('/data/articles.json')} onClick={()=>track('download')}>文章 JSON <DownloadSimple size={18}/></a>
              <a className="download" download href={href('/data/index.csv')} onClick={()=>track('download')}>资料目录 CSV <DownloadSimple size={18}/></a>
            </div>
          </div>}
          {related.length > 0 && (
            <div className="related">
              <h2>顺着看下去</h2>
              {related.map((r) => (
                <ArticleRow article={r} key={r.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
export function Search() {
  const [q, setQ] = useState("");
  useEffect(
    () => setQ(new URLSearchParams(location.search).get("q") || ""),
    [],
  );
  const results = useMemo(() => searchArticles(q, articles), [q]);
  return (
    <>
      <div className="page-head container">
        <p className="eyebrow">全站搜索</p>
        <h1>想找哪一块？</h1>
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="query">搜索节目、参与方式或幕后资料</label>
          <div>
            <MagnifyingGlass size={24} />
            <input
              id="query"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="试试：剪辑、分成、装懂"
              maxLength={100}
            />
            <button type="submit">搜索</button>
          </div>
        </form>
        <p className="muted"><Text>搜索只在浏览器内进行，不记录你输入的词。</Text></p>
      </div>
      <section className="container search-results" aria-live="polite">
        {q ? (
          <>
            <p>
              <Text>{results.length
                ? `找到 ${results.length} 篇内容`
                : "暂时没找到相关内容。试试更短的词。"}</Text>
            </p>
            {results.map((a) => (
              <ArticleRow article={a} key={a.id} />
            ))}
          </>
        ) : (
          <div className="filters">
            {["参与", "制作", "分成", "开源", "AI", "设备"].map((t) => (
              <button key={t} onClick={() => setQ(t)}>
                {t}
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
export function Admin() {
  const [key, setKey] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setData(null);
    try {
      const r = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!r.ok || !r.headers.get("content-type")?.includes("application/json"))
        throw new Error(
          r.status === 401
            ? "管理密钥不正确。"
            : "统计服务尚未接通，或暂时不可用。",
        );
      setData(await r.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="container page-head admin">
      <p className="eyebrow">内部统计</p>
      <h1><Text>访问和参与，分开看。</Text></h1>
      <p className="lede">
        <Text>这里查询网站事件。有效意向和实际参与，请在飞书管理区查看。</Text>
      </p>
      {!config.analyticsEnabled ? (
        <p className="notice">
          <Text>当前公开站点未启用统计采集。统计服务完成部署后，还需通过验收才会开始计数。</Text>
        </p>
      ) : null}
      <form onSubmit={load}>
        <label htmlFor="admin-key">管理密钥</label>
        <input
          id="admin-key"
          type="password"
          value={key}
          autoComplete="off"
          required
          onChange={(e) => setKey(e.target.value)}
        />
        <button className="button" disabled={busy}>
          {busy ? "正在查询" : "查看统计"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {data && (
        <>
          <p><Text>这里只统计已收到的事件。会话不等于人数。全部时间按北京时间显示。</Text></p>
          <p>采集起始：{data.collectionStartedAt ? new Date(data.collectionStartedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false }) : "尚未开始"}</p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>页面</th>
                  <th>事件</th>
                  <th>来源</th>
                  <th>次数</th>
                </tr>
              </thead>
              <tbody>
                {data.daily.map((r, i) => (
                  <tr key={i}>
                    <td>{r.day}</td>
                    <td>{r.path}</td>
                    <td>{r.event}</td>
                    <td>{r.source}</td>
                    <td>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!data.daily.length && <p>尚无记录。</p>}
        </>
      )}
    </section>
  );
}
