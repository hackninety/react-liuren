import { describe, expect, it } from 'vitest';
import { getDocMarkdown } from 'lrdq-ts-lib/docs';
import { findSimilarCases, getZhanLi } from 'lrdq-ts-lib/cases';
import { ZHANSHI_TOPICS, sliceDocSection, zhanShiCaseChapters } from '../zhanshi-topics';

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

  it('占事章名与占例库对齐：每个定向占事均能检索到相似占例', () => {
    const corpus = new Set(getZhanLi().map((e) => e.chapter));
    for (const t of ZHANSHI_TOPICS) {
      if (t.id === 'general') continue;
      // caseChapters 必须是占例库真实章名（防错字/底本改动漂移）
      for (const ch of t.caseChapters ?? []) {
        expect(corpus.has(ch), `${t.label}: caseChapters「${ch}」不在占例库`).toBe(true);
      }
      const hits = findSimilarCases({ chapters: zhanShiCaseChapters(t), limit: 1 });
      expect(hits.length, `${t.label} 检索不到任何占例`).toBeGreaterThan(0);
      expect(hits[0].why.join('')).toContain('同章');
    }
  });
});
