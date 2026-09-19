import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Check, List, X } from "@phosphor-icons/react";

const assetUrl = (filename) => `${import.meta.env.BASE_URL}assets/${filename}`;

const needs = [
  {
    id: "chat",
    title: "聊天成员",
    image: assetUrl("need-chat-member.png"),
    alt: "一把空着的藤编木椅",
    description: ["愿意表达，也会听人说话。", "还要能把别人的话接下去。"],
    action: "我想来聊聊",
  },
  {
    id: "production",
    title: "制作伙伴",
    image: assetUrl("need-production.png"),
    alt: "一本黑色制作笔记本和一支笔",
    description: ["会策划、拍摄或收音？", "会剪辑、设计或运营？", "欢迎一起把节目做出来。"],
    action: "我能参与制作",
  },
  {
    id: "venue",
    title: "场地设备",
    image: assetUrl("need-venue.png"),
    alt: "一盏亮起的电影灯",
    description: ["我们在找适合围坐的空间。", "也需要多人收音。", "灯光和拍摄支持也需要。"],
    action: "我有场地或设备",
  },
  {
    id: "topic",
    title: "话题故事",
    image: assetUrl("need-topic.png"),
    alt: "一叠空白话题卡和一支铅笔",
    description: ["可以投来你的真实经历。", "也可以投来一个问题。"],
    action: "我有一个话题",
  },
  {
    id: "partner",
    title: "合作资源",
    image: assetUrl("need-partner.png"),
    alt: "一只黑色陶瓷杯",
    description: ["有品牌、社区或传播渠道？", "有其他支持方式也可以。", "来聊聊怎样一起做事。"],
    action: "我想谈合作",
  },
];

const formCopy = {
  chat: {
    eyebrow: "先认识，再试聊",
    title: "我想来聊聊",
    description: ["不用准备正式简历。", "先说说你是谁，为什么想来。"],
    label: "你最近特别想聊的一件事",
    placeholder: "一段经历、一个困惑，或者一件让你发笑的事。",
  },
  production: {
    eyebrow: "一起把节目做出来",
    title: "我能参与制作",
    description: ["告诉我们你会什么，愿意怎么参与。", "也说说目前能投入多少时间。"],
    label: "你能提供的能力或经验",
    placeholder: "写下你会的、正在学的，以及想怎样参与。",
  },
  venue: {
    eyebrow: "让第一次试聊发生",
    title: "我有场地或设备",
    description: ["先把实际条件告诉我们。", "我们再一起判断，是否适合这次试聊。"],
    label: "场地或设备情况",
    placeholder: "请写所在区域、可用时间、空间或设备情况。",
  },
  topic: {
    eyebrow: "把问题投进箱子",
    title: "我有一个话题",
    description: ["话题不用宏大。", "真正让人有话想说，就值得投进来。"],
    label: "你想听大家聊什么",
    placeholder: "例如：哪一刻让你觉得，体面的工作也很荒唐？",
  },
  partner: {
    eyebrow: "先把事情讲清楚",
    title: "我想谈合作",
    description: ["简单介绍你能提供的资源。", "也说说希望怎样参与 BB 箱子。"],
    label: "合作设想",
    placeholder: "例如：场地、设备、社区联动或品牌合作。",
  },
  resource: {
    eyebrow: "缺什么，就找什么",
    title: "我能提供资源",
    description: ["场地、设备和制作能力，都可以告诉我们。", "传播和合作机会，也可以。"],
    label: "你能提供什么",
    placeholder: "请写资源类型、所在区域和可用方式。",
  },
};

function BrandMark({ compact = false }) {
  return (
    <a
      className={`brand ${compact ? "brand--compact" : ""}`}
      href="#top"
      aria-label="BB 箱子首页"
    >
      <span className="brand-icon" aria-hidden="true">
        <img src={assetUrl("bb-rabbit-mark.png")} alt="" />
      </span>
      <span className="brand-wordmark">
        <span className="brand-title">
          <span className="brand-bb">BB</span>
          <span className="brand-cn">箱子</span>
        </span>
        <span className="brand-caption">深圳多人喜剧聊天</span>
      </span>
    </a>
  );
}

