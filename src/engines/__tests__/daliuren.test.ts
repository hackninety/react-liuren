import { describe, expect, it } from 'vitest';
import { lookfateDaLiuRen } from '../daliuren/lookfate';
import { mingyuDaLiuRen } from '../daliuren/mingyu';
import { listDaLiuRenEngines, listXiaoLiuRenEngines } from '../registry';
import { DI_ZHI } from '../types';

describe('lookfate 引擎（liuren-ts-lib@3 适配）', () => {
  it('日期起课：统一模型结构完整（v1.9 基线课例 2025-01-01 08:00）', () => {
    const chart = lookfateDaLiuRen.byDate(new Date('2025-01-01T08:00:00'));
    expect(chart.dateInfo.bazi).toBe('甲辰 丙子 庚午 庚辰');
    expect(chart.gong).toHaveLength(12);
    expect(chart.gong.every((g, i) => g.diZhi === DI_ZHI[i])).toBe(true);
    expect(chart.gong.every((g) => g.tianZhi && g.tianJiang)).toBe(true);
    expect(chart.siKe).toHaveLength(4);
    expect(chart.siKe[0].shang).toBeTruthy();
    // v1.9 基线：该时刻课体为元首
    expect(chart.sanChuan.keTi).toBe('元首');
    expect(chart.shenSha.length).toBeGreaterThan(0);
    expect(chart.yinYangGuiRen?.yang['子']).toBeTruthy();
  });

  it('四柱直输：反推日期后排盘（上游 getLiuRenBySiZhu 缺陷的本地修复）', () => {
    const chart = lookfateDaLiuRen.bySiZhu!('甲辰', '丙子', '庚午', '庚辰');
    expect(chart.dateInfo.bazi).toBe('甲辰 丙子 庚午 庚辰');
    expect(chart.sanChuan.chu.zhi).toBeTruthy();
    expect(chart.sanChuan.keTi).toBeTruthy();
  });

  it('无效四柱（时柱与日干五鼠遁不匹配）应报错', () => {
    // 戊辰日五鼠遁午时为戊午，庚午时不成立
    expect(() => lookfateDaLiuRen.bySiZhu!('甲子', '丙寅', '戊辰', '庚午')).toThrow();
  });
});

describe('mingyu 引擎（mingyu-core 适配）', () => {
  it('日期起课：统一模型结构完整', () => {
    const chart = mingyuDaLiuRen.byDate(new Date('2025-01-01T08:00:00'));
    expect(chart.meta.engineId).toBe('mingyu');
    expect(chart.dateInfo.bazi.split(' ')).toHaveLength(4);
    expect(chart.gong).toHaveLength(12);
    expect(chart.gong.every((g) => g.tianZhi)).toBe(true);
    expect(chart.siKe).toHaveLength(4);
    expect(chart.siKe.every((ke) => ke.shang)).toBe(true);
    expect((DI_ZHI as readonly string[]).includes(chart.sanChuan.chu.zhi)).toBe(true);
    expect(chart.sanChuan.zhong.zhi).toBeTruthy();
    expect(chart.sanChuan.mo.zhi).toBeTruthy();
  });

  it('与 lookfate 引擎四柱一致（同一时刻）', () => {
    const date = new Date('2026-07-04T10:30:00');
    const a = lookfateDaLiuRen.byDate(date);
    const b = mingyuDaLiuRen.byDate(date);
    expect(b.dateInfo.bazi).toBe(a.dateInfo.bazi);
  });
});

describe('引擎注册表', () => {
  it('大六壬双引擎、小六壬双引擎', () => {
    expect(listDaLiuRenEngines().map((e) => e.id)).toEqual(['lookfate', 'mingyu']);
    expect(listXiaoLiuRenEngines().map((e) => e.id)).toEqual(['lookfate', 'mingyu']);
  });
});
