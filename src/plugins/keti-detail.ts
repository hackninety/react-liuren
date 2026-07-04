/**
 * 课体细分 + 课名插件
 *
 * - 课名：如「戊子日第十局 干上申」。局数按天盘位移推得：
 *   干上神与日干寄宫的逆移位数 k → 第 k+1 局（伏吟为第一局、返吟为第七局，
 *   与传统 720 课编号一致，可自验证）。
 * - 课体细分：在引擎给出的课体（九宗门）之外，补充结构上无歧义的
 *   第二维度课体：进茹/退茹、间传、五行局（曲直/炎上/稼穑/从革/润下）、
 *   三传俱阳/俱阴。
 */
import type { LiuRenPlugin } from './types';
import { ZHI_WU_XING, zhiIndex } from '../engines/jinkoujue/maps';

export interface KetiDetailResult {
  /** 课名，如 "戊子日第十局 干上申" */
  keName: string;
  /** 第几局（1-12） */
  ju: number;
  /** 细分课体标签 */
  subTypes: string[];
}

/** 日干寄宫（甲寄寅、乙寄辰、丙戊寄巳、丁己寄未、庚寄申、辛寄戌、壬寄亥、癸寄丑） */
const JI_GONG: Record<string, string> = {
  甲: '寅', 乙: '辰', 丙: '巳', 丁: '未', 戊: '巳',
  己: '未', 庚: '申', 辛: '戌', 壬: '亥', 癸: '丑',
};

const WU_XING_JU_NAME: Record<string, string> = {
  木: '曲直', 火: '炎上', 土: '稼穑', 金: '从革', 水: '润下',
};

/** 阳支：子寅辰午申戌（地支序偶数位） */
function isYangZhi(zhi: string): boolean {
  const idx = zhiIndex(zhi);
  return idx >= 0 && idx % 2 === 0;
}

export function classifySubTypes(chu: string, zhong: string, mo: string): string[] {
  const c = zhiIndex(chu);
  const z = zhiIndex(zhong);
  const m = zhiIndex(mo);
  if (c < 0 || z < 0 || m < 0) return [];

  const subTypes: string[] = [];
  const step1 = (z - c + 12) % 12;
  const step2 = (m - z + 12) % 12;

  if (step1 === 1 && step2 === 1) subTypes.push('进茹');
  if (step1 === 11 && step2 === 11) subTypes.push('退茹');
  if (step1 === 2 && step2 === 2) subTypes.push('顺间传');
  if (step1 === 10 && step2 === 10) subTypes.push('逆间传');

  const wuXingSet = new Set([ZHI_WU_XING[chu], ZHI_WU_XING[zhong], ZHI_WU_XING[mo]]);
  if (wuXingSet.size === 1) {
    const ju = WU_XING_JU_NAME[ZHI_WU_XING[chu]];
    if (ju) subTypes.push(`${ju}（三传全${ZHI_WU_XING[chu]}）`);
  }

  const yangCount = [chu, zhong, mo].filter(isYangZhi).length;
  if (yangCount === 3) subTypes.push('三传俱阳');
  if (yangCount === 0) subTypes.push('三传俱阴');

  return subTypes;
}

export const ketiDetailPlugin: LiuRenPlugin = {
  id: 'keti-detail',
  title: '课体细分 · 课名',
  description: '推算传统课名（第几局）与结构性课体标签',
  compute(chart): KetiDetailResult | undefined {
    const riGanZhi = chart.dateInfo.bazi.split(' ')[2] ?? '';
    const riGan = riGanZhi.charAt(0);
    const ganShang = chart.siKe[0]?.shang ?? '';
    const jiGong = JI_GONG[riGan];

    let keName = '';
    let ju = 0;
    if (riGanZhi && ganShang && jiGong) {
      // 天盘逆移 k 位为第 k+1 局
      const k = (zhiIndex(ganShang) - zhiIndex(jiGong) + 12) % 12;
      ju = ((12 - k) % 12) + 1;
      const juText = ju <= 10 ? '一二三四五六七八九十'.charAt(ju - 1) : ju === 11 ? '十一' : '十二';
      keName = `${riGanZhi}日第${juText}局 干上${ganShang}`;
    }

    const subTypes = classifySubTypes(
      chart.sanChuan.chu.zhi,
      chart.sanChuan.zhong.zhi,
      chart.sanChuan.mo.zhi,
    );

    if (!keName && subTypes.length === 0) return undefined;
    return { keName, ju, subTypes };
  },
};
