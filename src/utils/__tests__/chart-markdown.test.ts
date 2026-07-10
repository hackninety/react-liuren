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
      'dq-shensha': {
        month: '十一月',
        table: [
          { section: '十天干神煞', name: '日祿', value: '申', hit: true },
          { section: '歲神煞', name: '將軍', value: '卯', note: '占行人用', hit: false },
        ],
        gongYue: [
          { pos: '干上·末传', zhi: '申', ji: ['驛馬', '信神'], xiong: ['月破'] },
          { pos: '初传', zhi: '寅', ji: ['皇書'], xiong: [] },
        ],
      },
      kejing: [
        { name: '元首', book: '六壬大全', juan: 7, order: 1, text: '凡一上克下，餘課無克，為元首課，象天。' },
        { name: '元首', book: '六壬心鏡', juan: 1, order: 80, text: '一上克下為元首。' },
      ],
      leishen: [
        { kind: '月将', name: '大吉', zhi: '丑', brief: '所主田土、爭訟事。\n類為長者、僧道。' },
        { kind: '天将', name: '青龍', brief: '青龍甲寅木，吉将也。' },
      ],
      'sanchuan-compare': [
        { school: '通行体系', chu: '寅', zhong: '巳', mo: '申' },
        { school: '大全体系', chu: '卯', zhong: '午', mo: '酉' },
      ],
      'ying-qi': {
        candidates: [
          { zhi: '寅', reasons: ['初传寅值日', '冲末传申'] },
          { zhi: '亥', reasons: ['合初传寅', '旬空亥出空填实'] },
        ],
        notes: ['三传寅巳申刑全（示例注）'],
      },
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
    expect(md).toContain('## 毕法命中（《畢法賦》97/100 法检测）');
    expect(md).toContain('- 第7法 旺祿臨身徒妄作（确判）— 日祿寅臨干上');
    expect(md).toContain('- 第32法 三傳互克眾人欺（近似）— 初克中、中克末');
  });
  it('大全神煞段落（入课传 + 课传月煞 + 全表指引）', () => {
    expect(md).toContain('## 大全神煞（《六壬大全》卷一立成，月建十一月）');
    expect(md).toContain('- 入课传：日祿申（十天干神煞）');
    expect(md).toContain('- 干上·末传申：吉 驛馬 信神；凶 月破');
    expect(md).toContain('- 初传寅：吉 皇書');
    expect(md).toContain('全表 2 条见 JSON');
  });
  it('课体原文引段落（两书互证）', () => {
    expect(md).toContain('## 课体原文引（《六壬大全·課經》《六壬心鏡》）');
    expect(md).toContain('### 元首（《六壬大全》卷7）');
    expect(md).toContain('### 元首（《六壬心鏡》卷1）');
    expect(md).toContain('凡一上克下，餘課無克');
  });
  it('关系摘要段落（机器核算生克刑冲）', () => {
    // 庚午日：干上申金比和且为日禄/寄宫；支上寅木生午火；寅申冲刑；三传寅巳申
    expect(md).toContain('## 关系摘要（机器核算）');
    expect(md).toContain('- 干上申（金）与日干庚比和；申为日禄、干寄宫');
    expect(md).toContain('- 支上寅（木）生日支午（生我者）');
    expect(md).toContain('- 干上申与支上寅：相冲、相刑');
    expect(md).toContain('- 初传寅生中传巳（兼相刑、相害）');
    expect(md).toContain('- 中传巳克末传申（兼六合、相刑、相破）');
    expect(md).toContain('- 末传申（金）克所乘青龙（木）——内战');
    expect(md).toContain('- 旬空戌、亥未入课传');
  });
  it('类神段落（神將釋 brief）', () => {
    expect(md).toContain('## 类神（《六壬大全》卷二神將釋）');
    expect(md).toContain('### 大吉（月将·丑）');
    expect(md).toContain('所主田土、爭訟事。');
    expect(md).toContain('### 青龍（天将）');
  });
  it('多派三传对照段落（一致/有异标注 + 差异注）', () => {
    expect(md).toContain('## 多派三传对照');
    expect(md).toContain('- 本盘（占事略決古法）：寅 → 巳 → 申');
    expect(md).toContain('- 通行体系：寅 → 巳 → 申（与本盘一致）');
    expect(md).toContain('- 大全体系：卯 → 午 → 酉（与本盘有异）');
    expect(md).toContain('- 注：流派差异源于贵人起法、涉害深浅');
  });
  it('应期候选段落（候选支 + 来由 + 注）', () => {
    expect(md).toContain('## 应期候选（机器可算）');
    expect(md).toContain('- 寅：初传寅值日；冲末传申');
    expect(md).toContain('- 亥：合初传寅；旬空亥出空填实');
    expect(md).toContain('- 注：三传寅巳申刑全（示例注）');
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
