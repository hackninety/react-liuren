/**
 * 排盘结果 → Markdown 序列化
 *
 * 比 JSON 更紧凑、更省 token，且 AI 可无障碍阅读；完整记录全盘信息
 * （天地盘/四课/三传/神煞/贵人/插件/古法卅六卦与判定路径），供 AI 细致推理。
 * 按数据形状自动识别大六壬 / 金口诀 / 小六壬。
 */
import type {
  JinKouJueChart,
  LiuRenChart,
  XiaoLiuRenChart,
} from '@/engines/types';
import type { KetiDetailResult } from '@/plugins/keti-detail';
import type { XingNianResult } from '@/plugins/xingnian';
import { buildRelationLines } from './wuxing-relations';

/** 全角空格（用转义避免 no-irregular-whitespace） */
const FW = '　';

function isLiuRen(d: unknown): d is LiuRenChart {
  return !!d && typeof d === 'object' && 'gong' in d && 'siKe' in d && 'sanChuan' in d && 'meta' in d;
}
function isJinKouJue(d: unknown): d is JinKouJueChart {
  return !!d && typeof d === 'object' && 'siWei' in d && 'diFen' in d;
}
function isXiaoLiuRen(d: unknown): d is XiaoLiuRenChart {
  return !!d && typeof d === 'object' && 'palaces' in d && 'method' in d;
}

