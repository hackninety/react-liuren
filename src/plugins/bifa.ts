/**
 * 毕法赋命中插件
 *
 * 调 lrdq-ts-lib 对当前盘做《畢法賦》百法格局检测（首批 23 法，
 * exact/approx 分级），命中挂 extras.bifa，SanChuanPanel 渲染。
 * 统一模型 LiuRenChart 与检测输入结构兼容，直接传入。
 */
import { detectBifa } from 'lrdq-ts-lib';
import type { LiuRenPlugin } from './types';

export const bifaPlugin: LiuRenPlugin = {
  id: 'bifa',
  title: '毕法赋',
  description: '《畢法賦》百法格局命中（《六壬大全》卷十一/十二，首批 23 法）',
  compute(chart) {
    const hits = detectBifa(chart);
    return hits.length ? hits : undefined;
  },
};
