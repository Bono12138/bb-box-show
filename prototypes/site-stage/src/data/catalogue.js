import articleData from "./articles.json" with { type: "json" };

export const publicSite = "https://bono12138.github.io/bb-box-show";
export const repository = "https://github.com/Bono12138/bb-box-show";

export const articleHref = (slug) => "/?page=article&slug=" + encodeURIComponent(slug);
export const productHref = (id) => "/?project=" + encodeURIComponent(id);
export const articles = articleData;
export const articleBySlug = Object.fromEntries(articles.map((article) => [article.slug, article]));
export const getArticle = (slug) => articleBySlug[slug] || null;

export const categories = [
  { id: "show", label: "节目", description: "节目介绍与当前筹备。" },
  { id: "people", label: "人物", description: "认识发起人和参与者。" },
  { id: "guide", label: "参与与规则", description: "业务介绍、参与指南与授权说明。" },
  { id: "method", label: "方法与模板", description: "设备、协作、复盘和公开方法。" },
  { id: "updates", label: "制作近况", description: "按日期查看实际进展。" },
];

export const products = [
  {
    id: "show", label: "节目", title: "多人喜剧聊天节目",
    summary: "在深圳凑一桌有话的人。从经历里找话题，一起接话、追问。",
    status: "筹备与招募", date: "2026-10-02", articleSlug: "show-overview",
    href: productHref("show"), image: "project-show.png",
    facts: ["深圳", "主要中文", "4–6 人，包含主持人", "Bono 初期主持并参与聊天"],
    tags: ["节目", "深圳", "喜剧", "聊天"],
  },
  {
    id: "course", label: "课程", title: "AI 与 Codex 课程",
    summary: "一节完整实操课。从工具准备走到规划、制作、检查与发布。",
    status: "课程筹备", date: "2026-09-30", articleSlug: "course-overview",
    href: productHref("course"), image: "project-course.png",
    facts: ["线上 199 元", "深圳线下 399 元", "核心课程一致", "第三方工具费用另付"],
    tags: ["课程", "ChatGPT", "Codex", "Skills", "MCP", "多 Agent", "GitHub", "自动化", "199元", "399元"],
  },
  {
    id: "group", label: "问答群", title: "BB箱子问答群",
    summary: "围绕 AI、自媒体与商业交流。Bono 看见问题就回答。",
    status: "预售期筹备", date: "2026-09-30", articleSlug: "group-overview",
    href: productHref("group"), image: "project-course.png",
    facts: ["199 元／年", "不设会员总量上限", "起算、退款与续费待定"],
    tags: ["问答群", "AI", "自媒体", "商业", "199元"],
  },
  {
    id: "activities", label: "活动", title: "内容型活动",
    summary: "先准备乱讲 PPT。玩法、排期与价格，按单次活动确认。",
    status: "活动筹备", date: "2026-09-30", articleSlug: "activities-overview",
    href: productHref("activities"), image: "project-show.png",
    facts: ["乱讲 PPT 形式已认可", "玩法与价格待确认", "按单次活动说明参加条件"],
    tags: ["活动", "乱讲PPT", "深圳"],
  },
  {
    id: "process", label: "公开制作", title: "作品与制作记录",
    summary: "看作品怎样做出来。留下实际修改、检查结果与可复用资料。",
    status: "持续整理", date: "2026-10-02", articleSlug: "process-overview",
    href: productHref("process"), image: "project-process.png",
    facts: ["作品与过程", "版本与复盘", "代码、公开方法与模板"],
    tags: ["制作", "作品", "开源", "模板", "复盘"],
  },
];

export const people = [
  {
    id: "bono", name: "Bono", title: "Bono", label: "发起人",
    role: "BB 箱子发起人、课程讲师、初期主持",
    summary: "发起 BB 箱子，筹备课程与聊天节目，参与网站和制作资料。",
    articleSlug: "bono", href: articleHref("bono"),
    date: "2026-10-02", status: "已确认可用介绍", photo: null,
    facts: ["前安永（EY）咨询师", "跨境 fintech 独角兽 IFRS9 实施负责人", "Cursor 深圳站、香港站活动负责人"],
    tags: ["Bono", "讲师", "主持", "EY", "IFRS9", "Cursor"],
  },
];

export const updates = articles
  .filter((article) => article.type === "updates")
  .map((article) => ({ ...article, articleSlug: article.slug, href: articleHref(article.slug) }))
  .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

