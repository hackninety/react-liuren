import { describe, expect, it } from 'vitest';
import { getChangSheng } from '../chang-sheng';
import { classifySubTypes, ketiDetailPlugin } from '../keti-detail';
import { xingNianGanZhi, yearGanZhi } from '../xingnian';
import type { LiuRenChart } from '../../engines/types';

describe('十二长生', () => {
  it('甲木长生在亥，帝旺在卯（阳干顺行）', () => {
    expect(getChangSheng('甲', '亥')).toBe('长生');
    expect(getChangSheng('甲', '卯')).toBe('帝旺');
  });
  it('乙木长生在午，帝旺在寅（阴干逆行）', () => {
    expect(getChangSheng('乙', '午')).toBe('长生');
    expect(getChangSheng('乙', '寅')).toBe('帝旺');
  });
});

describe('课体细分', () => {
  it('进茹：三传顺连（亥子丑）', () => {
    expect(classifySubTypes('亥', '子', '丑')).toContain('进茹');
  });
  it('退茹：三传逆连（丑子亥）', () => {
    expect(classifySubTypes('丑', '子', '亥')).toContain('退茹');
  });
  it('润下：三传全水（申子辰 → 非全水不成局）', () => {
    expect(classifySubTypes('亥', '子', '亥').join()).toContain('润下');
  });
  it('三传俱阳', () => {
    expect(classifySubTypes('子', '寅', '辰')).toContain('三传俱阳');
  });
});

function fakeChart(bazi: string, ganShang: string): LiuRenChart {
  return {
    meta: { engineId: 'lookfate', engineName: 'test', school: 'test' },
    dateInfo: { bazi, yueJiang: '', kongWang: [] },
    gong: [],
    siKe: [
      { name: '一课', shang: ganShang, xia: '', tianJiang: '' },
      { name: '二课', shang: '', xia: '', tianJiang: '' },
      { name: '三课', shang: '', xia: '', tianJiang: '' },
      { name: '四课', shang: '', xia: '', tianJiang: '' },
    ],
    sanChuan: {
      chu: { zhi: '', tianJiang: '' },
      zhong: { zhi: '', tianJiang: '' },
      mo: { zhi: '', tianJiang: '' },
      keTi: '',
    },
    shenSha: [],
    extras: {},
    raw: null,
  };
}

describe('课名（局数）', () => {
  it('伏吟为第一局（干上神 = 日干寄宫）', () => {
    // 甲寄寅：干上寅 → 第一局
    const result = ketiDetailPlugin.compute(fakeChart('丙午 辛卯 甲子 辛未', '寅')) as { ju: number };
    expect(result.ju).toBe(1);
  });
  it('返吟为第七局（干上神与寄宫对冲）', () => {
    // 甲寄寅：干上申 → 第七局
    const result = ketiDetailPlugin.compute(fakeChart('丙午 辛卯 甲子 辛未', '申')) as { ju: number };
    expect(result.ju).toBe(7);
  });
  it('戊子日干上申为第十局（taibu-core 验证课例）', () => {
    // 戊寄巳：干上申 → 第十局
    const result = ketiDetailPlugin.compute(fakeChart('丙午 辛卯 戊子 辛酉', '申')) as { ju: number; keName: string };
    expect(result.ju).toBe(10);
    expect(result.keName).toBe('戊子日第十局 干上申');
  });
});

describe('本命 · 行年', () => {
  it('1984 年为甲子', () => {
    expect(yearGanZhi(1984)).toBe('甲子');
  });
  it('1990 年为庚午', () => {
    expect(yearGanZhi(1990)).toBe('庚午');
  });
  it('男一岁丙寅顺行：三岁为戊辰', () => {
    expect(xingNianGanZhi(1, '男')).toBe('丙寅');
    expect(xingNianGanZhi(3, '男')).toBe('戊辰');
  });
  it('女一岁壬申逆行：三岁为庚午', () => {
    expect(xingNianGanZhi(1, '女')).toBe('壬申');
    expect(xingNianGanZhi(3, '女')).toBe('庚午');
  });
});
