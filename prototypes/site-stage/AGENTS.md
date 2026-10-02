# BB 箱子多业务官网

本目录是独立的 React/Vite 官网应用。业务依据为仓库根目录的 `docs/business/overview.md` 和 `docs/business/decisions.md`。

保持深蓝、暖白、黄色与摄影舞台的视觉方向。品牌为 BB 箱子，二维 BB 兔用于导航。场景图和三维舞台标为概念示意。

首页按访客兴趣进入节目、课程、活动、问答群与公开制作；深入资料通过分类、独立文章和搜索呈现。节目话题尚未确定。

代码同步、构建、浏览器检查、部署和用户验收分别记录。现有公开站位于仓库根目录，本目录没有纳入其 Pages 发布工作流。

保留键盘操作、返回与前进、减少动画和 WebGL 回退。发布前检查各目标宽度的实际文字断行。

构建运行 `npm run build`。模块测试运行 `node --test tests/*.test.mjs`。报价 CSV 下载需要 Vite 服务或配套 Worker，纯静态发布需要另行适配。

`src/` 保存界面，`public/` 保存公开素材和空白模板。保留 `worker/`、`scripts/prepare-sites-build.mjs` 和 `.openai/hosting.json` 的独立托管能力。凭证、联系记录和原始私人资料不进入此目录。