/** 大六壬 → MD */
function liuRenToMd(c: LiuRenChart): string {
  const L: string[] = [];
  const di = c.dateInfo;
  L.push(`# 大六壬排盘 · ${c.meta.school}（${c.meta.engineName}）`, '');

  // 基础信息
  L.push('## 基础信息');
  L.push(`- 四柱：${di.bazi || '—'}`);
  const tags: string[] = [];
  if (di.yueJiang) tags.push(`月将 ${di.yueJiang}`);
  if (di.xun) tags.push(`旬首 ${di.xun}`);
  if (di.kongWang.length) tags.push(`旬空 ${di.kongWang.join(' ')}`);
  if (di.yiMa) tags.push(`驿马 ${di.yiMa}`);
  if (di.dingMa) tags.push(`丁马 ${di.dingMa}`);
  if (di.tianMa) tags.push(`天马 ${di.tianMa}`);
  if (di.dayNight) tags.push(`${di.dayNight}占`);
  if (tags.length) L.push(`- ${tags.join(FW)}`);
  if (di.ganZhiDate) L.push(`- 干支历：${di.ganZhiDate}`);
  L.push('');

  // 天地盘（十二宫）
  const hasCS = c.gong.some((g) => g.extras?.changSheng);
  const hasWS = c.gong.some((g) => g.extras?.wangShuai);
  const hasJC = c.gong.some((g) => g.jianChu);
  const hasMark = c.gong.some((g) => g.extras?.mark);
  L.push('## 天地盘（十二宫）');
  const head = ['地盘', '天盘', '天将', '遁干'];
  if (hasJC) head.push('建除');
  if (hasCS) head.push('长生');
  if (hasWS) head.push('旺衰');
  if (hasMark) head.push('标记');
  L.push(`| ${head.join(' | ')} |`);
  L.push(`|${head.map(() => '---').join('|')}|`);
  for (const g of c.gong) {
    const row = [g.diZhi, g.tianZhi || '—', g.tianJiang || '—', g.dunGan || '—'];
    if (hasJC) row.push(g.jianChu || '—');
    if (hasCS) row.push(g.extras?.changSheng || '—');
    if (hasWS) row.push(g.extras?.wangShuai || '—');
    if (hasMark) row.push(g.extras?.mark || '—');
    L.push(`| ${row.join(' | ')} |`);
  }
  L.push('');

  // 四课
  L.push('## 四课');
  L.push('| 课 | 上神 | 下神 | 天将 |');
  L.push('|---|---|---|---|');
  for (const k of c.siKe) L.push(`| ${k.name} | ${k.shang || '—'} | ${k.xia || '—'} | ${k.tianJiang || '—'} |`);
  L.push('');

  // 三传
  L.push('## 三传');
  const keti = c.extras['keti-detail'] as KetiDetailResult | undefined;
  if (c.sanChuan.keTi) L.push(`- 课体：${c.sanChuan.keTi}${c.sanChuan.method && c.sanChuan.method !== c.sanChuan.keTi ? `（${c.sanChuan.method}）` : ''}`);
  if (keti?.keName) L.push(`- 课名：${keti.keName}`);
  if (keti?.subTypes.length) L.push(`- 课体细分：${keti.subTypes.join('、')}`);
  const chuanLine = (name: string, ch: LiuRenChart['sanChuan']['chu']) =>
    `- ${name}：${ch.zhi || '—'}${ch.tianJiang ? ' ' + ch.tianJiang : ''}${ch.liuQin ? ' ' + ch.liuQin : ''}${ch.dunGan ? ' 遁' + ch.dunGan : ''}`;
  L.push(chuanLine('初传', c.sanChuan.chu));
  L.push(chuanLine('中传', c.sanChuan.zhong));
  L.push(chuanLine('末传', c.sanChuan.mo));
  L.push('');

  // 关系摘要（机器核算的生克刑冲事实，供 AI 直接采用、免自算五行）
  const rel = buildRelationLines(c);
  if (rel.length) {
    L.push('## 关系摘要（机器核算）');
    for (const r of rel) L.push(`- ${r}`);
    L.push('');
  }

  // 神煞
  if (c.shenSha.length) {
    L.push('## 神煞');
    for (const s of c.shenSha) L.push(`- ${s.name}${s.value ? `（${s.value}）` : ''}${s.description ? ` — ${s.description}` : ''}`);
    L.push('');
  }

  // 阴阳贵人
  if (c.yinYangGuiRen) {
    L.push('## 阴阳贵人');
    const fmt = (m: Partial<Record<string, string>>) =>
      Object.entries(m).map(([z, j]) => `${z}${j}`).join(' ');
    L.push(`- 阳贵：${fmt(c.yinYangGuiRen.yang)}`);
    L.push(`- 阴贵：${fmt(c.yinYangGuiRen.yin)}`);
    L.push('');
  }

  // 本命行年（插件）
  const xn = c.extras['xingnian'] as XingNianResult | undefined;
  if (xn) {
    L.push('## 本命 · 行年');
    L.push(`- 本命：${xn.benMing}${FW}行年：${xn.xingNian}（虚岁 ${xn.xuSui}）`);
    L.push('');
  }

  // 毕法命中（lrdq-ts-lib 插件）
  const bifaHits = c.extras.bifa as
    | { no: number; name: string; fu: string; certainty: string; why: string }[]
    | undefined;
  if (bifaHits?.length) {
    L.push('## 毕法命中（《畢法賦》97/100 法检测）');
    for (const h of bifaHits) {
      L.push(`- 第${h.no}法 ${h.fu}（${h.certainty === 'exact' ? '确判' : '近似'}）— ${h.why}`);
    }
    L.push('');
  }

  // 大全神煞（dq-shensha 插件：《六壬大全》卷一立成）
  const dqss = c.extras['dq-shensha'] as
    | {
        month: string;
        table: { section: string; name: string; value: string; note?: string; hit: boolean }[];
        gongYue: { pos: string; zhi: string; ji: string[]; xiong: string[] }[];
      }
    | undefined;
  if (dqss) {
    L.push(`## 大全神煞（《六壬大全》卷一立成${dqss.month ? `，月建${dqss.month}` : ''}）`);
    const hits = dqss.table.filter((r) => r.hit);
    if (hits.length) {
      L.push(`- 入课传：${hits.map((r) => `${r.name}${r.value}（${r.section}）`).join('、')}`);
    }
    for (const g of dqss.gongYue) {
      const parts = [];
      if (g.ji.length) parts.push(`吉 ${g.ji.join(' ')}`);
      if (g.xiong.length) parts.push(`凶 ${g.xiong.join(' ')}`);
      L.push(`- ${g.pos}${g.zhi}：${parts.join('；') || '—'}`);
    }
    L.push(`- 神煞落支全表 ${dqss.table.length} 条见 JSON extras["dq-shensha"]`);
    L.push('');
  }

  // 类神（导出面板异步补挂 extras.leishen：《神將釋》brief 原行）
  const leishen = c.extras.leishen as
    | { kind: string; name: string; zhi?: string; brief: string }[]
    | undefined;
  if (leishen?.length) {
    L.push('## 类神（《六壬大全》卷二神將釋）');
    for (const e of leishen) {
      L.push(`### ${e.name}（${e.kind}${e.zhi ? `·${e.zhi}` : ''}）`, '', e.brief, '');
    }
  }

  // 古法（占事略決）
  const gua36 = c.extras.gua36 as { name: string; certainty: string; why?: string }[] | undefined;
  const path = c.extras.path as { fa: string; note: string; ref: string }[] | undefined;
  const zhanduan = c.extras.zhanduan as { title: string; verdicts: string[] }[] | undefined;
  const refs = c.extras.refs as string[] | undefined;
  if (gua36?.length || path?.length || zhanduan?.length || refs?.length) {
    L.push('## 古法（占事略決）');
    if (gua36?.length) L.push(`- 卅六卦：${gua36.map((g) => `${g.name}${g.certainty !== 'exact' ? '(近似)' : ''}`).join('、')}`);
    if (path?.length) {
      L.push('- 課用九法判定路径：');
      path.forEach((s, i) => L.push(`  ${i + 1}. ${s.fa} — ${s.note}${s.ref ? `（${s.ref}）` : ''}`));
    }
    if (zhanduan?.length) {
      L.push('- 占断：');
      for (const z of zhanduan) if (z.verdicts?.length) L.push(`  - ${z.title}：${z.verdicts.join('；')}`);
    }
    if (refs?.length) L.push(`- 原文锚点：${refs.join('、')}`);
    L.push('');
  }

  // 课体原文引（导出面板异步补挂 extras.kejing：課經/心鏡课体节全文）
  const kejing = c.extras.kejing as
    | { name: string; book: string; juan: number; text: string }[]
    | undefined;
  if (kejing?.length) {
    L.push('## 课体原文引（《六壬大全·課經》《六壬心鏡》）');
    for (const e of kejing) {
      L.push(`### ${e.name}（《${e.book}》卷${e.juan}）`, '', e.text, '');
    }
  }

  return L.join('\n').trim() + '\n';
}

