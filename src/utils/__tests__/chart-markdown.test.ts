import { describe, expect, it } from 'vitest';
import { chartToMarkdown } from '../chart-markdown';
import { DI_ZHI, type JinKouJueChart, type LiuRenChart, type XiaoLiuRenChart } from '@/engines/types';

/**
 * 金标（golden）测试：用固定 fixture 锁定 chartToMarkdown 对三种盘形的
 * Markdown 输出格式（标题、表头、行结构、古法段落）。
 * 与算法引擎解耦——只要盘形/字段不变，MD 版式即被锁定；一旦格式被意外
 * 改动，断言立即失败。
 */

function makeLiuRen(): LiuRenChart {
  return {
    meta: { engineId: 'zslj', engineName: 'zslj-ts-lib', school: '占事略決古法' },
    dateInfo: {
      bazi: '甲辰 丙子 庚午 庚辰',
      ganZhiDate: '2025年1月1日 8时',
      yueJiang: '丑',
      xun: '甲子',
      kongWang: ['戌', '亥'],
      yiMa: '申',
      dayNight: '昼',
    },
    gong: DI_ZHI.map((z, i) => ({
      diZhi: z,
      tianZhi: DI_ZHI[(i + 2) % 12],
      tianJiang: '天一',
      dunGan: i % 2 === 0 ? '甲' : undefined,
      extras: { changSheng: '长生', wangShuai: '旺' },
    })),
    siKe: [
      { name: '一課', shang: '申', xia: '庚', tianJiang: '白虎' },
      { name: '二課', shang: '午', xia: '申', tianJiang: '青龍' },
      { name: '三課', shang: '寅', xia: '午', tianJiang: '天后' },
      { name: '四課', shang: '子', xia: '寅', tianJiang: '天一' },
    ],
    sanChuan: {
      chu: { zhi: '寅', tianJiang: '天后', liuQin: '妻財', dunGan: '戊' },
      zhong: { zhi: '巳', tianJiang: '大裳', liuQin: '官鬼' },
      mo: { zhi: '申', tianJiang: '青龍' },
      keTi: '遙剋',
      method: '遙剋',
    },
    shenSha: [{ name: '驿马', value: '申', description: '主走动' }],
    extras: {
      'keti-detail': { keName: '庚午日第一局 干上申', ju: 1, subTypes: ['退茹'] },
      gua36: [{ name: '蒿矢卦', certainty: 'exact', why: '遥克' }],
      path: [{ fa: '遙剋', note: '日遥克神', ref: 'senji02' }],
      refs: ['senji02', 'senji26'],
      bifa: [
        { no: 7, name: '旺祿臨身', fu: '旺祿臨身徒妄作', certainty: 'exact', why: '日祿寅臨干上' },
        { no: 32, name: '三傳互克', fu: '三傳互克眾人欺', certainty: 'approx', why: '初克中、中克末' },
      ],
    },
    raw: null,
  };
}

