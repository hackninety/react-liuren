/**
 * 生克关系摘要 —— 把盘面里 AI 最易算错的五行事实显式核算成文字
 *
 * 覆盖：干/支与其上神的生克脱比（兼禄墓长生标记）、干支上神间刑冲破害合、
 * 三传相邻生克（兼刑害合）、天将与所乘神的内战外战、旬空落点。
 * 供 chartToMarkdown 的「关系摘要」段与 AI Prompt 使用；断语按传统术语措辞。
 */
import type { LiuRenChart } from '@/engines/types';

const GAN_WX: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};
const ZHI_WX: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};
const WX_SHENG: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const WX_KE: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

const TJ_ALIAS: Record<string, string> = {
  貴人: '贵人', 天一: '贵人', 天乙: '贵人', 腾蛇: '螣蛇', 腾虵: '螣蛇', 騰蛇: '螣蛇',
  勾陳: '勾陈', 勾陣: '勾陈', 青龍: '青龙', 大裳: '太常', 元武: '玄武',
  太陰: '太阴', 大陰: '太阴', 天後: '天后',
};
const TJ_WX: Record<string, string> = {
  贵人: '土', 螣蛇: '火', 朱雀: '火', 六合: '木', 勾陈: '土', 青龙: '木',
  天空: '土', 白虎: '金', 太常: '土', 玄武: '水', 太阴: '金', 天后: '水',
};

const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const LIU_HE: Record<string, string> = {
  子: '丑', 丑: '子', 寅: '亥', 卯: '戌', 辰: '酉', 巳: '申',
  午: '未', 未: '午', 申: '巳', 酉: '辰', 戌: '卯', 亥: '寅',
};
const LIU_HAI: Record<string, string> = {
  子: '未', 未: '子', 丑: '午', 午: '丑', 寅: '巳', 巳: '寅',
  卯: '辰', 辰: '卯', 申: '亥', 亥: '申', 酉: '戌', 戌: '酉',
};
/** 破（子酉 卯午 辰丑 未戌 寅亥 巳申） */
const PO: Record<string, string> = {
  子: '酉', 酉: '子', 卯: '午', 午: '卯', 辰: '丑', 丑: '辰',
  未: '戌', 戌: '未', 寅: '亥', 亥: '寅', 巳: '申', 申: '巳',
};
/** 三刑（寅→巳→申→寅、丑→戌→未→丑、子↔卯、辰午酉亥自刑） */
const XING: Record<string, string> = {
  寅: '巳', 巳: '申', 申: '寅', 丑: '戌', 戌: '未', 未: '丑', 子: '卯', 卯: '子',
  辰: '辰', 午: '午', 酉: '酉', 亥: '亥',
};
const LU: Record<string, string> = {
  甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳',
  己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子',
};
const JI_GONG: Record<string, string> = {
  甲: '寅', 乙: '辰', 丙: '巳', 丁: '未', 戊: '巳',
  己: '未', 庚: '申', 辛: '戌', 壬: '亥', 癸: '丑',
};
/** 五行墓（木未 火戌 金丑 水土辰） */
const MU: Record<string, string> = { 木: '未', 火: '戌', 金: '丑', 水: '辰', 土: '辰' };
/** 五行长生（水土同长生申口径，与毕法检测器一致） */
const CS: Record<string, string> = { 木: '亥', 火: '寅', 金: '巳', 水: '申', 土: '申' };

const chongOf = (z: string) => ZHI[(ZHI.indexOf(z) + 6) % 12];
const normTJ = (n?: string) => (n ? TJ_ALIAS[n.trim()] ?? n.trim() : '');

/** 支对支：刑冲破害合关系词列表 */
function zhiPairs(a: string, b: string): string[] {
  if (!a || !b) return [];
  const out: string[] = [];
  if (LIU_HE[a] === b) out.push('六合');
  if (chongOf(a) === b) out.push('相冲');
  if (XING[a] === b || XING[b] === a) out.push(a === b ? '自刑' : '相刑');
  if (LIU_HAI[a] === b) out.push('相害');
  if (PO[a] === b) out.push('相破');
  return out;
}

/** 上神对下（干/支）的生克语（附禄墓长生标记） */
function shangXiaLine(label: string, shang: string, xiaWx: string, xiaName: string, gan?: string): string | null {
  const sw = ZHI_WX[shang];
  if (!shang || !sw) return null;
  let rel: string;
  if (sw === xiaWx) rel = `与${xiaName}比和`;
  else if (WX_SHENG[sw] === xiaWx) rel = `生${xiaName}（生我者）`;
  else if (WX_SHENG[xiaWx] === sw) rel = `被${xiaName}所生（${xiaName}脱气）`;
  else if (WX_KE[sw] === xiaWx) rel = `克${xiaName}（鬼贼）`;
  else rel = `被${xiaName}所克（${xiaName}之财）`;
  const marks: string[] = [];
  if (gan) {
    if (shang === LU[gan]) marks.push('日禄');
    if (shang === JI_GONG[gan]) marks.push('干寄宫');
  }
  if (shang === MU[xiaWx]) marks.push(`${xiaName}之墓`);
  if (shang === CS[xiaWx]) marks.push(`${xiaName}长生`);
  return `${label}${shang}（${sw}）${rel}${marks.length ? `；${shang}为${marks.join('、')}` : ''}`;
}

