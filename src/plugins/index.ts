/**
 * 插件注册与应用
 *
 * 新增插件：在 plugins/ 下实现 LiuRenPlugin，import 后加入 PLUGINS 数组。
 * UI 通过 localStorage 记忆启用状态（见 getEnabledPluginIds / setPluginEnabled）。
 */
import type { LiuRenChart } from '../engines/types';
import type { LiuRenPlugin, PluginContext } from './types';
import { ketiDetailPlugin } from './keti-detail';
import { changShengPlugin } from './chang-sheng';
import { wangShuaiPlugin } from './wang-shuai';
import { shenShaExtraPlugin } from './shensha-extra';
import { dqShenShaPlugin } from './dq-shensha';
import { xingNianPlugin } from './xingnian';
import { bifaPlugin } from './bifa';

export const PLUGINS: LiuRenPlugin[] = [
  ketiDetailPlugin,
  changShengPlugin,
  wangShuaiPlugin,
  shenShaExtraPlugin,
  dqShenShaPlugin,
  xingNianPlugin,
  bifaPlugin,
];

const STORAGE_KEY = 'liuren-disabled-plugins';

function readDisabled(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function getEnabledPluginIds(): string[] {
  const disabled = readDisabled();
  return PLUGINS.filter((p) => !disabled.has(p.id)).map((p) => p.id);
}

export function setPluginEnabled(id: string, enabled: boolean): void {
  const disabled = readDisabled();
  if (enabled) disabled.delete(id);
  else disabled.add(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...disabled]));
  } catch {
    // localStorage 不可用时静默降级为全开
  }
}

/** 按启用列表依次应用插件；单个插件失败不影响其他插件与排盘本身 */
export function applyPlugins(
  chart: LiuRenChart,
  ctx?: PluginContext,
  enabledIds: string[] = getEnabledPluginIds(),
): LiuRenChart {
  for (const plugin of PLUGINS) {
    if (!enabledIds.includes(plugin.id)) continue;
    try {
      const out = plugin.compute(chart, ctx);
      if (out !== undefined) chart.extras[plugin.id] = out;
    } catch (error) {
      console.error(`插件 ${plugin.id} 计算失败:`, error);
    }
  }
  return chart;
}