describe('chartToMarkdown · 大六壬（含古法 extras）', () => {
  const md = chartToMarkdown(makeLiuRen());

  it('含标题与流派', () => {
    expect(md).toContain('# 大六壬排盘 · 占事略決古法（zslj-ts-lib）');
  });
  it('基础信息完整（四柱/月将/旬空/驿马/昼夜）', () => {
    expect(md).toContain('- 四柱：甲辰 丙子 庚午 庚辰');
    expect(md).toContain('月将 丑');
    expect(md).toContain('旬空 戌 亥');
    expect(md).toContain('驿马 申');
    expect(md).toContain('昼占');
  });
  it('天地盘为 12 行表，表头随插件扩展', () => {
    expect(md).toContain('| 地盘 | 天盘 | 天将 | 遁干 | 长生 | 旺衰 |');
    // 12 支各一行
    for (const z of DI_ZHI) expect(md).toMatch(new RegExp(`\\| ${z} \\|`));
  });
  it('四课表与三传（含课名/课体细分/六亲遁干）', () => {
    expect(md).toContain('| 一課 | 申 | 庚 | 白虎 |');
    expect(md).toContain('- 课体：遙剋');
    expect(md).toContain('- 课名：庚午日第一局 干上申');
    expect(md).toContain('- 课体细分：退茹');
    expect(md).toContain('- 初传：寅 天后 妻財 遁戊');
  });
  it('古法段落：卅六卦 + 判定路径 + 原文锚点', () => {
    expect(md).toContain('## 古法（占事略決）');
    expect(md).toContain('- 卅六卦：蒿矢卦');
    expect(md).toContain('1. 遙剋 — 日遥克神（senji02）');
    expect(md).toContain('- 原文锚点：senji02、senji26');
  });
  it('毕法命中段落', () => {
    expect(md).toContain('## 毕法命中（《畢法賦》首批检测 23/100）');
    expect(md).toContain('- 第7法 旺祿臨身徒妄作（确判）— 日祿寅臨干上');
    expect(md).toContain('- 第32法 三傳互克眾人欺（近似）— 初克中、中克末');
  });
});

describe('chartToMarkdown · 金口诀', () => {
  const chart: JinKouJueChart = {
    date: { bazi: '丙午 甲午 庚辰 辛巳' },
    diFen: '午',
    siWei: {
      renYuan: { name: '壬', ganZhi: '壬', wuXing: '水', wangXiangXiuQiu: '囚' },
      guiShen: { name: '青龙', ganZhi: '戊寅', wuXing: '木', wangXiangXiuQiu: '休' },
      jiangShen: { name: '传送', ganZhi: '甲申', wuXing: '金', wangXiangXiuQiu: '死' },
      diFen: { name: '午', ganZhi: '午', wuXing: '火', wangXiangXiuQiu: '旺' },
    },
    shenSha: [
      { name: '天喜', value: '寅', position: ['贵神'], description: '主喜庆', type: '吉' },
    ],
  };
  const md = chartToMarkdown(chart);

  it('四位表与神煞落位格式', () => {
    expect(md).toContain('# 金口诀排盘');
    expect(md).toContain('- 地分：午');
    expect(md).toContain('| 人元（干） | 壬 | 壬 | 水 | 囚 |');
    expect(md).toContain('| 将神（将） | 传送 | 甲申 | 金 | 死 |');
    expect(md).toContain('- [吉] 天喜（寅） 落贵神 — 主喜庆');
  });
});

describe('chartToMarkdown · 小六壬', () => {
  const chart: XiaoLiuRenChart = {
    meta: { engineId: 'lookfate', engineName: 'xiaoliuren-ts-lib', school: '马前课' },
    method: 'time',
    inputSummary: '农历5月21日 巳时',
    palaces: [
      { gong: '大安', branch: '未', kin: '子孙', deity: '腾蛇', star: '木星', isDayPalace: true, isHourPalace: false },
      { gong: '空亡', branch: '巳', kin: '自身', deity: '朱雀', star: '天空', isDayPalace: false, isHourPalace: true },
    ],
    extras: {},
    raw: null,
  };
  const md = chartToMarkdown(chart);

  it('六宫表与日/时宫标记', () => {
    expect(md).toContain('# 小六壬排盘 · 马前课（xiaoliuren-ts-lib）');
    expect(md).toContain('- 起课：农历5月21日 巳时');
    expect(md).toContain('| 大安 | 未 | 子孙 | 腾蛇 | 木星 | — | 日 |');
    expect(md).toContain('| 空亡 | 巳 | 自身 | 朱雀 | 天空 | — | 时 |');
  });
});

describe('chartToMarkdown · 兜底', () => {
  it('未知形状回退 JSON 代码块并剔除 aiPrompt', () => {
    const md = chartToMarkdown({ foo: 1, extras: { aiPrompt: 'X' } });
    expect(md).toContain('```json');
    expect(md).not.toContain('aiPrompt');
  });
});
