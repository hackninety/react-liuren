/**
 * 引擎注册表 —— 流派切换的唯一入口
 *
 * 新增流派引擎的步骤：
 * 1. 在 engines/daliuren/（或 xiaoliuren/）下实现适配器，输出统一模型
 * 2. 在本文件 import 并加入对应数组
 */
import type {
  DaLiuRenEngine,
  DaLiuRenEngineId,
  XiaoLiuRenEngine,
  XiaoLiuRenEngineId,
} from './types';
import { lookfateDaLiuRen } from './daliuren/lookfate';
import { mingyuDaLiuRen } from './daliuren/mingyu';
import { lookfateXiaoLiuRen } from './xiaoliuren/lookfate';
import { mingyuXiaoLiuRen } from './xiaoliuren/mingyu';

// ---------- 大六壬 ----------

const daLiuRenEngines: DaLiuRenEngine[] = [lookfateDaLiuRen, mingyuDaLiuRen];

export const DEFAULT_DALIUREN_ENGINE_ID: DaLiuRenEngineId = 'lookfate';

export function listDaLiuRenEngines(): DaLiuRenEngine[] {
  return daLiuRenEngines;
}

export function getDaLiuRenEngine(id: DaLiuRenEngineId): DaLiuRenEngine {
  return daLiuRenEngines.find((e) => e.id === id) ?? daLiuRenEngines[0];
}

export function registerDaLiuRenEngine(engine: DaLiuRenEngine): void {
  if (!daLiuRenEngines.some((e) => e.id === engine.id)) {
    daLiuRenEngines.push(engine);
  }
}

// ---------- 小六壬 ----------

const xiaoLiuRenEngines: XiaoLiuRenEngine[] = [lookfateXiaoLiuRen, mingyuXiaoLiuRen];

export const DEFAULT_XIAOLIUREN_ENGINE_ID: XiaoLiuRenEngineId = 'lookfate';

export function listXiaoLiuRenEngines(): XiaoLiuRenEngine[] {
  return xiaoLiuRenEngines;
}

export function getXiaoLiuRenEngine(id: XiaoLiuRenEngineId): XiaoLiuRenEngine {
  const engine = xiaoLiuRenEngines.find((e) => e.id === id) ?? xiaoLiuRenEngines[0];
  if (!engine) throw new Error('没有可用的小六壬引擎');
  return engine;
}

export function registerXiaoLiuRenEngine(engine: XiaoLiuRenEngine): void {
  if (!xiaoLiuRenEngines.some((e) => e.id === engine.id)) {
    xiaoLiuRenEngines.push(engine);
  }
}
