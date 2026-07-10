/**
 * 占事定向 —— 占事类别 → 典籍断法章节索引
 *
 * refs 指向 lrdq-ts-lib/docs 的文档路径与节题（《六壬指南注解》卷三占验诸章、
 * 《六壬心鏡》占法诸門），AI Prompt 生成时按节切片附文。
 * 节题须与生成文档的 `## ` 标题逐字一致（有金标测试兜底）。
 */

export interface ZhanShiRef {
  /** lrdq-ts-lib/docs 文档路径 */
  path: string;
  /** 文档内 `## ` 节题（缺省附整篇，勿用于长篇） */
  section: string;
}

export interface ZhanShiTopic {
  id: string;
  label: string;
  refs: ZhanShiRef[];
}

const ZN3 = 'lrzn/book/juan03.md';
const XJ5 = 'lrxj/book/juan05.md';
const XJ6 = 'lrxj/book/juan06.md';
const XJ7 = 'lrxj/book/juan07.md';
const XJ8 = 'lrxj/book/juan08.md';

export const ZHANSHI_TOPICS: ZhanShiTopic[] = [
  { id: 'general', label: '通用（不定向）', refs: [] },
  {
    id: 'hunyin', label: '婚姻',
    refs: [{ path: ZN3, section: '婚姻章第七' }, { path: XJ5, section: '婚姻門' }],
  },
  {
    id: 'yunchan', label: '孕产',
    refs: [{ path: ZN3, section: '孕產章第八' }, { path: XJ5, section: '產育門' }],
  },
  {
    id: 'jibing', label: '疾病',
    refs: [{ path: ZN3, section: '疾病章第九' }, { path: XJ7, section: '疾病門' }],
  },
  {
    id: 'shihuan', label: '仕宦/选举',
    refs: [{ path: ZN3, section: '仕宦章第十五' }, { path: ZN3, section: '選舉章第十三' }, { path: XJ6, section: '官職門' }],
  },
  {
    id: 'qiucai', label: '求财/交易',
    refs: [{ path: ZN3, section: '求財章第十六' }, { path: ZN3, section: '買賣章第十七' }, { path: XJ6, section: '商賈門' }],
  },
  {
    id: 'susong', label: '词讼',
    refs: [{ path: ZN3, section: '占訟章第十八' }, { path: XJ6, section: '官訟門' }],
  },
  {
    id: 'xingren', label: '行人',
    refs: [{ path: ZN3, section: '行人章第十一' }, { path: XJ7, section: '行人門' }],
  },
  {
    id: 'chuxing', label: '出行',
    refs: [{ path: ZN3, section: '出行章第十' }],
  },
  {
    id: 'zeidao', label: '贼盗/逃亡',
    refs: [{ path: ZN3, section: '賊盜章第二十一' }, { path: ZN3, section: '逃亡章第二十' }, { path: XJ6, section: '亡盜門' }],
  },
  {
    id: 'zhaiju', label: '宅居/迁移',
    refs: [{ path: ZN3, section: '陽宅章第三' }, { path: ZN3, section: '遷移章第五' }, { path: XJ5, section: '占宅門' }],
  },
  {
    id: 'tianshi', label: '天时',
    refs: [{ path: ZN3, section: '天時章第二' }, { path: XJ7, section: '天時門' }],
  },
  {
    id: 'bingzhan', label: '兵占/争斗',
    refs: [{ path: ZN3, section: '兵鬥章第二十九' }, { path: XJ8, section: '兵占門' }],
  },
];

/**
 * 从生成文档 markdown 中切出某 `## 节` 的正文（含节题行）。
 * 《心鏡》的「…門」为目录级节题，其正文在下属占目子节（同为 `## `）中——
 * 門级节切至下一个「…門」节题；其余节切至下一个任意 `## `。
 */
export function sliceDocSection(md: string, section: string): string {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.trim() === `## ${section}`);
  if (start < 0) return '';
  const isMen = section.endsWith('門');
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (!l.startsWith('## ')) continue;
    if (!isMen || /門\s*$/.test(l)) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n').trim();
}
