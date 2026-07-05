/**
 * 大全神煞插件
 *
 * 依《六壬大全》卷一神煞立成（lrdq-ts-lib/shensha 结构化数据）为当前盘检索：
 * - 三表＋月令映射条：歲神煞（年支取值）／十天干（日干）／十二地支（日支）／
 *   月令杂列（月名），得神煞落支，并标记是否入课传（干支上神与三传）
 * - 逐月立成：课传五位所坐之支在当月的上/下栏神煞（底本版面上吉下凶）
 * 结果挂 extras['dq-shensha']，ShenShaPanel 渲染、MD/JSON 导出携带；
 * 原文见典籍库《六壬大全》卷一。数据 ~60KB 随主包（同步计算所需）。
 */
import { getShenShaSections, monthlyAt } from 'lrdq-ts-lib/shensha';
import type { LiuRenPlugin } from './types';

export interface DqShenShaRow {
  section: string;
  name: string;
  /** 落支 */
  value: string;
  note?: string;
  /** 是否入课传（干上/支上/三传） */
  hit: boolean;
}

export interface DqGongYue {
  /** 位置标签（同支合并：如「干上·初传」） */
  pos: string;
  zhi: string;
  /** 上栏（吉神栏） */
  ji: string[];
  /** 下栏（凶神栏） */
  xiong: string[];
}

export interface DqShenShaResult {
  /** 月建名（正月~十二月） */
  month: string;
  /** 三表＋月令映射条（全表，hit=入课传） */
  table: DqShenShaRow[];
  /** 课传各位所值月煞（逐月立成） */
  gongYue: DqGongYue[];
}

const ZHI12 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const YUE12 = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export const dqShenShaPlugin: LiuRenPlugin = {
  id: 'dq-shensha',
  title: '大全神煞',
  description: '《六壬大全》卷一神煞立成：三表落支入传标记 + 课传各位当月吉凶神',
  compute(chart): DqShenShaResult | undefined {
    const bazi = (chart.dateInfo?.bazi ?? '').split(' ');
    const nianZhi = bazi[0]?.charAt(1) ?? '';
    const yueZhi = bazi[1]?.charAt(1) ?? '';
    const riGan = bazi[2]?.charAt(0) ?? '';
    const riZhi = bazi[2]?.charAt(1) ?? '';
    if (!riGan || !riZhi) return undefined;
    const monthIdx = ZHI12.indexOf(yueZhi);
    const month = monthIdx >= 0 ? YUE12[(monthIdx + 10) % 12] : '';

    const ganShang = chart.siKe?.[0]?.shang ?? '';
    const zhiShang = chart.siKe?.[2]?.shang ?? '';
    const chuan = [chart.sanChuan?.chu?.zhi, chart.sanChuan?.zhong?.zhi, chart.sanChuan?.mo?.zhi];
    const pool = new Set([ganShang, zhiShang, ...chuan].filter(Boolean));

    const keyOf: Record<string, string> = { sui: nianZhi, gan: riGan, zhi: riZhi, yue: month };
    const table: DqShenShaRow[] = [];
    for (const s of getShenShaSections()) {
      const key = keyOf[s.id];
      if (!key) continue;
      for (const e of s.entries) {
        const value = e.map?.[key];
        if (!value) continue;
        table.push({
          section: s.section, name: e.name, value,
          ...(e.note ? { note: e.note } : {}),
          hit: pool.has(value),
        });
      }
    }

    const gongYue: DqGongYue[] = [];
    if (month) {
      const seen = new Map<string, DqGongYue>();
      const posList: [string, string | undefined][] = [
        ['干上', ganShang], ['支上', zhiShang],
        ['初传', chuan[0]], ['中传', chuan[1]], ['末传', chuan[2]],
      ];
      for (const [pos, zhi] of posList) {
        if (!zhi) continue;
        const exist = seen.get(zhi);
        if (exist) {
          exist.pos += `·${pos}`;
          continue;
        }
        const g = monthlyAt(month, zhi);
        if (!g) continue;
        const row: DqGongYue = { pos, zhi, ji: g.ji, xiong: g.xiong };
        seen.set(zhi, row);
        gongYue.push(row);
      }
    }

    return table.length || gongYue.length ? { month, table, gongYue } : undefined;
  },
};
