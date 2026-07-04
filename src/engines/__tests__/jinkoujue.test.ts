import { describe, expect, it } from 'vitest';
import {
  getGuiShen,
  getJiangShen,
  getJinKouJueByDate,
  getWangXiangXiuQiu,
  getWuShuDun,
  getYueLingWuXing,
} from '../jinkoujue';

describe('金口诀 · 五鼠遁', () => {
  it('甲己日子时起甲子', () => {
    expect(getWuShuDun('甲', '子')).toBe('甲');
    expect(getWuShuDun('己', '子')).toBe('甲');
  });
  it('乙庚日遁至午为壬午', () => {
    // 乙庚起丙子：丙子 丁丑 戊寅 己卯 庚辰 辛巳 壬午
    expect(getWuShuDun('乙', '午')).toBe('壬');
  });
  it('戊癸日遁至亥为癸亥', () => {
    expect(getWuShuDun('癸', '亥')).toBe('癸');
  });
});

describe('金口诀 · 将神（月将加时）', () => {
  it('地分即时支时，将神即月将', () => {
    expect(getJiangShen('亥', '午', '午')).toBe('亥');
  });
  it('未将加巳时，地分午得申（传送）', () => {
    // liuren-ts-lib@1.9 基线课例：2026-07-04 10:30
    expect(getJiangShen('未', '巳', '午')).toBe('申');
  });
  it('丑将加辰时，地分午得卯（太冲）', () => {
    // liuren-ts-lib@1.9 基线课例：2025-01-01 08:00
    expect(getJiangShen('丑', '辰', '午')).toBe('卯');
  });
});

describe('金口诀 · 贵神（基线验证课例）', () => {
  it('己日巳时（昼贵子，顺行）地分午 → 天空', () => {
    expect(getGuiShen('己', '巳', '午')).toBe('天空');
  });
  it('庚日辰时（昼贵丑，顺行）地分午 → 青龙', () => {
    expect(getGuiShen('庚', '辰', '午')).toBe('青龙');
  });
  it('夜时用阴贵：甲日子时（夜贵未，逆行）地分午 → 腾蛇', () => {
    // 未逆行一位至午 → 序 1 = 腾蛇
    expect(getGuiShen('甲', '子', '午')).toBe('腾蛇');
  });
});

describe('金口诀 · 旺相休囚死', () => {
  it('月令五行判断正确', () => {
    expect(getYueLingWuXing('寅')).toBe('木');
    expect(getYueLingWuXing('辰')).toBe('土');
  });
  it('春月（寅）：木旺、火相、水休、金囚、土死', () => {
    expect(getWangXiangXiuQiu('木', '寅')).toBe('旺');
    expect(getWangXiangXiuQiu('火', '寅')).toBe('相');
    expect(getWangXiangXiuQiu('水', '寅')).toBe('休');
    expect(getWangXiangXiuQiu('金', '寅')).toBe('囚');
    expect(getWangXiangXiuQiu('土', '寅')).toBe('死');
  });
});

describe('金口诀 · 端到端基线对齐（liuren-ts-lib@1.9 输出）', () => {
  it('2025-01-01 08:00 地分午：四位与 v1.9 完全一致', () => {
    const result = getJinKouJueByDate(new Date('2025-01-01T08:00:00'), '午');
    expect(result.date.bazi).toBe('甲辰 丙子 庚午 庚辰');
    expect(result.siWei.renYuan).toEqual({
      name: '壬', ganZhi: '壬', wuXing: '水', wangXiangXiuQiu: '旺',
    });
    expect(result.siWei.guiShen).toEqual({
      name: '青龙', ganZhi: '戊寅', wuXing: '木', wangXiangXiuQiu: '相',
    });
    expect(result.siWei.jiangShen).toEqual({
      name: '太冲', ganZhi: '己卯', wuXing: '木', wangXiangXiuQiu: '相',
    });
    expect(result.siWei.diFen).toEqual({
      name: '午', ganZhi: '午', wuXing: '火', wangXiangXiuQiu: '死',
    });
    // 神煞抽查（v1.9 基线含月德壬落人元、天马寅落贵神）
    expect(result.shenSha).toContainEqual({
      name: '月德', value: '壬', position: ['人元'], description: '主和睦，万事顺达', type: '吉',
    });
    expect(result.shenSha).toContainEqual({
      name: '天马', value: '寅', position: ['贵神'], description: '主办事迅速，逃亡远去不归', type: '吉',
    });
  });

  it('2026-07-04 10:30 地分午：贵神天空甲戌、将神传送壬申', () => {
    const result = getJinKouJueByDate(new Date('2026-07-04T10:30:00'), '午');
    expect(result.siWei.renYuan.name).toBe('庚');
    expect(result.siWei.guiShen.name).toBe('天空');
    expect(result.siWei.guiShen.ganZhi).toBe('甲戌');
    expect(result.siWei.jiangShen.name).toBe('传送');
    expect(result.siWei.jiangShen.ganZhi).toBe('壬申');
    expect(result.siWei.diFen.wangXiangXiuQiu).toBe('旺');
  });
});
