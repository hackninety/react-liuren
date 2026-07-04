import type { LiuRenChart } from '../engines/types';

/**
 * 大六壬扩展插件接口
 *
 * 插件是消费统一模型的纯函数：返回值挂载到 chart.extras[id]；
 * 需要宫位角标的插件可直接写入 chart.gong[i].extras。
 */
export interface LiuRenPlugin {
  id: string;
  /** 展示名（插件开关面板用） */
  title: string;
  description?: string;
  /**
   * 计算插件数据。chart 为引擎新产出的对象，允许原地补充 gong[].extras。
   * 返回 undefined 表示不向 chart.extras 写入顶层数据。
   */
  compute(chart: LiuRenChart, ctx?: PluginContext): unknown;
}

/** 插件计算上下文（如行年插件需要出生年与性别） */
export interface PluginContext {
  birthYear?: number;
  gender?: '男' | '女';
  /** 排盘时刻的公历年份（四柱直输时可能缺省） */
  chartYear?: number;
}
