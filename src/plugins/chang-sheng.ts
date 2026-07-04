/**
 * 十二长生插件
 *
 * 以日干起十二长生（阳干顺行、阴干逆行），标注日干在各地盘宫位的
 * 长生状态，写入 gong[i].extras.changSheng 供天地盘角标展示。
 */
import type { LiuRenPlugin } from './types';
import { DI_ZHI } from '../engines/types';
import { zhiIndex } from '../engines/jinkoujue/maps';

const CHANG_SHENG_ORDER = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰',
  '病', '死', '墓', '绝', '胎', '养',
] as const;

/** 日干长生起点（甲亥、乙午、丙戊寅、丁己酉、庚巳、辛子、壬申、癸卯） */
const CHANG_SHENG_START: Record<string, string> = {
  甲: '亥', 乙: '午', 丙: '寅', 丁: '酉', 戊: '寅',
  己: '酉', 庚: '巳', 辛: '子', 壬: '申', 癸: '卯',
};

const YANG_GAN = ['甲', '丙', '戊', '庚', '壬'];

/** 日干在某地支的十二长生状态 */
export function getChangSheng(riGan: string, zhi: string): string {
  const start = CHANG_SHENG_START[riGan];
  if (!start) return '';
  const startIdx = zhiIndex(start);
  const targetIdx = zhiIndex(zhi);
  if (startIdx < 0 || targetIdx < 0) return '';
  const steps = YANG_GAN.includes(riGan)
    ? (targetIdx - startIdx + 12) % 12
    : (startIdx - targetIdx + 12) % 12;
  return CHANG_SHENG_ORDER[steps];
}

export const changShengPlugin: LiuRenPlugin = {
  id: 'chang-sheng',
  title: '十二长生',
  description: '日干十二长生盘（阳顺阴逆），标注各宫长生状态',
  compute(chart) {
    const riGan = (chart.dateInfo.bazi.split(' ')[2] ?? '').charAt(0);
    if (!riGan) return undefined;
    const map: Record<string, string> = {};
    chart.gong.forEach((g) => {
      const state = getChangSheng(riGan, g.diZhi);
      if (!state) return;
      g.extras = { ...g.extras, changSheng: state };
      map[g.diZhi] = state;
    });
    return { riGan, map, order: DI_ZHI.map((zhi) => `${zhi}${map[zhi] ?? ''}`) };
  },
};
