/**
 * 应期候选插件
 *
 * 把应期诀里机器可算的候选支显式列出——初/末传值日与合冲、旬空出空填实与
 * 冲实、驿马丁马天马、三传三合虚一待用、日干墓冲开——每个候选附来由，
 * 取舍与组合留给断者（AI Prompt 第 5 步以此为候选池，结合占事与类神旺衰择取）。
 * 挂 extras['ying-qi']，SanChuanPanel 渲染 + MD「应期候选」段。
 */
import type { LiuRenPlugin } from './types';

const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const GAN_WX: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};
const LIU_HE: Record<string, string> = {
  子: '丑', 丑: '子', 寅: '亥', 卯: '戌', 辰: '酉', 巳: '申',
  午: '未', 未: '午', 申: '巳', 酉: '辰', 戌: '卯', 亥: '寅',
};
/** 五行墓（木未 火戌 金丑 水土辰，与关系摘要口径一致） */
const MU: Record<string, string> = { 木: '未', 火: '戌', 金: '丑', 水: '辰', 土: '辰' };
const SAN_HE: [string, string[]][] = [
  ['水', ['申', '子', '辰']],
  ['火', ['寅', '午', '戌']],
  ['金', ['巳', '酉', '丑']],
  ['木', ['亥', '卯', '未']],
];
const chongOf = (z: string) => ZHI[(ZHI.indexOf(z) + 6) % 12];

export interface YingQiResult {
  /** 候选支（按产生顺序，来由合并） */
  candidates: { zhi: string; reasons: string[] }[];
  /** 盘面级观察（如三传成局） */
  notes: string[];
}

export const yingQiPlugin: LiuRenPlugin = {
  id: 'ying-qi',
  title: '应期候选',
  description: '初末传值日/合/冲、旬空填实、驿马、三合虚一、墓冲开等机器可算应期候选（取舍留给断者）',
  compute(chart) {
    const day = (chart.dateInfo?.bazi ?? '').split(' ')[2] ?? '';
    const gan = day.charAt(0);
    const chu = chart.sanChuan?.chu?.zhi ?? '';
    const zhong = chart.sanChuan?.zhong?.zhi ?? '';
    const mo = chart.sanChuan?.mo?.zhi ?? '';
    if (!ZHI.includes(chu)) return undefined;

    const order: string[] = [];
    const map = new Map<string, string[]>();
    const add = (zhi: string | undefined, reason: string) => {
      if (!zhi || !ZHI.includes(zhi)) return;
      if (!map.has(zhi)) {
        map.set(zhi, []);
        order.push(zhi);
      }
      map.get(zhi)!.push(reason);
    };

    add(chu, `初传${chu}值日`);
    add(LIU_HE[chu], `合初传${chu}`);
    add(chongOf(chu), `冲初传${chu}`);
    if (mo && mo !== chu) {
      add(mo, `末传${mo}值日（事之归结）`);
      add(LIU_HE[mo], `合末传${mo}`);
      add(chongOf(mo), `冲末传${mo}`);
    }
    for (const k of chart.dateInfo?.kongWang ?? []) {
      add(k, `旬空${k}出空填实`);
      add(chongOf(k), `冲实旬空${k}`);
    }
    if (chart.dateInfo?.yiMa) add(chart.dateInfo.yiMa, '驿马动');
    if (chart.dateInfo?.dingMa) add(chart.dateInfo.dingMa, '丁马动');
    if (chart.dateInfo?.tianMa) add(chart.dateInfo.tianMa, '天马动');

    const notes: string[] = [];
    const distinct = [...new Set([chu, zhong, mo].filter((z) => ZHI.includes(z)))];
    for (const [wx, ju] of SAN_HE) {
      const present = ju.filter((z) => distinct.includes(z));
      if (present.length === 3) {
        notes.push(`三传${ju.join('')}成${wx}局，应期可看会局之月日`);
      } else if (present.length === 2) {
        const missing = ju.find((z) => !distinct.includes(z))!;
        add(missing, `三传见${present.join('、')}，待${missing}成${wx}局（虚一待用）`);
      }
    }
    const mu = MU[GAN_WX[gan] ?? ''];
    if (mu && chu === mu) add(chongOf(mu), `冲开初传${mu}（日干${gan}之墓）`);

    if (!order.length) return undefined;
    const result: YingQiResult = {
      candidates: order.map((z) => ({ zhi: z, reasons: map.get(z)! })),
      notes,
    };
    return result;
  },
};