function ParticipationModal({ type, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const copy = formCopy[type] ?? formCopy.resource;

  useEffect(() => {
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="participation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="关闭参与表单">
          <X size={24} weight="bold" />
        </button>

        {!submitted ? (
          <>
            <p className="modal-eyebrow">{copy.eyebrow}</p>
            <h2 id="modal-title">{copy.title}</h2>
            <p className="modal-description">
              {copy.description.map((line) => <span key={line}>{line}</span>)}
            </p>
            <form
              className="participation-form"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <label>
                怎么称呼你
                <input name="name" autoComplete="name" required placeholder="你的名字或昵称" />
              </label>
              <label>
                怎样联系你
                <input
                  name="contact"
                  required
                  placeholder="微信、邮箱或其他方便的联系方式"
                />
              </label>
              <label>
                {copy.label}
                <textarea name="message" required rows="5" placeholder={copy.placeholder} />
              </label>
              <p className="privacy-note">这份信息只用于联系和了解参与意向，不会直接公开。</p>
              <button type="submit" className="form-submit">
                完成试填
                <ArrowRight size={19} weight="bold" />
              </button>
            </form>
          </>
        ) : (
          <div className="success-state" aria-live="polite">
            <span className="success-icon" aria-hidden="true">
              <Check size={34} weight="bold" />
            </span>
            <p className="modal-eyebrow">原型表单</p>
            <h2 id="modal-title">内容还没有发送</h2>
            <p>
              <span>当前版本只演示填写流程。</span>
              <span>真实收集入口会在正式开放前接入。</span>
            </p>
            <button type="button" className="form-submit" onClick={onClose}>
              回到网站
              <ArrowRight size={19} weight="bold" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export function App() {
  const [modalType, setModalType] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const openForm = (type) => {
    setMenuOpen(false);
    setModalType(type);
  };

  return (
    <main>
      <section
        className="hero"
        id="top"
        style={{ "--hero-image": `url("${assetUrl("hero-studio.png")}")` }}
      >
        <nav className="site-nav" aria-label="主导航">
          <BrandMark />
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? "关闭导航" : "打开导航"}
          >
            {menuOpen ? <X size={26} /> : <List size={28} />}
          </button>
          <div className={`nav-links ${menuOpen ? "is-open" : ""}`} id="site-menu">
            <a href="#about" onClick={() => setMenuOpen(false)}>关于节目</a>
            <a href="#progress" onClick={() => setMenuOpen(false)}>公开进度</a>
            <button type="button" onClick={() => openForm("chat")}>加入我们</button>
            <button type="button" onClick={() => openForm("resource")}>提供资源</button>
          </div>
        </nav>

        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-kicker">深圳 · 正在组建</p>
          <h1>
            <span>在深圳，</span>
            <span>找 4–6 个人，</span>
            <span>一起把话聊开。</span>
          </h1>
          <p className="hero-intro">BB 箱子正在组建一档多人喜剧聊天节目。</p>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={() => openForm("chat")}>
              我想来聊聊 <ArrowRight size={22} weight="bold" />
            </button>
            <button className="text-action" type="button" onClick={() => openForm("topic")}>
              投稿一个话题
            </button>
            <button className="text-action" type="button" onClick={() => openForm("resource")}>
              我能提供资源
            </button>
          </div>
          <p className="current-status">
            <span aria-hidden="true" />
            当前：正在找人 · 找场地 · 准备第一次试聊
          </p>
        </div>
        <p className="hero-note">
          <span>普通的人，</span>
          <span>也有好笑的生活。</span>
        </p>
        <a className="scroll-cue" href="#needs" aria-label="继续了解 BB 箱子">
          <ArrowDown size={22} weight="bold" />
        </a>
      </section>

      <section className="needs-section" id="needs">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">WE ARE LOOKING FOR</p>
            <h2>我们正在找什么</h2>
          </div>
          <p className="heading-note"><span>有意思的对话，</span><span>从这里开始。</span></p>
        </div>
        <p className="section-intro">
          <span>BB 箱子还没有固定阵容，也没有固定场地。</span>
          <span>你对聊天、喜剧和真实的生活感兴趣？</span>
          <span>这里可能有你的位置。</span>
        </p>
        <div className="needs-grid">
          {needs.map((need) => (
            <article className="need-item" key={need.id}>
              <button
                type="button"
                className="need-image-button"
                onClick={() => openForm(need.id)}
                aria-label={need.action}
              >
                <img src={need.image} alt={need.alt} />
              </button>
              <h3>{need.title}</h3>
              <p>
                {need.description.map((line) => <span key={line}>{line}</span>)}
              </p>
              <button type="button" className="need-action" onClick={() => openForm(need.id)}>
                {need.action} <ArrowRight size={17} weight="bold" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="format-section" id="about">
        <div className="format-copy">
          <p className="section-eyebrow light">HOW IT STARTS</p>
          <h2><span>先坐下来，</span><span>看看能不能聊开。</span></h2>
          <p>
            <span>我们会先认识、再试聊。</span>
            <span>没有传统面试。</span>
            <span>第一次见面，不用决定是否长期加入。</span>
            <span>几个人坐在一起时，愿不愿意听，很重要。</span>
            <span>能不能接住彼此的话，也很重要。</span>
          </p>
          <button className="outline-action" type="button" onClick={() => openForm("chat")}>
            参加第一次试聊 <ArrowRight size={20} weight="bold" />
          </button>
        </div>
        <dl className="format-facts">
          <div><dt>4–6 人</dt><dd>总人数包含主持人</dd></div>
          <div><dt>主要中文</dt><dd>先把表达和节奏做自然</dd></div>
          <div><dt>主持人 Bono</dt><dd>一起聊天，也负责时间和转场</dd></div>
          <div>
            <dt>场地会变化</dt>
            <dd><span>教室、客厅或工作室。</span><span>也可能去户外。</span></dd>
          </div>
        </dl>
      </section>

      <section className="progress-section" id="progress">
        <div className="progress-title">
          <p className="section-eyebrow">BUILD IN PUBLIC</p>
          <h2><span>这件事，</span><span>现在到哪了</span></h2>
        </div>
        <ol className="progress-list">
          <li className="is-current">
            <span className="step-number">01</span>
            <div>
              <p className="step-label">现在</p>
              <h3>找人，也准备第一次试聊</h3>
              <p>
                <span>聊天成员、制作伙伴和场地，都在找。</span>
                <span>多人收音方案和真实话题，也在准备。</span>
              </p>
            </div>
          </li>
          <li>
            <span className="step-number">02</span>
            <div>
              <p className="step-label">下一步</p>
              <h3>先办一次不录像的聊天局</h3>
              <p>
                <span>不急着表演。</span>
                <span>先看看大家坐在一起，能不能自然地聊开。</span>
                <span>一两个小时，会告诉我们答案。</span>
              </p>
            </div>
          </li>
          <li>
            <span className="step-number">03</span>
            <div>
              <p className="step-label">之后</p>
              <h3>试录，再从真实成片里找答案</h3>
              <p>
                <span>人数、时长、话题和节目节奏，不先猜。</span>
                <span>每一次真实试录，都会给出新答案。</span>
              </p>
            </div>
          </li>
        </ol>
        <div className="progress-note">
          <p>公开记录从筹备期就开始。</p>
          <p>
            <span>每次试聊改了什么，我们会记。</span>
            <span>花了多少、哪里不行，也会记。</span>
            <span>下一次准备怎么试，也会留下来。</span>
          </p>
          <a href="#backstage">继续看幕后怎么公开 <ArrowDown size={18} weight="bold" /></a>
        </div>
      </section>

      <section className="backstage-section" id="backstage">
        <div className="backstage-intro">
          <p className="section-eyebrow backstage-eyebrow">BEHIND BB BOX</p>
          <h2>
            <span>台前把话聊开，</span>
            <span>台后留下方法。</span>
          </h2>
          <p className="backstage-lead">
            <span>BB 箱子先是一档节目。</span>
            <span>找人、组局和试录，会边做边公开。</span>
            <span>制作和复盘，也会留在记录里。</span>
          </p>

          <figure className="mascot-card">
            <span className="mascot-portrait" aria-hidden="true">
              <img src={assetUrl("bb-rabbit-mark.png")} alt="" loading="lazy" />
            </span>
            <figcaption>
              <span>BB 兔</span>
              <strong>
                <span>一直在工地上的</span>
                <span>幕后同事</span>
              </strong>
              <p>
                <span>它会出现在制作笔记里。</span>
                <span>也会出现在进度记录里。</span>
                <span>还会出现在开放资料里。</span>
                <span>台前仍然是节目。</span>
              </p>
            </figcaption>
          </figure>
        </div>

        <div className="backstage-layers">
          <article className="backstage-layer">
            <span className="layer-number">01</span>
            <div>
              <p className="layer-kicker">从今天开始</p>
              <h3>Build in Public</h3>
              <p>
                <span>网站会更新当前进度和下一步。</span>
                <span>也会写清楚正在缺什么。</span>
                <span>关键决定为什么改变，做成和做砸的都记。</span>
              </p>
            </div>
          </article>

          <article className="backstage-layer">
            <span className="layer-number">02</span>
            <div>
              <p className="layer-kicker">藏在节目幕后</p>
              <h3>AI-native 工作方式</h3>
              <p>
                <span>AI 会参与选题研究和资料整理。</span>
                <span>会议总结和制作跟进，也会让 AI 参与。</span>
                <span>成本怎么记，复盘怎么做，也一样。</span>
                <span>省了什么力、添了什么乱，都讲清楚。</span>
              </p>
            </div>
          </article>

          <article className="backstage-layer">
            <span className="layer-number">03</span>
            <div>
              <p className="layer-kicker">跟着项目一起长</p>
              <h3>完整开源</h3>
              <p>
                <span>设备、成本和流程，会按版本保存。</span>
                <span>决策和错误，也会留下。</span>
                <span>可公开的数据会进入 GitHub。</span>
                <span>别人可以复制、修改，也可以继续贡献。</span>
              </p>
            </div>
          </article>

          <div className="channel-panel">
            <p className="channel-title">三个入口，各自把一件事做好</p>
            <dl className="channel-list">
              <div>
                <dt>网站 <span>当前入口</span></dt>
                <dd><span>让人看懂节目，看到进度。</span><span>也能找到参与入口。</span></dd>
              </div>
              <div>
                <dt>飞书 <span>随后接入</span></dt>
                <dd><span>承接报名、协作和任务。</span><span>也保存共创中产生的文档。</span></dd>
              </div>
              <div>
                <dt>GitHub <span>公开仓库</span></dt>
                <dd>
                  <span>保存版本和制作资料。</span>
                  <span>也保存可以复用的方法。</span>
                  <a
                    className="channel-link"
                    href="https://github.com/Bono12138/bb-box-show"
                    target="_blank"
                    rel="noreferrer"
                  >
                    查看公开仓库 <ArrowRight size={15} weight="bold" />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-mark">B</div>
        <div className="about-copy">
          <p className="section-eyebrow">ABOUT THE HOST</p>
          <h2><span>Bono 发起了</span><span>BB 箱子</span></h2>
          <p>
            <span>Bono 在深圳南山。</span>
            <span>BB 箱子原来是一份一个人的表达。</span>
            <span>现在，他想让 4–6 个人坐到一起。</span>
            <span>BB 箱子会变成大家聊天的地方。</span>
            <span>主持人会坐在大家中间。</span>
            <span>Bono 一边参与，一边照看话题和时间。</span>
          </p>
        </div>
        <p className="about-quote"><span>先聊起来，</span><span>再看会发生什么。</span></p>
      </section>

      <section className="closing-section">
        <p className="section-eyebrow light">THE FIRST CONVERSATION</p>
        <h2><span>桌子还空着。</span><span>愿意坐下吗？</span></h2>
        <div className="closing-actions">
          <button className="primary-action" type="button" onClick={() => openForm("chat")}>
            我想来聊聊 <ArrowRight size={22} weight="bold" />
          </button>
          <button className="text-action on-dark" type="button" onClick={() => openForm("resource")}>
            我能帮上什么
          </button>
        </div>
      </section>

      <footer>
        <BrandMark compact />
        <p>在深圳，和有意思的人，聊点有意思的。</p>
        <p>© 2026 BB 箱子</p>
      </footer>

      {modalType ? <ParticipationModal type={modalType} onClose={() => setModalType(null)} /> : null}
    </main>
  );
}