/** 传间一行：生克 + 刑冲害合并注 */
function chuanPairLine(aName: string, a: string, bName: string, b: string): string | null {
  const aw = ZHI_WX[a];
  const bw = ZHI_WX[b];
  if (!aw || !bw) return null;
  let rel: string;
  if (aw === bw) rel = '比和';
  else if (WX_SHENG[aw] === bw) rel = '生';
  else if (WX_KE[aw] === bw) rel = '克';
  else if (WX_SHENG[bw] === aw) rel = '受生于';
  else rel = '受克于';
  const extra = zhiPairs(a, b);
  return `${aName}${a}${rel}${bName}${b}${extra.length ? `（兼${extra.join('、')}）` : ''}`;
}

/** 天将与所乘神：只报内战/外战（神克将为内战、将克神为外战） */
function jiangZhanLine(pos: string, zhi: string, jiang?: string): string | null {
  const j = normTJ(jiang);
  const jw = TJ_WX[j];
  const zw = ZHI_WX[zhi];
  if (!jw || !zw) return null;
  if (WX_KE[zw] === jw) return `${pos}${zhi}（${zw}）克所乘${j}（${jw}）——内战`;
  if (WX_KE[jw] === zw) return `${pos}${zhi}乘${j}，将克神——外战`;
  return null;
}

/** 生成关系摘要行（MD 列表项内容，不含前缀） */
export function buildRelationLines(c: LiuRenChart): string[] {
  const bazi = (c.dateInfo?.bazi ?? '').split(' ');
  const gan = bazi[2]?.charAt(0) ?? '';
  const zhi = bazi[2]?.charAt(1) ?? '';
  const ganWx = GAN_WX[gan];
  const zhiWx = ZHI_WX[zhi];
  if (!ganWx || !zhiWx) return [];
  const L: string[] = [];

  const ganShang = c.siKe?.[0]?.shang ?? '';
  const zhiShang = c.siKe?.[2]?.shang ?? '';
  const g1 = shangXiaLine('干上', ganShang, ganWx, `日干${gan}`, gan);
  if (g1) L.push(g1);
  const z1 = shangXiaLine('支上', zhiShang, zhiWx, `日支${zhi}`);
  if (z1) L.push(z1);

  const pair = zhiPairs(ganShang, zhiShang);
  if (pair.length) L.push(`干上${ganShang}与支上${zhiShang}：${pair.join('、')}`);

  const cz = [c.sanChuan?.chu?.zhi, c.sanChuan?.zhong?.zhi, c.sanChuan?.mo?.zhi];
  if (cz[0] && cz[1]) {
    const l1 = chuanPairLine('初传', cz[0], '中传', cz[1]);
    if (l1) L.push(l1);
  }
  if (cz[1] && cz[2]) {
    const l2 = chuanPairLine('中传', cz[1], '末传', cz[2]);
    if (l2) L.push(l2);
  }

  // 天将内外战（干上/支上/三传）
  const zhanSpots: [string, string, string | undefined][] = [
    ['干上', ganShang, c.siKe?.[0]?.tianJiang],
    ['支上', zhiShang, c.siKe?.[2]?.tianJiang],
    ['初传', cz[0] ?? '', c.sanChuan?.chu?.tianJiang],
    ['中传', cz[1] ?? '', c.sanChuan?.zhong?.tianJiang],
    ['末传', cz[2] ?? '', c.sanChuan?.mo?.tianJiang],
  ];
  for (const [pos, z, j] of zhanSpots) {
    const line = z ? jiangZhanLine(pos, z, j) : null;
    if (line) L.push(line);
  }

  // 传冲日支/干寄宫（动象）
  for (const [i, z] of cz.entries()) {
    if (!z) continue;
    const posName = ['初传', '中传', '末传'][i];
    if (chongOf(z) === zhi) L.push(`${posName}${z}冲日支${zhi}（宅/内动象）`);
    if (chongOf(z) === JI_GONG[gan]) L.push(`${posName}${z}冲干寄宫${JI_GONG[gan]}（身动象）`);
  }

  // 旬空落点
  const kong = c.dateInfo?.kongWang ?? [];
  if (kong.length) {
    const spots: string[] = [];
    if (kong.includes(ganShang)) spots.push(`干上${ganShang}`);
    if (kong.includes(zhiShang)) spots.push(`支上${zhiShang}`);
    cz.forEach((z, i) => {
      if (z && kong.includes(z)) spots.push(`${['初传', '中传', '末传'][i]}${z}`);
    });
    L.push(
      spots.length
        ? `旬空${kong.join('、')}落点：${spots.join('、')}`
        : `旬空${kong.join('、')}未入课传`,
    );
  }

  return L;
}
