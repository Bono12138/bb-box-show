export const initialQuotes = [
  { id: 'A', base: '8.8', extra: '7.0', scope: '年费；实施、迁移、接口另计', source: 'A 报价及附件第 2–4 项' },
  { id: 'B', base: '10.2', extra: '0', scope: '年费、实施、迁移及两项接口', source: 'B 方案范围说明' },
  { id: 'C', base: '9.5', extra: '', scope: '年费、实施与迁移；接口未报价', source: 'C 报价，接口范围待确认' },
];

export function calculateQuotes(rows) {
  const calculated = rows.map(row => {
    const base = row.base.trim() === '' ? null : Number(row.base);
    const extra = row.extra.trim() === '' ? null : Number(row.extra);
    const invalid = (base !== null && (!Number.isFinite(base) || base < 0 || base > 10000)) || (extra !== null && (!Number.isFinite(extra) || extra < 0 || extra > 10000));
    const complete = base !== null && extra !== null && !invalid;
    const total = complete ? Math.round((base + extra) * 100) / 100 : null;
    return { ...row, baseValue: base, extraValue: extra, invalid, complete, total };
  });
  const ranked = calculated.filter(row => row.complete).sort((a, b) => a.total - b.total);
  const lowest = ranked[0] || null;
  const winners = lowest ? ranked.filter(row => row.total === lowest.total).map(row => row.id) : [];
  return { rows: calculated, lowest, winners, incomplete: calculated.filter(row => !row.complete) };
}

export function quoteCsv(rows) {
  const result = calculateQuotes(rows);
  return '\uFEFF' + ['方案,基础报价（万元）,附加费用（万元）,首年总成本（万元）,状态', ...result.rows.map(row => [row.id, row.base, row.extra, row.total ?? '', row.invalid ? '请核对数值' : row.complete ? '费用已完整' : '费用待补齐'].join(',')), '', '口径：100名用户、实施、迁移及两项接口；首年含税。全部为合成数据。'].join('\r\n');
}

export function quoteExportUrl(rows) {
  const parameters = new URLSearchParams();
  for (const row of rows) {
    parameters.set(`${row.id}_base`, row.base);
    parameters.set(`${row.id}_extra`, row.extra);
  }
  return `/downloads/quote-demo.csv?${parameters}`;
}
