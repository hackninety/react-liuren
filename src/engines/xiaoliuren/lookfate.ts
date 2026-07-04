/**
 * xiaoliuren-ts-lib（coaixy / look-fate 生态）小六壬引擎适配器
 *
 * 上游 API：XiaoLiuRen.fromTime(农历月, 农历日, 时支) / fromNumber(数字, 时支)
 * 农历换算复用项目已有依赖 lunar-javascript。
 */
import { XiaoLiuRen, DiZhi as XlrDiZhi } from 'xiaoliuren-ts-lib';
import { Solar } from 'lunar-javascript';
import type {
  XiaoLiuRenChart,
  XiaoLiuRenEngine,
  XiaoLiuRenMethod,
  XiaoLiuRenPalace,
} from '../types';

interface UpstreamPalace {
  gong: string;
  branch: string;
  kin: string;
  deity: string;
  star: string;
  isDayPalace: boolean;
  isHourPalace: boolean;
}

interface LunarInfo {
  month: number;
  day: number;
  hourZhi: string;
}

function getLunarInfo(date: Date): LunarInfo {
  const lunar = Solar.fromDate(date).getLunar();
  return {
    // lunar-javascript 闰月返回负数，小六壬起课按当月数计
    month: Math.abs(lunar.getMonth()),
    day: lunar.getDay(),
    hourZhi: lunar.getTimeZhi(),
  };
}

function toChart(
  palaces: UpstreamPalace[],
  method: XiaoLiuRenMethod,
  inputSummary: string,
  raw: unknown,
): XiaoLiuRenChart {
  const mapped: XiaoLiuRenPalace[] = palaces.map((p) => ({
    gong: String(p.gong),
    branch: String(p.branch),
    kin: String(p.kin),
    deity: String(p.deity),
    star: String(p.star),
    isDayPalace: p.isDayPalace,
    isHourPalace: p.isHourPalace,
  }));
  return {
    meta: {
      engineId: 'lookfate',
      engineName: 'xiaoliuren-ts-lib',
      school: '马前课',
    },
    method,
    inputSummary,
    palaces: mapped,
    extras: {},
    raw,
  };
}

export const lookfateXiaoLiuRen: XiaoLiuRenEngine = {
  id: 'lookfate',
  name: 'xiaoliuren-ts-lib',
  school: '马前课',
  byTime(date: Date): XiaoLiuRenChart {
    const { month, day, hourZhi } = getLunarInfo(date);
    const result = XiaoLiuRen.fromTime(month, day, hourZhi as XlrDiZhi);
    return toChart(
      result.palaces as UpstreamPalace[],
      'time',
      `农历${month}月${day}日 ${hourZhi}时`,
      result,
    );
  },
  byNumber(num: number, date: Date): XiaoLiuRenChart {
    const { hourZhi } = getLunarInfo(date);
    const result = XiaoLiuRen.fromNumber(num, hourZhi as XlrDiZhi);
    return toChart(
      result.palaces as UpstreamPalace[],
      'number',
      `数字 ${num} · ${hourZhi}时`,
      result,
    );
  },
};
