import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface KeJingView {
  name: string;
  book: string;
  juan: number;
  order: number;
  text: string;
}

interface KeJingRefsProps {
  /** 待匹配的课体/取传法/课体细分名（元首、遥克、三光…） */
  names: string[];
}

const JUAN_CN: Record<number, string> = {
  1: '一', 2: '二', 3: '三', 7: '七', 8: '八', 9: '九', 10: '十',
};

/**
 * 课体課經原文深链 —— 把三传面板的课体名解析为《六壬大全·課經》原文节就地展开。
 * lrdq-ts-lib/keju 动态导入（独立 chunk），首次展开才拉取；课名折叠匹配
 * （剋/克、繁简、「課」后缀）由库内 findKeJing 完成。
 * 调用处用 key={names.join()} 使课名变化时重置缓存。
 */
export function KeJingRefs({ names }: KeJingRefsProps) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<KeJingView[] | null>(null);

  const toggle = () => {
    setOpen((v) => !v);
    if (entries === null) {
      import('lrdq-ts-lib/keju')
        .then((m) => setEntries(m.findKeJing(names)))
        .catch(() => setEntries([]));
    }
  };

  return (
    <div className="text-xs">
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>课体原文（《六壬大全·課經》《六壬心鏡》）</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && entries === null && <p className="mt-2 text-muted-foreground/60">加载中…</p>}
      {open && entries !== null && entries.length === 0 && (
        <p className="mt-2 text-muted-foreground/60">本课体名未见于《課經》与《心鏡》课体节</p>
      )}
      {open && !!entries?.length && (
        <div className="mt-2 space-y-2">
          {entries.map((e) => (
            <blockquote
              key={`${e.juan}-${e.order}`}
              className="border-l-2 border-[var(--color-gold)]/50 pl-3 py-0.5 bg-secondary/10 rounded-r"
            >
              <div className="font-serif font-semibold text-foreground">
                {e.name}
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/60">
                  《{e.book}》卷{JUAN_CN[e.juan] ?? e.juan}
                </span>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed mt-0.5 max-h-64 overflow-y-auto">
                {e.text}
              </p>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}
