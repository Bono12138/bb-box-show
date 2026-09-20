import { Text, LinkButton } from '../components.jsx';
import { href, articleHref, config } from '../lib/content.js';

export function Intro() {
  return <section className="intro-sheet container">
    <p className="eyebrow">深圳 · 正在组建 · 2026 年 9 月</p>
    <h1><Text>BB 箱子，一桌有话的人。</Text></h1>
    <p className="lede"><Text>主要中文的多人喜剧聊天节目。每桌 4–6 人，包含主持人。Bono 先来主持，也跟大家一起聊。</Text></p>
    <div className="intro-grid">
      <div><h2>我们想聊什么</h2><p><Text>上班、关系、那些当时很认真的事。回头想想，怎么有点好笑？</Text></p><p><Text>候选话题：装懂怎么收场？面子有多贵？折腾一圈，图啥？</Text></p></div>
      <div><h2>这桌还缺谁</h2><p><Text>愿意说，也愿意听的聊天成员。一起做策划、拍摄、收音和剪辑的伙伴。</Text></p><p><Text>也找场地、设备、话题与合作支持。先挑一件你感兴趣的事。</Text></p></div>
      <div><h2>第一次怎么开始</h2><p><Text>先填意向，约一次关着镜头的聊天。觉得合适，再谈试录和具体分工。</Text></p><p><Text>填表不等于加入或同意出镜。个人资料、录制和公开，分别确认。</Text></p></div>
      <div><h2>投入之前，先说清楚</h2><p><Text>目前没有固定工资，未来收入不作保证。工作范围、费用和贡献，开工前共同确认。</Text></p><p><Text>分成方案是 V0.1 讨论稿。已经确认的应付款，单独记录和结算。</Text></p></div>
    </div>
    <div className="intro-bottom"><p><Text>当前正在招募，还没有完成的节目。制作进度、方法和模板，会逐步公开。</Text></p><p className="intro-address"><a className="inline-link" href={href('/join/')}>参与入口：BB 箱子网站</a><span className="print-url">{config.siteUrl}/join/</span></p><div className="join-actions"><LinkButton to={href('/join/')}>找一种参与方式</LinkButton><a className="text-link" href={articleHref('new-friend-guide')}>新朋友从这里开始</a><button className="text-link print-button" onClick={()=>window.print()}>打印这一页</button></div></div>
  </section>;
}
