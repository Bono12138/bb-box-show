# BB 箱子

BB 箱子正在建设课程、内容型活动、问答社群与媒体内容，并公开记录项目的成长过程。多人喜剧聊天节目是其中一个板块。

本仓库保存官网代码、公开业务计划、课程与宣传材料、方法和版本记录。2026-09-25 的近期重点是 AI／Codex 对标课程：线上 199 元，深圳福田线下 399 元。当前网站仍展示此前的节目招募版本；业务文档更新不代表活动已经上架。

[业务计划](docs/business/overview.md) · [决定与待确认事项](docs/business/decisions.md) · [课程宣传制作方案](docs/business/course-campaign.md)

这个网站是项目的公开入口。它先介绍节目和当前需要的人与资源，再逐步公开组建进度、幕后工作方式和可以复用的项目记录。

[打开 BB 箱子网站](https://bono12138.github.io/bb-box-show/)

## 现有网站的节目招募内容

- 招募聊天成员和制作伙伴
- 寻找适合围坐聊天的场地、收音和拍摄支持
- 收集真实故事、话题和合作资源
- 准备第一次试聊

五类参与入口已连接真实飞书匿名表单。后台工作台保持受限，填写者不能读取其他人的资料。微信素材尚未提供，当前通过表单开始联系。

## 网站内容

首页、五个栏目、24 篇独立资料、站内搜索、关联阅读和下载模板。文章预渲染为独立页面，支持直接分享与搜索引擎收录。录制、贡献、授权与收入规则都有明确状态。

[新朋友从这里开始](https://bono12138.github.io/bb-box-show/read/new-friend-guide/) · [参与方式](https://bono12138.github.io/bb-box-show/join/)

## 本地运行

使用 Node.js 22.13 或更新的 22.x 版本。

```sh
npm ci
npm run dev
```

## 检查与构建

```bash
npm run build
npm test
npm run test:site
```

网站由 GitHub Pages 自动发布。

## 项目结构

`src/` 是 React/Vite 界面。`content/` 只保存可公开内容。`public/downloads/` 是制作、周报、贡献、授权和 AI 记录模板以及招募脚本。`server/` 提供独立的第一方统计接口和鉴权查询；Pages 版本未开启采集。

飞书负责协作与业务记录，网站只使用经审阅的公开字段。两边不做自动双向同步。内部记录与执行脚本位于公开仓库之外。

[内容发布说明](docs/publishing.md) · [统计与部署说明](docs/analytics.md) · [管理手册](docs/management-handbook.md)

## 参与与复用

节目参与从网站的“参与”进入对应说明和表单。代码或资料问题可使用 Issues；不要在公开 Issue 留手机号、私密故事、授权原件或财务信息。

代码 [MIT](LICENSE)，公开方法和模板 [CC BY-SA 4.0](CONTENT-LICENSE.md)。品牌、BB 兔与节目素材见[使用条件](ASSET-RIGHTS.md)。
