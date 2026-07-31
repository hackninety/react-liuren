// TOON（Token-Oriented Object Notation）导出：JSON 数据模型的紧凑无损等价表示，
// 对 LLM 更省 token（tabular 结构对 tokenizer 更友好）。口径同 react-8char。
// 官方库 https://github.com/toon-format/toon
import { encode } from '@toon-format/toon';

/** 剔除 extras.aiPrompt（长提示词，已有专用按钮，避免污染数据文件）——沿用旧 JSON 导出口径 */
const replacer = (key: string, value: unknown) => (key === 'aiPrompt' ? undefined : value);

/**
 * 盘面 → TOON。先做一次 JSON 规范化（剔除 undefined 等 JSON 不可表示值与 aiPrompt），
 * 保证 decode(chartToToon(x)) 与 JSON.parse(JSON.stringify(x, replacer)) 完全一致（往返无损）。
 */
export function chartToToon(data: unknown): string {
  return encode(JSON.parse(JSON.stringify(data, replacer)));
}
