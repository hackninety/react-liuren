/**
 * 毕法赋命中插件
 *
 * 调 lrdq-ts-lib 对当前盘做《畢法賦》百法格局检测（97/100 法，
 * exact/approx 分级），命中挂 extras.bifa，SanChuanPanel 渲染。
 * 统一模型 LiuRenChart 与检测输入结构兼容，直接传入；若 xingnian
 * 插件已算出本命/行年，则一并传入以启用年命类法（如第56法天网自裹）。
 * 第93/97/98法不设检测器（起传校勘/断法方法论，见库文档）。
 */
import { detectBifa } from 'lrdq-ts-lib';
import type { LiuRenPlugin } from './types';
import type { XingNianResult } from './xingnian';

export const bifaPlugin: LiuRenPlugin = {
  id: 'bifa',
  title: '毕法赋',
  description: '《畢法賦》百法格局命中（《六壬大全》卷十一/十二，97/100 法机器检测）',
  compute(chart) {
    const xn = chart.extras?.['xingnian'] as XingNianResult | undefined;
    const hits = detectBifa({
      ...chart,
      nianMing: xn
        ? { benMing: xn.benMing.charAt(1), xingNian: xn.xingNian.charAt(1) }
        : undefined,
    });
    return hits.length ? hits : undefined;
  },
};
