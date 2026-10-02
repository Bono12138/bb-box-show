import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, ArrowLeft, DownloadSimple, FileText, MagnifyingGlass } from "@phosphor-icons/react";
import { articles, categories, downloads, articleHref, searchCatalogue } from "./data/catalogue.js";
import { semanticSegments, formatArticleDate } from "./semantic.js";
import "./library.css";

const repository = "https://github.com/Bono12138/bb-box-show";
const originalData = `${repository}/blob/main/content/articles.json`;
const originalHistory = `${repository}/commits/main/content/articles.json`;
const libraryHref = (category = "all") => `/?page=library&category=${encodeURIComponent(category)}`;
const searchHref = (query) => `/?page=search&q=${encodeURIComponent(query)}`;
const kindLabels = { article: "公开文章", product: "产品介绍", person: "人物", update: "制作近况", participation: "参与方式", download: "下载资料" };

export function ReadingText({ text, className = "", literal = false }) {
  return <span className={`reading-text ${className}`}>{semanticSegments(text, { literal }).map((part, index) => <span className="reading-unit" key={`${index}-${part}`}>{part.includes("/join/") ? part.split(/(\/join\/)/u).map((piece, pieceIndex) => piece === "/join/" ? <a className="reading-inline-link" href="/?page=join" key={pieceIndex}>参与页面</a> : piece) : part}</span>)}</span>;
}

function SearchForm({ query, onSearch }) {
  const [value, setValue] = useState(query);
  useEffect(() => setValue(query), [query]);
  const submit = (event) => {
    event.preventDefault();
    if (onSearch) onSearch(value.trim());
    else {
      window.history.pushState({}, "", searchHref(value.trim()));
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };
  return <form className="library-search" role="search" onSubmit={submit}>
    <label className="reading-visually-hidden" htmlFor="public-search">搜索公开资料</label>
    <div className="library-search-field"><MagnifyingGlass size={24} aria-hidden="true" /><input id="public-search" name="q" value={value} onChange={(event) => setValue(event.target.value)} placeholder="搜索公开资料" autoComplete="off" spellCheck="false" /></div>
    <button type="submit" aria-label="搜索"><ArrowRight size={26} aria-hidden="true" /></button>
  </form>;
}

function CategoryNav({ category, search }) {
  return <nav className="library-categories" aria-label="公开资料分类">
    <a href={libraryHref()} aria-current={!search && category === "all" ? "page" : undefined}>全部资料</a>
    {categories.map((item) => <a key={item.id} href={libraryHref(item.id)} aria-current={!search && category === item.id ? "page" : undefined}>{item.label}</a>)}
  </nav>;
}

function DownloadList({ items = downloads, heading = true }) {
  return <div className="library-downloads">
    {heading && <><h2>拿走资料</h2><p><ReadingText text="说明、草案和空白模板。" /><ReadingText text="按自己的实际安排使用。" /></p></>}
    <div>{items.map((item) => <a className="library-download" key={item.id || item.path} href={item.path} download>
      <FileText size={28} aria-hidden="true" /><span><ReadingText text={item.title} /><small>{item.status || "公开附件"}</small></span><DownloadSimple size={24} aria-hidden="true" />
    </a>)}</div>
  </div>;
}

function articleImage(item) {
  if (item.type === "show" || item.type === "people") return "/assets/project-show.png";
  if (/course|campaign|课堂|课程/u.test(`${item.slug} ${item.title}`)) return "/assets/campaign/A.png";
  return "/assets/project-process.png";
}

function ArticleRow({ article, index }) {
  const hasImage = index < 5;
  return <a className={`library-row ${hasImage ? "has-image" : "text-row"}`} href={articleHref(article.slug)}>
    {hasImage ? <img src={articleImage(article)} alt="" loading="lazy" /> : <span className="library-row-number">{String(index + 1).padStart(2, "0")}</span>}
    <div className="library-row-copy"><h2><ReadingText text={article.title} /></h2><p><ReadingText text={article.summary} /></p></div>
    <div className="library-row-meta"><time dateTime={article.date}>{formatArticleDate(article.date)}</time><span>{article.status}</span></div>
    <ArrowRight className="library-row-arrow" size={26} aria-hidden="true" />
  </a>;
}

function SearchRow({ item }) {
  return <a className="library-search-row" href={item.href} download={item.kind === "download" || undefined}>
    <div><p className="library-result-kind">{kindLabels[item.kind] || "公开资料"}</p><h2><ReadingText text={item.title} /></h2><p><ReadingText text={item.summary} /></p></div>
    <div className="library-row-meta">{item.date && <time dateTime={item.date}>{formatArticleDate(item.date)}</time>}<span>{item.status}</span></div>
    <ArrowRight size={26} aria-hidden="true" />
  </a>;
}

export function Library({ category = "all", query = "", search = false, onSearch }) {
  const visible = useMemo(() => articles.filter((article) => category === "all" || article.type === category), [category]);
  const results = useMemo(() => search ? searchCatalogue(query) : [], [search, query]);
  const currentCategory = categories.find((item) => item.id === category);
  const listing = search ? results : visible;
  return <section className="reading-page library-page" aria-labelledby="reading-heading">
    <header className="library-intro">
      <div><h1 id="reading-heading" tabIndex={-1}>{search ? "找资料。" : "往里看。"}</h1><p className="library-subtitle"><ReadingText text={search ? "搜索这里的公开文章和模板。" : "过程、规则、方法，都留在这里。"} /></p></div>
      <SearchForm query={query} onSearch={onSearch} />
    </header>
    <div className="library-layout">
      <CategoryNav category={category} search={search} />
      <div className="library-list-region">
        <p className="library-result-count" aria-live="polite">{search ? "搜索结果" : currentCategory?.label || "全部资料"}<span>{listing.length} 项</span></p>
        {!listing.length ? <div className="library-empty"><h2>暂时没找到。</h2><p><ReadingText text={search ? "试试换个词，或回到全部资料。" : "这个分类还没有公开资料。"} /></p><a href={libraryHref()}>查看全部资料<ArrowRight size={22} aria-hidden="true" /></a></div> : <div>{search ? listing.map((item) => <SearchRow item={item} key={`${item.kind}-${item.id}`} />) : listing.map((article, index) => <ArticleRow key={article.id} article={article} index={index} />)}</div>}
        {!search && visible.length > 0 && <p className="library-image-note">节目与制作场景图为视觉示意。</p>}
      </div>
      <aside className="library-right-rail" aria-label="公开下载"><DownloadList /></aside>
    </div>
  </section>;
}

function ReadingTable({ table, sectionId }) {
  return <div className="reading-table-region">
    <table className="reading-table"><thead><tr>{table.headers.map((header, index) => <th key={`${index}-${header}`} scope="col"><ReadingText text={header} literal /></th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><ReadingText text={cell} literal /></td>)}</tr>)}</tbody></table>
    <div className="reading-table-stacked" aria-label="表格内容">{table.rows.map((row, rowIndex) => <dl key={`${sectionId}-${rowIndex}`}>{table.headers.map((header, cellIndex) => <div key={cellIndex}><dt><ReadingText text={header} literal /></dt><dd><ReadingText text={row[cellIndex]} literal /></dd></div>)}</dl>)}</div>
  </div>;
}

