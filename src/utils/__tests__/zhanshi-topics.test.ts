import { describe, expect, it } from 'vitest';
import { getDocMarkdown } from 'lrdq-ts-lib/docs';
import { ZHANSHI_TOPICS, sliceDocSection } from '../zhanshi-topics';

/** 占事索引同步守卫：每个 ref 的节题必须能在生成文档中切出非空正文 */
describe('占事定向索引', () => {
  it('全部占事 ref 节题与典籍文档对齐', async () => {
    for (const t of ZHANSHI_TOPICS) {
      for (const r of t.refs) {
        const md = await getDocMarkdown(r.path);
        expect(md, `${t.label}: ${r.path}`).toBeTruthy();
        const slice = sliceDocSection(md!, r.section);
        expect(slice.length, `${t.label}: ${r.path}#${r.section}`).toBeGreaterThan(60);
      }
    }
  });

  it('sliceDocSection 切至下一节前', () => {
    const md = '# 书\n\n## 甲节\n\n正文A\n\n## 乙节\n\n正文B';
    expect(sliceDocSection(md, '甲节')).toBe('## 甲节\n\n正文A');
    expect(sliceDocSection(md, '不存在')).toBe('');
  });
});
