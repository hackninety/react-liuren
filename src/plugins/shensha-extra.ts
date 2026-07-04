/**
 * 神煞补充插件（日支系）
 *
 * 补充 liuren-ts-lib 神煞表未覆盖的常用日支系神煞：
 * 桃花（咸池）、劫煞、华盖，并入 chart.shenSha 列表。
 * （游都/鲁都占盗神煞待与古籍核对后加入。）
 */
import type { LiuRenPlugin } from './types';
import type { ShenShaEntry } from '../engines/types';
import { TAO_HUA } from '../engines/jinkoujue/maps';

/** 劫煞：申子辰在巳，亥卯未在申，寅午戌在亥，巳酉丑在寅 */
const JIE_SHA: Record<string, string> = {
  申: '巳', 子: '巳', 辰: '巳',
  亥: '申', 卯: '申', 未: '申',
  寅: '亥', 午: '亥', 戌: '亥',
  巳: '寅', 酉: '寅', 丑: '寅',
};

/** 华盖：寅午戌在戌，申子辰在辰，巳酉丑在丑，亥卯未在未 */
const HUA_GAI: Record<string, string> = {
  寅: '戌', 午: '戌', 戌: '戌',
  申: '辰', 子: '辰', 辰: '辰',
  巳: '丑', 酉: '丑', 丑: '丑',
  亥: '未', 卯: '未', 未: '未',
};

export const shenShaExtraPlugin: LiuRenPlugin = {
  id: 'shensha-extra',
  title: '神煞补充',
  description: '补充桃花（咸池）、劫煞、华盖等日支系神煞',
  compute(chart) {
    const riZhi = (chart.dateInfo.bazi.split(' ')[2] ?? '').charAt(1);
    if (!riZhi) return undefined;

    const extra: ShenShaEntry[] = [];
    const push = (name: string, value: string | undefined, description: string) => {
      if (!value) return;
      if (chart.shenSha.some((s) => s.name === name)) return;
      extra.push({ name, value, description });
    };

    push('桃花', TAO_HUA[riZhi], '咸池桃花，主情缘酒色、纠缠之事');
    push('劫煞', JIE_SHA[riZhi], '主劫夺盗失、伤灾横事');
    push('华盖', HUA_GAI[riZhi], '主孤高艺术、僧道玄学');

    if (extra.length === 0) return undefined;
    chart.shenSha.push(...extra);
    return extra;
  },
};
