import { ArrowUpRight, ArrowRight } from "@phosphor-icons/react";
import {
  articles,
  asset,
  href,
  articleHref,
  roles,
  topics,
} from "../lib/content.js";
import { Text, LinkButton, ArticleRow, Contact } from "../components.jsx";
export function Home() {
  return (
    <>
      <section
        className="hero"
        id="top"
        style={{ backgroundImage: `url(${asset("hero-studio.png")})` }}
      >
        <div className="hero-content container">
          <p className="eyebrow">深圳 · 正在组建</p>
          <h1>
            <span>在深圳，</span>
            <span className="hero-last">
              凑一桌有话的人<span className="orange">。</span>
            </span>
          </h1>
          <div className="hero-intro">
            <p>一档多人喜剧聊天节目。</p>
            <p>
              <Text>4–6 个人，讲自己的事，也接得住别人的话。</Text>
            </p>
            <p>Bono 先来主持。</p>
          </div>
          <div className="hero-actions">
            <LinkButton to={href("/join/")}>我想来聊聊</LinkButton>
            <a className="quiet-link" href="#topics">
              先看看聊什么 <ArrowRight size={19} />
            </a>
          </div>
          <div className="hero-bottom">
            <span>正在找人 · 找场地 · 准备第一次试聊</span>
            <span>场景为视觉示意，实际录制场地待定</span>
          </div>
        </div>
      </section>
      <section className="section topics-section container" id="topics">
        <div className="section-intro">
          <p className="eyebrow">候选话题</p>
          <h2>
            <Text>有些事，说出来就有戏。</Text>
          </h2>
          <p className="muted">
            <Text>聊上班，聊关系，聊那些当时很认真的事。现在回头看，怎么有点好笑？</Text>
          </p>
        </div>
        <div className="topics">
          {topics.map((t, i) => (
            <a
              className="topic"
              href={articleHref(["pretending-to-know", "the-price-of-face", "ask-yourself-why"][i])}
              key={t.n}
            >
              <div className="topic-top">
                <span>{t.n}</span>
                <ArrowUpRight size={24} />
              </div>
              <h3>
                {t.title.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </h3>
              <p>
                <Text>{t.text}</Text>
              </p>
              <small>候选话题 · 尚未录制</small>
            </a>
          ))}
        </div>
        <a className="text-link" href={articleHref("topic-guide")}>
          你也可以把问题投进来 <ArrowRight size={18} />
        </a>
      </section>
      <section className="people-band" id="about">
        <div className="container people-layout">
          <div className="people-title">
            <p className="eyebrow">这些人</p>
            <h2>先认识一下。</h2>
            <p>
              <Text>这桌人还在找。不同的生活，才有不同的话。</Text>
            </p>
            <a className="text-link" href={href("/people/")}>
              看看谁适合来 <ArrowRight size={18} />
            </a>
          </div>
          <div className="host-note">
            <span className="note-label">发起人 / 初期主持</span>
            <h3>
              Bono<span>先来张罗这一桌。</span>
            </h3>
            <p>
              <Text>
                和大家一起聊，也负责看时间、接话题，让每个人都有机会开口。
              </Text>
            </p>
            <a href={articleHref("bono")}>
              认识 Bono <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="vacancy">
            <img
              src={asset("need-chat-member.png")}
              alt="一把空着的椅子，示意正在招募的席位"
              loading="lazy"
            />
            <p><Text>下一位，会是谁？</Text></p>
          </div>
        </div>
      </section>
      <section className="section container" id="needs">
        <div className="section-intro split-intro">
          <div>
            <p className="eyebrow">现在需要什么</p>
            <h2>
              <Text>不用句句是段子。</Text>
            </h2>
          </div>
          <div>
            <p>
              <Text>有自己的经历，愿意说，也愿意听。</Text>
            </p>
            <p>
              <Text>不想出镜，也有很多事可以一起做。</Text>
            </p>
          </div>
        </div>
        <div className="roles">
          {roles.map((r, i) => (
            <a className="role" href={articleHref(r.slug)} key={r.id}>
              <span className="role-number">0{i + 1}</span>
              <img src={asset(r.image)} alt="" loading="lazy" />
              <div>
                <h3>{r.title}</h3>
                <p>
                  <Text>{r.copy}</Text>
                </p>
              </div>
              <ArrowUpRight className="role-arrow" size={25} />
            </a>
          ))}
        </div>
        <p className="honest-note">
          <Text>
            目前没有固定工资，未来收入也不作保证。投入多少、怎么记贡献、以后怎么分，开始前说清楚。
          </Text>{" "}
          <a href={articleHref("revenue")}>看参与规则</a>
        </p>
      </section>
      <section className="progress-section section" id="progress">
        <div className="container progress-layout">
          <div>
            <p className="eyebrow">最近在忙什么</p>
            <h2>
              <Text>进展和没搞成的事，都记下来。</Text>
            </h2>
            <p className="muted">
              <Text>
                现在仍在筹备。第一次试聊、设备测试、试录，有了结果再更新。
              </Text>
            </p>
            <a className="text-link" href={href("/updates/")}>
              全部近况 <ArrowRight size={18} />
            </a>
          </div>
          <div>
            {articles
              .filter((a) => a.type === "updates")
              .slice(0, 3)
              .map((a) => (
                <ArticleRow article={a} key={a.id} />
              ))}
          </div>
        </div>
      </section>
      <section className="section backstage-section" id="backstage">
        <div className="container backstage-layout">
          <div>
            <p className="eyebrow">再往里看看</p>
            <h2>
              <Text>节目怎么做出来，也一起放出来。</Text>
            </h2>
            <p>
              <Text>
                找人、拍摄、花钱、分工，还有做砸了以后怎么改。想参与的人能看明白，想自己做的人也能拿去参考。
              </Text>
            </p>
            <LinkButton to={href("/backstage/")} secondary>
              翻翻幕后资料
            </LinkButton>
          </div>
          <div className="backstage-index">
            {[
              ["01", "怎么拍，怎么合作", "first-meeting"],
              ["02", "钱和贡献怎么算", "revenue"],
              ["03", "AI 到底干了哪些活", "ai-workflow"],
              ["04", "把方法带去你的城市", "open-source"],
            ].map(([n, t, s]) => (
              <a href={articleHref(s)} key={n}>
                <span>{n}</span>
                <strong>{t}</strong>
                <ArrowUpRight size={23} />
              </a>
            ))}
          </div>
        </div>
      </section>
      <Contact />
      <section className="faq container">
        <h2>你可能想先问</h2>
        {[
          [
            "一定要很会搞笑吗？",
            "不用把每句话都说成段子。有真实经历，愿意表达和倾听，我们先见面试聊。",
          ],
          [
            "可以只参与一次吗？",
            "可以先聊清楚时间和工作范围。是否继续参与，双方在试聊或试合作后再决定。",
          ],
          [
            "填表以后就要出镜吗？",
            "不会。提交只代表有兴趣，录制与公开授权会另外确认。",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>
              <Text>{a}</Text>
            </p>
          </details>
        ))}
      </section>
    </>
  );
}
