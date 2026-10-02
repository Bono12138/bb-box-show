# BB 箱子官网本地预览

本目录是独立的 Vite／React 官网预览。
包含节目、课程、问答群、活动与公开制作五类业务。
首页另接入三维舞台、报价交互、五套课程海报、人物与近况。
资料区有 28 篇文章、站内搜索和七份 Markdown 下载资料。
作品页还连接一份 14 页课程 PPT 样稿。

当前为本地实现，尚未部署，也未获用户接受。
现有 GitHub Pages 网站由仓库根目录的应用提供。
当前范围见 [current-scope.md](./docs/current-scope.md)。
本目录独立构建，仓库现有 Pages 工作流不发布此目录。

## 本地运行

使用 Node.js 和 npm。
本次模块检查环境为 Node.js 22.22.2。
首次恢复依赖时，在本目录运行：

```sh
npm ci
```

启动开发预览：

```sh
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort
```

查看 [http://localhost:4173/](http://localhost:4173/)。
同端口已有服务时，先复用现有服务。
`--strictPort` 会在端口占用时报告错误，不自动换端口。
文档中的地址是运行入口，不保证服务一直在线。

## 页面入口

| 页面 | 查询地址 |
| --- | --- |
| 首页 | `/` |
| 聊天节目 | `/?project=show` |
| AI 与 Codex 课程 | `/?project=course` |
| BB箱子问答群 | `/?project=group` |
| 内容型活动 | `/?project=activities` |
| 公开制作 | `/?project=process` |
| 作品与报价演示 | `/?page=works` |
| Bono | `/?page=about` |
| 参与 | `/?page=join` |
| 制作近况 | `/?page=updates` |
| 全部资料 | `/?page=library` |
| 单篇阅读 | `/?page=article&slug=show-overview` |
| 搜索 | `/?page=search&q=Codex` |

资料分类使用 `category`。
可选值为 `show`、`people`、`guide`、`method`、`updates`。
例如 `/?page=library&category=method`。
站内导航使用浏览器历史，代码保留返回与前进处理。

首页先显示场景图。
“走进三维舞台”按钮主动加载三维空间。
可选主舞台、聊天桌、工作台与制作台。
页面提供暂停、重播和回到场景图的控件。
减少动画设置和 WebGL 失败时，保留静态入口。

## 内容与实现来源

- `src/App.jsx`：导航、首页、查询路由与舞台入口。
- `src/Pages.jsx`：业务详情、海报、作品、人物、近况与参与。
- `src/Library.jsx`：分类、正文阅读、表格与搜索结果。
- `src/StageScene.jsx`、`src/StageWorld.js`：三维物件、灯光与相机切换。
- `src/Workbench.jsx`、`src/quote-model.js`：费用输入、比较、网页预览与 CSV。
- `worker/quote-export.js`：当前比较表的文件响应，开发预览与托管使用相同计算。
- `src/data/articles.json`、`src/data/catalogue.js`：正文与目录数据。
- `public/data/articles.json`、`public/data/index.csv`：本地静态导出。
- `public/downloads/`：七份 Markdown 资料与课程 PPT 样稿。
- `public/assets/`：场景示意图、课程海报、PPT 封面、品牌标记与字体。

业务依据为 [公开业务文档](../../docs/business/overview.md) 中的已确认内容。
原公开文章与表单配置来自仓库根目录的 `content/`。
本地新增与修订内容尚未发布。
来源、日期与 Kimi 咨询取舍另有记录：
[src/data/content-notes.md](./src/data/content-notes.md)。

## 演示限制与待接入事项

报价数据全部为合成资料，已整理到本地代码。
修改费用会改变比较表、成本图、报告和 HTML 汇报预览。
下载的 CSV 使用当前输入。
文件通过 `/downloads/quote-demo.csv` 下载。
此功能需要开发服务或配套的托管 Worker。
只上传静态文件到 GitHub Pages，不能直接运行该下载接口。
缺失费用不按零计算，也不参与完整报价排名。
界面不提取上传文件；真实资料仍需提取和人工复核。
报告与汇报是网页预览，不能当作已经生成的 Word 或 PPTX 文件。

三维空间与项目配图均为概念示意。
它们不证明已经录制节目、完成课程交付或形成真实供应商评审结果。
课程海报和 PPT 样稿分别保留自己的制作状态。

取伙的对应活动链接仍待核验和接入。
微信号与二维码尚未接入。
五类参与表单使用既有飞书公开分享链接。
本次文档整理没有重新提交表单或验证后台收件。

本地预览未开启统计采集。
没有统计 API、统计关闭控件或统计看板。
未来部署后如启用统计，需先说明范围、保存与关闭方式，再检查实现。
详见 `/?page=article&slug=privacy`。

## 构建与检查

```sh
npm run build
```

```sh
npm run test:sites
```

```sh
node --test tests/library.test.mjs tests/quote-model.test.mjs tests/quote-export.test.mjs tests/sites-worker.test.mjs
```

构建应生成以下文件：

- `dist/client/index.html`
- `dist/server/index.js`
- `dist/server/quote-export.js`
- `dist/server/quote-model.js`
- `dist/.openai/hosting.json`

这些命令不执行部署。
构建和模块测试不替代浏览器检查。
全部页面、目标宽度、连续动效、文字断行与下载行为，需检查实际呈现。
用户验收和正式发布分别记录。
