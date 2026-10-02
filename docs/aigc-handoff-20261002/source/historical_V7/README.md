# 历史 V7 源码节选

V7 是 12 秒局部审阅稿（6 秒照片上下文 + 6 秒片尾），未获用户验收。正文使用静帧和相机模拟，不能证明连续 AIGC 镜头已经完成。本目录不是最新 D5r1 或 V7.1 工程。

本次保留渲染代码、BB 品牌候选、旧分镜、历史 QA、来源说明和字体许可文本。代码按恢复原文保留，**本次未运行，当前目录不能直接渲染**：原代码还读取被排除的参考片来源标志、工具标识和三个字体文件。工具标识是本次采取保守公开范围而暂不再分发，不是用户禁止在成片展示真实使用的工具。

[ORIGINAL_SHA256.json](ORIGINAL_SHA256.json) 是旧完整工程的历史哈希表，其中部分条目没有随本次迁移；当前实际文件以根目录 [ASSET_MANIFEST.json](../../ASSET_MANIFEST.json) 和 [SHA256SUMS.txt](../../SHA256SUMS.txt) 为准。[portable-verification.json](portable-verification.json) 只记录旧环境的检查结果，本轮 Mac 未重渲染。

恢复时先按 [最新创作规范](../../CREATIVE_REQUIREMENTS.md) 改正旧方案，再核实依赖与使用条件。不得恢复成片中的 Reference/来源标志，也不能把旧工具展示误记为实际执行工具或合作背书。
