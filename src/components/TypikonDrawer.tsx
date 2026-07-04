import { useEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X, BookOpen } from 'lucide-react';
import { getDocsManifest, getDocMarkdown, type DocMeta } from 'zslj-ts-lib';
import { cn } from '@/utils/cn';

interface TypikonDrawerProps {
  onClose: () => void;
}

const GROUP_LABEL: Record<string, string> = {
  book: '原文合订',
  algorithm: '算法说明',
};

/**
 * 典籍库抽屉 ——《占事略決》全书合订本 + 起课算法说明
 *
 * 内容由 zslj-ts-lib 打包内置（getDocsManifest / getDocMarkdown），
 * 随库版本锁定、离线可用；站内 .md 链接拦截为文档切换，图片走 GitHub raw。
 * 经 App 以 React.lazy 懒加载，react-markdown 不进入首屏包。
 */
export default function TypikonDrawer({ onClose }: TypikonDrawerProps) {
  const manifest = useMemo<DocMeta[]>(() => getDocsManifest(), []);
  // 默认打开原文合订本（book 组），无则退回首篇
  const [active, setActive] = useState(
    () => manifest.find((d) => d.group === 'book')?.path ?? manifest[0]?.path ?? '',
  );
  const md = getDocMarkdown(active) ?? '';
  const scrollRef = useRef<HTMLDivElement>(null);

  // 切换文档后正文回到顶部
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [active]);

  // 按 group 分组导航
  const groups = useMemo(() => {
    const map = new Map<string, DocMeta[]>();
    for (const d of manifest) {
      const list = map.get(d.group) ?? [];
      list.push(d);
      map.set(d.group, list);
    }
    return [...map.entries()];
  }, [manifest]);

  /** 站内 .md 链接 → 匹配 manifest 路径（精确或按文件名） */
  const resolveDocPath = (href: string): string | null => {
    const clean = href.replace(/^\.?\//, '').split('#')[0];
    if (manifest.some((d) => d.path === clean)) return clean;
    const base = clean.split('/').pop();
    const hit = manifest.find((d) => d.path.split('/').pop() === base);
    return hit?.path ?? null;
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-2xl bg-card shadow-2xl border-l border-border/50 flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--color-gold)]" />
            <h2 className="text-base font-bold font-serif text-foreground">典籍库 ·《占事略決》</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 文档导航 */}
        <div className="px-4 py-2 border-b border-border/40 shrink-0 space-y-1.5">
          {groups.map(([group, docs]) => (
            <div key={group} className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground/70 tracking-wider mr-1">
                {GROUP_LABEL[group] ?? group}
              </span>
              {docs.map((d) => (
                <button
                  key={d.path}
                  onClick={() => setActive(d.path)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs border transition-all',
                    active === d.path
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
                    const path = resolveDocPath(href);
                    if (path) {
                      return (
                        <button
                          type="button"
                          className="text-[var(--color-gold)] underline underline-offset-2"
                          onClick={() => setActive(path)}
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
    </>
  );
}
