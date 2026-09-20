import { useEffect } from "react";
import { Shell } from "./components.jsx";
import { Home } from "./pages/Home.jsx";
import { Article, Collection, Join, Search, Admin } from "./pages/Library.jsx";
import { articles, basePath, routePath } from "./lib/content.js";
import { track } from "./lib/analytics.js";
import { Intro } from "./pages/Intro.jsx";
export function App({ path: initialPath }) {
  const path =
    initialPath ||
    (typeof window !== "undefined" ? routePath(window.location.pathname) : "/");
  const article = path.startsWith("/read/")
    ? articles.find((a) => `/read/${a.slug}/` === path)
    : null;
  useEffect(() => {
    track("page_view", { path });
    const timer = setTimeout(() => {
      if (document.visibilityState === "visible")
        track("engaged_read", { path });
    }, 30000);
    return () => clearTimeout(timer);
  }, [path]);
  let page;
  if (path === "/") page = <Home />;
  else if (path === "/intro/") page = <Intro />;
  else if (article) page = <Article article={article} />;
  else if (path === "/join/") page = <Join />;
  else if (path === "/search/") page = <Search />;
  else if (path === "/admin/") page = <Admin />;
  else if (["/show/", "/people/", "/updates/", "/backstage/"].includes(path))
    page = <Collection path={path} />;
  else
    page = (
      <section className="page-head container">
        <p className="eyebrow">页面未找到</p>
        <h1>这页暂时没找到。</h1>
        <p>可以回首页，或搜索你想看的内容。</p>
        <a className="button" href={basePath}>
          回到首页
        </a>
      </section>
    );
  return <Shell path={path}>{page}</Shell>;
}
