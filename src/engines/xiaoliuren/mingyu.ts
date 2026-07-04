/**
 * mingyu-core 小六壬引擎适配器 —— 第二流派（小六壬金口诀掌诀体系）
 *
 * 上游以月/日/时三数逐宫顺数定三宫（起因→过程→结果），
 * 输出三宫叙事、五行生克关系、旺衰与应期。
 */
import { generateXiaoliuren } from 'mingyu-core/divination/xiaoliuren';
import type { XiaoliurenData, XiaoliurenPalaceDetail } from 'mingyu-core/types';
import type {
  XiaoLiuRenChart,
  XiaoLiuRenEngine,
  XiaoLiuRenMethod,
  XiaoLiuRenPalace,
} from '../types';

function toPalace(
  detail: XiaoliurenPalaceDetail,
  role: '起因' | '过程' | '结果',
  seasonState?: string,
): XiaoLiuRenPalace {
  return {
    gong: detail.name,
    branch: detail.direction ?? '',
    deity: detail.shenSha,
    star: detail.keywords?.[0],
    wuXing: detail.element,
    wangShuai: seasonState ?? detail.seasonProsper,
    isDayPalace: false,
    isHourPalace: role === '结果',
    sanGongRole: role,
  };
}

function toChart(data: XiaoliurenData, method: XiaoLiuRenMethod): XiaoLiuRenChart {
  const { sequence, seasonStates, wuxingRelations } = data;
  const palaces = [
    toPalace(sequence.start, '起因', seasonStates?.start),
    toPalace(sequence.process, '过程', seasonStates?.process),
    toPalace(sequence.result, '结果', seasonStates?.result),
  ];

  const summaryParts = [
    wuxingRelations?.description,
    data.questionHint,
    data.primary ? `结果宫「${data.primary.name}」：${data.primary.meaning}，${data.primary.advice}` : '',
    data.yingQi ? `应期：${data.yingQi}` : '',
  ].filter(Boolean);

  return {
    meta: {
      engineId: 'mingyu',
      engineName: 'mingyu-core',
      school: '掌诀三宫',
    },
    method,
    inputSummary: `${data.methodLabel} · 农历${data.lunarMonth}月${data.lunarDay}日 ${data.hourLabel}`,
    palaces,
    summary: summaryParts.join(' '),
    extras: {},
    raw: data,
  };
}

export const mingyuXiaoLiuRen: XiaoLiuRenEngine = {
  id: 'mingyu',
  name: 'mingyu-core',
  school: '掌诀三宫',
  byTime(date: Date): XiaoLiuRenChart {
    return toChart(generateXiaoliuren({ method: 'time', customDate: date }), 'time');
  },
  byNumber(num: number, date: Date): XiaoLiuRenChart {
    return toChart(generateXiaoliuren({ method: 'number', number: num, customDate: date }), 'number');
  },
};