export const participation = [
  {
    id: "chat", label: "来聊天", title: "聊天成员",
    summary: "愿意讲自己的经历，也愿意听别人接话。",
    articleSlug: "chat-guide", href: articleHref("chat-guide"),
    formUrl: "https://my.feishu.cn/share/base/shrcnEGXqwOLHCpoeI6aNnHNzPe",
    tags: ["参与", "聊天", "出镜"],
  },
  {
    id: "production", label: "一起制作", title: "制作伙伴",
    summary: "拍摄、收音、剪辑与字幕，先约定一件具体工作。",
    articleSlug: "production-guide", href: articleHref("production-guide"),
    formUrl: "https://my.feishu.cn/share/base/shrcnYaFFYiw1Ch4scGlKehsiEG",
    tags: ["参与", "制作", "拍摄", "收音", "剪辑", "字幕"],
  },
  {
    id: "venue", label: "提供场地", title: "场地与设备",
    summary: "说明可用空间、时间与费用，再约现场检查。",
    articleSlug: "venue-guide", href: articleHref("venue-guide"),
    formUrl: "https://my.feishu.cn/share/base/shrcnhhUi4jUUmGIPQ5DLKnNVOd",
    tags: ["参与", "场地", "设备", "深圳"],
  },
  {
    id: "topic", label: "带个话题", title: "话题与故事",
    summary: "从一件具体的事开始，带来经历或想继续问的问题。",
    articleSlug: "topic-guide", href: articleHref("topic-guide"),
    formUrl: "https://my.feishu.cn/share/base/shrcnQj99UiVarzJECq5ziEkWIc",
    tags: ["参与", "话题", "故事", "提问"],
  },
  {
    id: "partner", label: "谈合作", title: "合作支持",
    summary: "先摆清资源、费用、交付与使用条件。",
    articleSlug: "partner-guide", href: articleHref("partner-guide"),
    formUrl: "https://my.feishu.cn/share/base/shrcnkDnLimtQe3kcYBicdiCrvg",
    tags: ["参与", "合作", "费用", "资源"],
  },
].map((item) => ({
  ...item,
  url: item.formUrl,
  date: "2026-09-21",
  status: "意向沟通",
  verified: true,
  verifiedAt: "2026-09-21",
  verificationNote: "9 月 21 日完成提交与收件测试；本次未重新测试后台收件。",
}));

export const downloads = [
  {
    id: "one-page-intro", title: "一页节目介绍",
    summary: "深圳聊天节目的形式、筹备状态与参与入口。",
    date: "2026-10-02", status: "节目介绍", tags: ["下载", "节目", "介绍"],
  },
  {
    id: "pilot-checklist", title: "试录检查清单",
    summary: "约见、设备测试、录制与公开前检查。",
    date: "2026-09-21", status: "空白模板", tags: ["下载", "试录", "检查"],
  },
  {
    id: "contribution-log", title: "贡献与结算记录",
    summary: "约定分工，记录贡献与费用。分值和结算安排需共同确认。",
    date: "2026-09-21", status: "V0.1 讨论草案", tags: ["下载", "贡献", "收入", "结算"],
  },
  {
    id: "recording-consent-draft", title: "录制与使用授权草案",
    summary: "逐项讨论录制、回看、公开与素材使用范围。",
    date: "2026-09-21", status: "V0.1 讨论草案", tags: ["下载", "录制", "授权", "隐私"],
  },
  {
    id: "weekly-review", title: "每周复盘",
    summary: "核对本周结果，记录未完成事项与下一步。",
    date: "2026-09-21", status: "空白模板", tags: ["下载", "复盘", "协作"],
  },
  {
    id: "ai-work-log", title: "AI 工作记录",
    summary: "分别记录任务材料、生成结果、人工检查与采用。",
    date: "2026-09-21", status: "空白模板", tags: ["下载", "AI", "检查", "工作记录"],
  },
  {
    id: "recruitment-kit", title: "招募与合作文案",
    summary: "聊天、制作、话题与资源合作的联络模板。",
    date: "2026-10-02", status: "文案模板", tags: ["下载", "招募", "合作", "节目"],
  },
].map((item) => ({
  ...item, path: "/downloads/" + item.id + ".md", href: "/downloads/" + item.id + ".md",
}));

const articleText = (article) => [
  article.title, article.summary, article.status, ...article.tags,
  ...article.sections.flatMap((section) => [
    section.title, ...(section.paragraphs || []), ...(section.bullets || []),
    ...(section.table?.headers || []), ...(section.table?.rows || []).flat(),
    section.download?.label || "",
  ]),
].join(" ");

const linkedArticleSlugs = new Set([
  ...products.map((item) => item.articleSlug),
  ...people.map((item) => item.articleSlug),
  ...updates.map((item) => item.articleSlug),
  ...participation.map((item) => item.articleSlug),
]);

const toSearchRecord = (kind, item, href = item.href) => {
  const article = getArticle(item.articleSlug || item.slug);
  return {
    kind,
    id: item.id,
    slug: item.articleSlug || item.slug || item.id,
    title: item.title,
    summary: item.summary,
    status: item.status,
    date: item.date,
    tags: [...item.tags],
    href,
    target: item.articleSlug || item.slug || item.id,
    text: [item.title, item.summary, item.status, ...item.tags, ...(item.facts || []), article ? articleText(article) : ""].join(" "),
  };
};

export const searchEntries = [
  ...products.map((item) => toSearchRecord("product", item)),
  ...people.map((item) => toSearchRecord("person", item)),
  ...updates.map((item) => toSearchRecord("update", item)),
  ...articles.filter((article) => !linkedArticleSlugs.has(article.slug))
    .map((article) => toSearchRecord("article", article, articleHref(article.slug))),
  ...participation.map((item) => toSearchRecord("participation", item)),
  ...downloads.map((item) => toSearchRecord("download", item)),
];

const normalize = (value) => String(value ?? "").normalize("NFKC").toLocaleLowerCase();

export function searchCatalogue(query = "") {
  const terms = normalize(query).trim().split(/\s+/u).filter(Boolean);
  if (!terms.length) return [...searchEntries];
  return searchEntries.filter((entry) => {
    const content = normalize(entry.text);
    return terms.every((term) => content.includes(term));
  });
}
