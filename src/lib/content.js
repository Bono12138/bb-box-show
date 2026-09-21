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

export const audiencePaths = [
  {
    title: "我是上班族 / 普通人",
    copy: "有些话不想跟同事或熟人说，或者只是想认识工作圈以外的人。",
    slug: "after-work-table",
  },
  {
    title: "我是创作者",
    copy: "把项目、卡点和半成品想法带来；一次录制也可以继续变成你自己的内容。",
    slug: "creator-collaboration",
  },
  {
    title: "我对 AI / 开源感兴趣",
    copy: "看我们怎样用 AI、飞书、GitHub 和公开记录，从零搭一个真实组织。",
    slug: "ai-workflow",
  },
  {
    title: "我想合作 / 做商务",
    copy: "场地、品牌、社群、赞助、渠道或其他资源，都可以先把条件说清楚。",
    slug: "partner-guide",
  },
];

export const peopleGroups = [
  {
    title: "镜头前",
    note: "参加聊天、主持或以匿名方式提供故事。这里只是浏览分组，不限制跨组参与。",
    members: [
      {
        name: "Bono",
        role: "发起人 / 初期主持",
        status: "已确认",
        slug: "bono",
        copy: "负责把第一桌人凑起来，也参与聊天、选题和项目推进。",
      },
      {
        name: "等待加入",
        role: "聊天成员",
        status: "招募中",
        copy: "有自己的经历，愿意说，也愿意听别人说完。",
      },
      {
        name: "等待加入",
        role: "匿名嘉宾",
        status: "招募中",
        slug: "anonymous-guest",
        copy: "可以只来一次，并按需要讨论化名、遮挡和声音处理。",
      },
    ],
  },
  {
    title: "内容与制作",
    note: "选题、前采、摄影、收音、剪辑都可以按一次任务加入。",
    members: [
      { name: "等待加入", role: "选题 / 前采", status: "招募中", copy: "把一个模糊问题变成能聊起来的话题树。" },
      { name: "等待加入", role: "摄影 / 收音", status: "招募中", copy: "让多人现场真正拍得到、听得清。" },
      { name: "等待加入", role: "剪辑 / 包装", status: "招募中", copy: "从长对话里找到可以独立成立的内容。" },
    ],
  },
  {
    title: "增长与合作",
    note: "让节目接触更多人，也把真实资源带进来。",
    members: [
      { name: "等待加入", role: "社区 / 招募", status: "招募中", copy: "认识新人、维护参与者体验、把合适的人带到桌上。" },
      { name: "等待加入", role: "商务 / 赞助", status: "招募中", copy: "寻找品牌、渠道和商业合作，同时守住内容独立边界。" },
      { name: "等待加入", role: "场地 / 合作", status: "招募中", copy: "连接录制空间、活动、社群和外部资源。" },
    ],
  },
  {
    title: "技术与运营",
    note: "从零搭建网站、数据、飞书和 AI-native 工作流。",
    members: [
      { name: "等待加入", role: "网站 / AI 工作流", status: "招募中", copy: "让重复工作更少，让公开记录和协作更快。" },
      { name: "等待加入", role: "数据 / 财务 / 贡献记录", status: "招募中", copy: "把成本、收入、贡献和实验结果留下可核对记录。" },
    ],
  },
];
