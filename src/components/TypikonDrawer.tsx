import { useEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, BookOpen } from 'lucide-react';
import * as zslj from 'zslj-ts-lib';
import * as lrdq from 'lrdq-ts-lib';
import { cn } from '@/utils/cn';

interface TypikonDrawerProps {
  onClose: () => void;
}

/** 典籍来源（多库并册；新增典籍库时在此登记） */
const SOURCES = [
  { lib: 'zslj', book: '占事略決', getManifest: zslj.getDocsManifest, getMd: zslj.getDocMarkdown },
  { lib: 'lrdq', book: '六壬大全', getManifest: lrdq.getDocsManifest, getMd: lrdq.getDocMarkdown },
] as const;

interface MergedDoc {
  /** `${lib}:${path}` */
  key: string;
  lib: (typeof SOURCES)[number]['lib'];
  book: string;
  path: string;
  title: string;
  group: string;
}

function mergeManifests(): MergedDoc[] {
  return SOURCES.flatMap((s) =>
    s.getManifest().map((d) => ({
      key: `${s.lib}:${d.path}`,
      lib: s.lib,
      book: s.book,
      path: d.path,
      title: d.title,
      group: d.group,
    })),
  );
}

function markdownOf(doc: MergedDoc | undefined): string {
  if (!doc) return '';
  const src = SOURCES.find((s) => s.lib === doc.lib);
  return src?.getMd(doc.path) ?? '';
}

/**
 * 典籍库抽屉 —— 《占事略決》《六壬大全》两库并册
 *
 * 内容由各典籍库打包内置（getDocsManifest / getDocMarkdown），随库版本
 * 锁定、离线可用；站内 .md 链接拦截为文档切换（同库优先）。
 * 经 App 以 React.lazy 懒加载，react-markdown 不进入首屏包。
 * 移动端全屏；desktop 居中弹窗。
 */
export default function TypikonDrawer({ onClose }: TypikonDrawerProps) {
  const docs = useMemo(() => mergeManifests(), []);
  // 默认打开首库原文（占事略決全书）
  const [activeKey, setActiveKey] = useState(
    () => (docs.find((d) => d.group === 'book') ?? docs[0])?.key ?? '',
  );
  const active = docs.find((d) => d.key === activeKey);
  const md = markdownOf(active);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 切换文档后正文回到顶部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeKey]);

  /** 按书分组导航 */
  const groups = useMemo(() => {
    const map = new Map<string, MergedDoc[]>();
    for (const d of docs) {
      const list = map.get(d.book) ?? [];
      list.push(d);
      map.set(d.book, list);
    }
    return [...map.entries()];
  }, [docs]);

  /** 站内 .md 链接 → 同库优先解析 */
  const resolveDocKey = (href: string): string | null => {
    const clean = href.replace(/^\.?\//, '').split('#')[0];
    const pool = active ? [...docs.filter((d) => d.lib === active.lib), ...docs] : docs;
    const exact = pool.find((d) => d.path === clean);
    if (exact) return exact.key;
    const base = clean.split('/').pop();
    const byName = pool.find((d) => d.path.split('/').pop() === base);
    return byName?.key ?? null;
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4 md:p-6"
      onClick={onClose}
    >
      {/* 移动端全屏；desktop 居中弹窗（更宽、圆角、留边） */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-0 flex flex-col bg-card shadow-2xl overflow-hidden sm:static sm:inset-auto sm:w-full sm:max-w-3xl sm:h-[85vh] sm:rounded-2xl sm:border sm:border-border/50"
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--color-gold)]" />
            <h2 className="text-base font-bold font-serif text-foreground">典籍库</h2>
            {active && (
              <span className="text-xs text-muted-foreground">·《{active.book}》</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 文档导航（按书分组） */}
        <div className="px-4 py-2 border-b border-border/40 shrink-0 space-y-1.5">
          {groups.map(([book, list]) => (
            <div key={book} className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground tracking-wider mr-1 font-serif">
                {book}
              </span>
              {list.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setActiveKey(d.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs border transition-all',
                    activeKey === d.key
                      ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold)]/30 font-medium'
                      : 'bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/50',
                  )}
                >
                  {d.title}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* 正文 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          <article className="typikon-prose">
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => {
                  if (href && /\.md($|#)/.test(href)) {
                    const key = resolveDocKey(href);
                    if (key) {
                      return (
                        <button
                          type="button"
                          className="text-[var(--color-gold)] underline underline-offset-2"
                          onClick={() => setActiveKey(key)}
                        >
                          {children}
                        </button>
                      );
                    }
                  }
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  );
                },
              }}
            >
              {md}
            </Markdown>
          </article>
        </div>
      </div>
    </div>
  );
}
