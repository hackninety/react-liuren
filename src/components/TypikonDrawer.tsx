import { useEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, BookOpen } from 'lucide-react';
import * as zslj from 'zslj-ts-lib';
// lrdq 典籍走子入口：manifest 轻入口同步，各书载荷按书分包、首次访问才拉取
import * as lrdq from 'lrdq-ts-lib/docs';
import { cn } from '@/utils/cn';

interface TypikonDrawerProps {
  onClose: () => void;
}

interface SourceDocMeta {
  path: string;
  title: string;
  group: string;
  /** 多书语料库的书名（lrdq v0.6.0 起下沉到 manifest；旧库无此字段） */
  book?: string;
}

interface TypikonSource {
  lib: string;
  /** manifest 无 book 字段时的兜底书名（单书库如 zslj） */
  bookFallback: string;
  getManifest: () => SourceDocMeta[];
  getMd: (path: string) => Promise<string | undefined>;
}

/** 典籍来源（多库并册；新增典籍库时在此登记） */
const SOURCES: TypikonSource[] = [
  {
    lib: 'zslj',
    bookFallback: '占事略決',
    getManifest: zslj.getDocsManifest,
    getMd: async (p) => zslj.getDocMarkdown(p), // 同步库包一层异步
  },
  {
    lib: 'lrdq',
    bookFallback: '六壬大全',
    getManifest: lrdq.getDocsManifest,
    getMd: lrdq.getDocMarkdown, // v0.6.0 起异步（载荷按书懒加载）
  },
];

interface MergedDoc {
  /** `${lib}:${path}` */
  key: string;
  lib: string;
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
      book: d.book ?? s.bookFallback,
      path: d.path,
      title: d.title,
      group: d.group,
    })),
  );
}

/**
 * 典籍库抽屉 —— 多书并册（《占事略決》《六壬大全》…）
 *
 * 篇目由各典籍库 manifest 提供（书名分组优先读 manifest[].book）；正文异步取
 * （lrdq 多书语料库按书分包，打开某书篇目才拉取该书载荷 chunk）。
 * 站内 .md 链接拦截为文档切换（同库优先）。
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
  // 正文异步加载：以 key 标记归属，切换文档时旧文自然失效（无需同步重置状态）
  const [loaded, setLoaded] = useState<{ key: string; md: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    let live = true;
    const src = SOURCES.find((s) => s.lib === active.lib);
    Promise.resolve(src?.getMd(active.path)).then((md) => {
      if (live) setLoaded({ key: active.key, md: md ?? '' });
    });
    return () => {
      live = false;
    };
  }, [active]);

  const md = loaded?.key === activeKey ? loaded.md : null;

  // 切换文档后正文回到顶部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeKey]);

  /** 按书分组导航（书名来自 manifest / 兜底标签） */
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

        {/* 正文（异步加载） */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {md === null ? (
            <p className="text-xs text-muted-foreground/60">加载中…</p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