/** 金口诀 → MD */
function jinKouJueToMd(c: JinKouJueChart): string {
  const L: string[] = [];
  L.push('# 金口诀排盘', '');
  if (c.date.bazi) L.push(`- 四柱：${c.date.bazi}`);
  L.push(`- 地分：${c.diFen}`, '');

  L.push('## 四位');
  L.push('| 位 | 名 | 干支 | 五行 | 旺衰 |');
  L.push('|---|---|---|---|---|');
  const w = c.siWei;
  const row = (label: string, p: JinKouJueChart['siWei']['renYuan']) =>
    `| ${label} | ${p.name || '—'} | ${p.ganZhi || '—'} | ${p.wuXing || '—'} | ${p.wangXiangXiuQiu || '—'} |`;
  L.push(row('人元（干）', w.renYuan));
  L.push(row('贵神（神）', w.guiShen));
  L.push(row('将神（将）', w.jiangShen));
  L.push(row('地分（方）', w.diFen));
  L.push('');

  if (c.shenSha.length) {
    L.push('## 神煞');
    for (const s of c.shenSha) {
      L.push(`- [${s.type}] ${s.name}（${s.value}）${s.position.length ? ` 落${s.position.join('/')}` : ''}${s.description ? ` — ${s.description}` : ''}`);
    }
    L.push('');
  }
  return L.join('\n').trim() + '\n';
}

/** 小六壬 → MD */
function xiaoLiuRenToMd(c: XiaoLiuRenChart): string {
  const L: string[] = [];
  L.push(`# 小六壬排盘 · ${c.meta.school}（${c.meta.engineName}）`, '');
  L.push(`- 起课：${c.inputSummary}`, '');

  L.push('## 六宫');
  L.push('| 宫 | 地支 | 六亲 | 六神 | 五行星 | 旺衰 | 标记 |');
  L.push('|---|---|---|---|---|---|---|');
  for (const p of c.palaces) {
    const marks = [p.isDayPalace ? '日' : '', p.isHourPalace ? '时' : '', p.sanGongRole ?? ''].filter(Boolean).join('/');
    L.push(`| ${p.gong} | ${p.branch || '—'} | ${p.kin || '—'} | ${p.deity || '—'} | ${p.star || '—'} | ${p.wangShuai || '—'} | ${marks || '—'} |`);
  }
  L.push('');
  if (c.summary) {
    L.push('## 课象', c.summary, '');
  }
  return L.join('\n').trim() + '\n';
}

/** 排盘数据 → Markdown（自动识别形状） */
export function chartToMarkdown(data: unknown): string {
  if (isLiuRen(data)) return liuRenToMd(data);
  if (isJinKouJue(data)) return jinKouJueToMd(data);
  if (isXiaoLiuRen(data)) return xiaoLiuRenToMd(data);
  // 兜底：JSON 代码块
  return '```json\n' + JSON.stringify(data, (k, v) => (k === 'aiPrompt' ? undefined : v), 2) + '\n```\n';
}
