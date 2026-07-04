/**
 * 本命 · 行年插件
 *
 * - 本命：出生年干支
 * - 行年：男一岁起丙寅顺行、女一岁起壬申逆行，按虚岁推至今年
 * 在天地盘上标注本命/行年所落宫位（gong[i].extras.mark），
 * 并返回文字结果供面板展示。
 */
import type { LiuRenPlugin } from './types';
import { DI_ZHI, TIAN_GAN, zhiIndex } from '../engines/jinkoujue/maps';

export interface XingNianResult {
  benMing: string;
  xingNian: string;
  xuSui: number;
}

/** 公历年 → 干支（1984 为甲子） */
export function yearGanZhi(year: number): string {
  const gan = TIAN_GAN[(((year - 4) % 10) + 10) % 10];
  const zhi = DI_ZHI[(((year - 4) % 12) + 12) % 12];
  return `${gan}${zhi}`;
}

/** 行年：男起丙寅顺行、女起壬申逆行（一岁为起点） */
export function xingNianGanZhi(xuSui: number, gender: '男' | '女'): string {
  const steps = xuSui - 1;
  if (gender === '男') {
    // 丙寅顺行
    const gan = TIAN_GAN[(2 + steps) % 10];
    const zhi = DI_ZHI[(2 + steps) % 12];
    return `${gan}${zhi}`;
  }
  // 壬申逆行
  const gan = TIAN_GAN[(((8 - steps) % 10) + 10) % 10];
  const zhi = DI_ZHI[(((8 - steps) % 12) + 12) % 12];
  return `${gan}${zhi}`;
}

export const xingNianPlugin: LiuRenPlugin = {
  id: 'xingnian',
  title: '本命 · 行年',
  description: '出生年本命与男顺女逆行年，标注上盘宫位',
  compute(chart, ctx): XingNianResult | undefined {
    if (!ctx?.birthYear || !ctx.gender) return undefined;
    const chartYear = ctx.chartYear ?? new Date().getFullYear();
    const xuSui = chartYear - ctx.birthYear + 1;
    if (xuSui <= 0) return undefined;

    const benMing = yearGanZhi(ctx.birthYear);
    const xingNian = xingNianGanZhi(xuSui, ctx.gender);

    const markGong = (zhi: string, label: string) => {
      const idx = zhiIndex(zhi);
      if (idx < 0) return;
      const gong = chart.gong[idx];
      if (!gong) return;
      const prev = gong.extras?.mark;
      gong.extras = { ...gong.extras, mark: prev ? `${prev}·${label}` : label };
    };
    markGong(benMing.charAt(1), '本命');
    markGong(xingNian.charAt(1), '行年');

    return { benMing, xingNian, xuSui };
  },
};
