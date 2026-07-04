/**
 * zslj-ts-lib（占事略決古法）引擎适配器 —— 第三流派
 *
 * 安倍晴明《占事略決》（约 983 年）六壬式占忠实古法：
 * 涉害只论孟深仲半季浅、贵人旦暮以寅~酉为界、課用九法（无别责）、
 * 伏吟刑冲取传、课体用卅六卦。与通行体系（明清《六壬大全》系）的
 * 三传分歧属古今流派差异，勿以通行规则"修正"。
 *
 * 库的 toGenericChart 已输出统一模型形状，此处仅做字面量类型收窄、
 * 宫位角标键名适配（marks→mark）与 AI 提示词挂载。
 */
import { buildClipboardPrompt, castByDate, castBySiZhu, toGenericChart } from 'zslj-ts-lib';
import type { ZsljChart } from 'zslj-ts-lib';
import { DI_ZHI, type DaLiuRenEngine, type LiuRenChart } from '../types';

/** AI 导出默认占问（App 暂无占事输入框，用中性问句） */
const DEFAULT_QUESTION = '请依《占事略決》经文综合断此课';

function toChart(zslj: ZsljChart): LiuRenChart {
  const g = toGenericChart(zslj);
  return {
    meta: { engineId: 'zslj', engineName: 'zslj-ts-lib', school: '占事略決古法' },
    dateInfo: {
      bazi: g.dateInfo.bazi,
      ganZhiDate: g.dateInfo.ganZhiDate,
      yueJiang: g.dateInfo.yueJiang,
      xun: g.dateInfo.xun,
      kongWang: g.dateInfo.kongWang,
      dayNight: g.dateInfo.dayNight,
    },
    gong: DI_ZHI.map((diZhi, i) => ({
      diZhi,
      tianZhi: g.gong[i]?.tianZhi ?? '',
      tianJiang: g.gong[i]?.tianJiang ?? '',
      dunGan: g.gong[i]?.dunGan,
      // 库输出键为 marks（旬空/日辰标记），GongCell 角标读 mark
      extras: g.gong[i]?.extras?.marks ? { mark: g.gong[i].extras.marks } : undefined,
    })),
    siKe: g.siKe.map((k) => ({ name: k.name, shang: k.shang, xia: k.xia, tianJiang: k.tianJiang })),
    sanChuan: {
      chu: g.sanChuan.chu,
      zhong: g.sanChuan.zhong,
      mo: g.sanChuan.mo,
      keTi: g.sanChuan.keTi,
      method: g.sanChuan.method,
    },
    shenSha: g.shenSha,
    extras: {
      ...g.extras, // gua36 卅六卦命中 / path 課用九法判定路径 / zhanduan 占断助手 / refs 原文锚点
      aiPrompt: safePrompt(zslj),
    },
    raw: zslj,
  };
}

/** 提示词构建失败不应中断排盘（降级为空，JsonExportPanel 会回退通用提示词） */
function safePrompt(zslj: ZsljChart): string | undefined {
  try {
    return buildClipboardPrompt(zslj, DEFAULT_QUESTION);
  } catch (error) {
    console.warn('占事略決 AI 提示词构建失败:', error);
    return undefined;
  }
}

export const zsljDaLiuRen: DaLiuRenEngine = {
  id: 'zslj',
  name: 'zslj-ts-lib',
  school: '占事略決古法',
  capabilities: {
    siZhu: true,
    shenSha: 'summary',
    yinYangGuiRen: false, // 原书为单贵人体系（天一治法）
    dunGan: true,         // 仅旬遁干；无建除/初建/伏建（书中无此法）
  },
  byDate: (date) => toChart(castByDate(date)),
  bySiZhu: (year, month, day, hour) => toChart(castBySiZhu(year, month, day, hour)),
};
