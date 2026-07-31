import { describe, expect, it } from 'vitest';
import { decode } from '@toon-format/toon';
import { chartToToon } from '../toon';

describe('chartToToon', () => {
  it('往返无损，且剔除 extras.aiPrompt 与 undefined 字段', () => {
    const chart = {
      meta: { school: '通行体系', engineName: 'liuren-ts-lib' },
      gong: [
        { diZhi: '子', tianZhi: '寅', tianJiang: '贵人' },
        { diZhi: '丑', tianZhi: '卯', tianJiang: '螣蛇' },
      ],
      dateInfo: { bazi: '甲辰 丙子 庚午 庚辰', kongWang: ['戌', '亥'], yiMa: undefined },
      extras: { aiPrompt: '超长提示词', bifa: [{ no: 7, fu: '旺祿臨身徒妄作' }] },
    };
    const toon = chartToToon(chart);
    expect(toon).not.toContain('aiPrompt');
    expect(toon).not.toContain('超长提示词');
    // 无损等价：decode 结果 == JSON 规范化（剔 aiPrompt/undefined）后的对象
    const expected = JSON.parse(JSON.stringify(chart, (k, v) => (k === 'aiPrompt' ? undefined : v)));
    expect(decode(toon)).toEqual(expected);
  });

  it('均匀对象数组压成 tabular 表格（TOON 省 token 的关键形态）', () => {
    const toon = chartToToon({ gong: [{ a: 1, b: 2 }, { a: 3, b: 4 }] });
    expect(toon).toContain('gong[2]{a,b}:');
  });
});
