import articleData from "../../content/articles.json";
import connections from "../../content/connections.json";
export const articles = articleData;
export const config = connections;
export const basePath = import.meta.env.BASE_URL;
export const href = (path = "/") => `${basePath}${path.replace(/^\//, "")}`;
export const asset = (name) => href(`/assets/${name}`);
export const articleHref = (slug) => href(`/read/${slug}/`);
export const routePath = (path) => {
  const route =
    "/" +
    path
      .slice(path.startsWith(basePath) ? basePath.length : 1)
      .replace(/^\/+|\/+$/g, "");
  return route === "/" ? route : `${route}/`;
};
export const roles = [
  {
    id: "chat",
    title: "聊天成员",
    slug: "chat-guide",
    image: "need-chat-member.png",
    copy: "有自己的经历，也愿意听别人说完。",
    action: "我想来聊聊",
  },
  {
    id: "production",
    title: "制作伙伴",
    slug: "production-guide",
    image: "need-production.png",
    copy: "策划、拍摄、收音、剪辑，一起把节目做出来。",
    action: "我能参与制作",
  },
  {
    id: "venue",
    title: "场地设备",
    slug: "venue-guide",
    image: "need-venue.png",
    copy: "一处能围坐的空间，一套能听清每个人的设备。",
    action: "我有场地或设备",
  },
  {
    id: "topic",
    title: "话题故事",
    slug: "topic-guide",
    image: "need-topic.png",
    copy: "一个问题，或一件你一直很想讲的事。",
    action: "我有一个话题",
  },
  {
    id: "partner",
    title: "合作支持",
    slug: "partner-guide",
    image: "need-partner.png",
    copy: "场地、品牌、社群或传播，先聊清楚怎么一起做。",
    action: "我想谈合作",
  },
];
export const topics = [
  {
    n: "01",
    title: ["你上一次装懂，", "后来怎么收场的？"],
    tag: "装懂",
    text: "点头很容易。难的是对方突然说：那你来讲讲。",
  },
  {
    n: "02",
    title: ["你见过最贵的面子，", "多少钱？"],
    tag: "面子",
    text: "有时花的是钱，有时花的是一整个周末。",
  },
  {
    n: "03",
    title: ["你做过哪件事，", "后来只想问自己一句：", "图啥？"],
    tag: "折腾",
    text: "当时理由挺充分。过一阵再看，自己都想笑。",
  },
];
