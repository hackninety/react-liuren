/**
 * 五行旺衰插件
 *
 * 按月令判各宫天盘神的旺相休囚死（同令旺、令生相、生令休、克令囚、令克死），
 * 写入 gong[i].extras.wangShuai 供天地盘角标展示。
 */
import type { LiuRenPlugin } from './types';
import { getWangXiangXiuQiu } from '../engines/jinkoujue';
import { ZHI_WU_XING } from '../engines/jinkoujue/maps';

export const wangShuaiPlugin: LiuRenPlugin = {
  id: 'wang-shuai',
  title: '五行旺衰',
  description: '按月令标注各宫天盘神的旺相休囚死',
  compute(chart) {
    const monthZhi = (chart.dateInfo.bazi.split(' ')[1] ?? '').charAt(1);
    if (!monthZhi) return undefined;
    const map: Record<string, string> = {};
    chart.gong.forEach((g) => {
      const wuXing = ZHI_WU_XING[g.tianZhi];
      if (!wuXing) return;
      const state = getWangXiangXiuQiu(wuXing, monthZhi);
      if (!state) return;
      g.extras = { ...g.extras, wangShuai: state };
      map[g.diZhi] = state;
    });
    return { monthZhi, map };
  },
};