function ArticleSection({ section }) {
  return <section className="reading-section" id={`section-${section.id}`}>
    <h2><ReadingText text={section.title} /></h2>
    {section.paragraphs?.map((paragraph, index) => <p key={index}><ReadingText text={paragraph} /></p>)}
    {section.bullets?.length > 0 && <ul>{section.bullets.map((bullet, index) => <li key={index}><ReadingText text={bullet} /></li>)}</ul>}
    {section.table && <ReadingTable table={section.table} sectionId={section.id} />}
    {section.download && <a className="reading-section-download" href={section.download.path} download><DownloadSimple size={22} aria-hidden="true" /><ReadingText text={section.download.label} /></a>}
  </section>;
}

export function Article({ slug, article: providedArticle }) {
  const article = providedArticle || articles.find((item) => item.slug === slug);
  if (!article) return <section className="reading-page reading-missing"><h1 id="reading-heading" tabIndex={-1}>这份资料暂未找到。</h1><a href={libraryHref()}>返回全部资料<ArrowRight size={23} aria-hidden="true" /></a></section>;
  const related = articles.filter((item) => article.related?.includes(item.slug));
  const ownDownloads = downloads.filter((item) => item.articleSlug === article.slug);
  return <article className="reading-page article-page">
    <a className="reading-back" href={libraryHref(article.type)}><ArrowLeft size={21} aria-hidden="true" />返回资料目录</a>
    <header className="reading-article-header">
      <div className="reading-meta"><span>{article.status}</span><time dateTime={article.date}>{formatArticleDate(article.date)}</time></div>
      <h1 id="reading-heading" tabIndex={-1}><ReadingText text={article.title} /></h1>
      <p className="reading-lede"><ReadingText text={article.summary} /></p>
    </header>
    <div className="reading-article-layout">
      <aside className="reading-toc"><nav aria-label="这篇里面"><p>这篇里面</p>{article.sections.map((section, index) => <a href={`#section-${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span><ReadingText text={section.title} /></a>)}</nav></aside>
      <div className="reading-body">{article.sections.map((section) => <ArticleSection section={section} key={section.id} />)}
        {related.length > 0 && <section className="reading-related"><h2>接着看。</h2>{related.map((item) => <a href={articleHref(item.slug)} key={item.id}><ReadingText text={item.title} /><ArrowRight size={24} aria-hidden="true" /></a>)}</section>}
        {ownDownloads.length > 0 && <section className="reading-attachments"><h2>这篇的下载资料</h2><DownloadList items={ownDownloads} heading={false} /></section>}
        <section className="reading-sources"><h2>原始资料与修订</h2><p><ReadingText text="原公开资料保存在 GitHub。" /><ReadingText text="本地新增内容尚未发布。" /></p><div><a href={originalData} target="_blank" rel="noopener noreferrer">原公开资料<ArrowUpRight size={20} aria-hidden="true" /></a><a href={originalHistory} target="_blank" rel="noopener noreferrer">原仓库修订记录<ArrowUpRight size={20} aria-hidden="true" /></a></div></section>
      </div>
    </div>
  </article>;
}
