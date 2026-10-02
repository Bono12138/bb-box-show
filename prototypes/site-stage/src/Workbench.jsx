import { useState } from 'react';
import { ArrowRight, ArrowUpRight, DownloadSimple, ArrowCounterClockwise, FileText, Table, PresentationChart, CaretDown } from '@phosphor-icons/react';
import { initialQuotes, calculateQuotes, quoteExportUrl } from './quote-model.js';

const money = value => value == null ? '待补齐' : value.toFixed(2);
const names = { table: '比较表', report: '评审报告', slides: '汇报预览' };

export function Workbench({ standalone = false }) {
  const [quotes, setQuotes] = useState(() => initialQuotes.map(row => ({ ...row })));
  const [view, setView] = useState('table');
  const [process, setProcess] = useState(false);
  const [changed, setChanged] = useState(null);
  const result = calculateQuotes(quotes);
  const update = (id, field, value) => { setQuotes(rows => rows.map(row => row.id === id ? { ...row, [field]: value } : row)); setChanged(id); };
  return <section className={`workbench-section ${standalone ? 'is-standalone' : ''}`} id="workbench" aria-labelledby="workbench-title">
    <div className="section-heading"><h2 id="workbench-title">先看它怎么做。</h2><p><span className="semantic-line">改一笔费用，</span><span className="semantic-line">看整份评审怎么变。</span></p><p className="small-note">合成数据交互演示 · 网站内计算</p></div>
    <div className="workbench-layout">
      <div className="computer-wrap">
        <div className="computer-window">
          <div className="computer-toolbar"><Table size={23} weight="fill" /><strong>供应商方案评审</strong><span>首年 · 万元</span></div>
          <div className="computer-command"><span>基础报价</span><span>附加费用</span><span>范围核对</span><button onClick={() => { setQuotes(initialQuotes.map(row => ({ ...row }))); setChanged(null); }}><ArrowCounterClockwise size={15} />重置</button></div>
          <div className="formula-bar"><span>fx</span><code>总成本 = 基础报价 + 附加费用</code></div>
          <table className="quote-table"><caption className="sr-only">修改报价和费用，比较表、报告与汇报预览同步更新。单位为万元。</caption><thead><tr><th>方案</th><th>基础报价</th><th>附加费用</th><th>首年总成本</th></tr></thead><tbody>{result.rows.map(row => <tr key={row.id} className={`${changed === row.id ? 'row-changed' : ''} ${result.winners.includes(row.id) ? 'row-best' : ''}`}>
            <th scope="row">{row.id}</th>
            <td><input aria-label={`方案${row.id}基础报价，万元`} type="number" inputMode="decimal" min="0" max="10000" step="0.1" value={row.base} onChange={e => update(row.id, 'base', e.target.value)} aria-invalid={row.invalid} /></td>
            <td><input aria-label={`方案${row.id}附加费用，万元`} type="number" inputMode="decimal" min="0" max="10000" step="0.1" placeholder="未报价" value={row.extra} onChange={e => update(row.id, 'extra', e.target.value)} aria-invalid={row.invalid} /></td>
            <td><strong key={`${row.total}-${row.invalid}`} className={row.total === null ? 'missing-total' : 'total-flash'}>{row.invalid ? '请核对' : money(row.total)}</strong></td>
          </tr>)}</tbody></table>
          <div className="sheet-tabs"><span>报价比较</span><span>范围与出处</span><span>演示数据</span></div>
        </div>
        <div className="computer-base" aria-hidden="true" />
        <p className="demo-scope"><span className="semantic-line">共同口径：100 名用户。</span><span className="semantic-line">实施、迁移及两项接口。</span><span className="semantic-line">首年含税。</span></p>
      </div>
      <div className="output-region">
        <div className="output-tabs" role="tablist" aria-label="查看输出">{Object.entries(names).map(([id, label]) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={view === id} aria-controls={`panel-${id}`} tabIndex={view === id ? 0 : -1} onKeyDown={event => { if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return; event.preventDefault(); const ids=Object.keys(names); const index=ids.indexOf(view); const next=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowRight'?1:2))%3; setView(ids[next]); document.getElementById(`tab-${ids[next]}`)?.focus(); }} onClick={() => setView(id)}>{label}</button>)}</div>
        <div className={`output-panel output-${view}`} key={view} role="tabpanel" id={`panel-${view}`} aria-labelledby={`tab-${view}`}>
          {view === 'table' && <><h3><span>最低报价，</span><span>未必最划算。</span></h3><p><span className="semantic-line">原示例里，A 报价 8.8 万元。</span><span className="semantic-line">附件里的费用，还没算进去。</span></p><div className="cost-bars" aria-label="首年总成本图，万元">{result.rows.map(row => <div className="cost-row" key={row.id}><span>{row.id}</span><div className="bar-track"><i style={{ width: row.complete ? `${Math.max(2, row.total / Math.max(1, ...result.rows.map(x => x.total || 0)) * 100)}%` : '100%' }} className={row.complete ? '' : 'bar-unknown'} /></div><b>{money(row.total)}</b></div>)}</div></>}
          {view === 'report' && <div className="report-preview"><p className="report-title"><FileText size={23} />供应商评审摘要</p><h3>先对齐范围，<br />再比较成本。</h3><p>{result.lowest ? <><span className="semantic-line">完整报价中，{result.winners.join('、')} 方案成本最低。</span><span className="semantic-line">合计 {money(result.lowest.total)} 万元。</span></> : '请先补齐至少一份报价。'}</p><p>{result.incomplete.length ? <><span className="semantic-line">{result.incomplete.map(row=>row.id).join('、')} 方案费用未完整。</span><span className="semantic-line">补齐费用后，再参加排名。</span></> : <><span className="semantic-line">三份报价均已完整。</span><span className="semantic-line">现在可以比较。</span></>}</p><p className="small-note"><span className="semantic-line">这里只比较报价。</span><span className="semantic-line">交付能力需要人工评审。</span><span className="semantic-line">合同与风险也要另行核对。</span></p></div>}
          {view === 'slides' && <div className="slide-preview"><PresentationChart size={23} /><h3>供应商方案评审</h3><p>首年含税 · 统一服务范围</p><div className="slide-figures">{result.rows.map(row => <div key={row.id}><span>方案 {row.id}</span><strong>{money(row.total)}</strong><span>{row.complete ? '万元' : '缺项未排名'}</span></div>)}</div><p>数据与比较表同步 · HTML 汇报预览</p></div>}
        </div>
        <div className="result-live" role="status" aria-live="polite">{result.rows.some(row => row.invalid) ? '数值需在 0–10,000 万元之间。请核对输入。' : result.incomplete.length ? `${result.incomplete.map(row=>row.id).join('、')} 费用待补齐，不按零计算。` : '费用已完整，三种预览同步更新。'}</div>
        <div className="demo-actions"><button className="line-button" aria-expanded={process} aria-controls="demo-process" onClick={() => setProcess(!process)}>展开制作过程<CaretDown size={18} className={process ? 'is-up' : ''} /></button><a className="line-button" href={quoteExportUrl(quotes)} download="BB箱子_供应商比较_演示数据.csv" aria-disabled={result.rows.some(row => row.invalid)} onClick={event => { if (result.rows.some(row => row.invalid)) event.preventDefault(); }}><DownloadSimple size={20} />下载当前比较表</a></div>
        <a className="text-link" href="/?project=course">这一套工作怎么学<ArrowRight size={22} /></a>
      </div>
    </div>
    <div className={`process-fold ${process ? 'is-expanded' : ''}`} id="demo-process" hidden={!process}>
      <div className="source-files">{result.rows.map(row => <article key={row.id}><FileText size={27} /><h4>{row.id} 方案</h4><p>{row.scope}</p><small>{row.source}</small></article>)}</div>
      <ol className="process-steps"><li><b>01</b><strong>输入资料</strong><span>保留报价与附件。</span></li><li><b>02</b><strong>对齐口径</strong><span>补齐不同服务范围。</span></li><li><b>03</b><strong>人工复核</strong><span>缺项、数字与来源。</span></li><li><b>04</b><strong>比较与汇报</strong><span>统一数据。<br />三种呈现。</span></li></ol>
      <p className="small-note"><span className="semantic-line">本页演示已整理数据的计算。</span><span className="semantic-line">报告与汇报预览同步呈现。</span><span className="semantic-line">原始资料仍需提取和人工复核。</span></p><a className="text-link" href="/?page=article&slug=website-prototype-progress">看制作记录与检查范围<ArrowUpRight size={20} /></a>
    </div>
  </section>;
}
