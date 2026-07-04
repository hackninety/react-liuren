import { useMemo, useState } from 'react';
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react';
import { getBookEntry } from 'zslj-ts-lib';

interface GuFaRefsProps {
  /** 本课涉及的《占事略決》原文锚点（chart.extras.refs） */
  refs: string[];
}

interface ResolvedRef {
  id: string;
  heading: string;
  text: string;
  sideNote?: string;
}

/**
 * 古法排盘「本课原文引用」——把 chart.extras.refs 的锚点经 getBookEntry
 * 解析为《占事略決》原文条文，就地展示（把典籍与排盘结果绑定）。
 */
export function GuFaRefs({ refs }: GuFaRefsProps) {
  const [open, setOpen] = useState(false);

  const resolved = useMemo<ResolvedRef[]>(() => {
    const seen = new Set<string>();
    const out: ResolvedRef[] = [];
    for (const id of refs) {
      if (seen.has(id)) continue;
      seen.add(id);
      const entry = getBookEntry(id);
      if (entry) out.push({ id, ...entry });
    }
    return out;
  }, [refs]);

  if (resolved.length === 0) return null;

  return (
    <div className="text-xs">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ScrollText className="w-3.5 h-3.5" />
        <span>本课原文引用（{resolved.length} 条 ·《占事略決》）</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {resolved.map((r) => (
            <blockquote
              key={r.id}
              className="border-l-2 border-[var(--color-gold)]/50 pl-3 py-0.5 bg-secondary/10 rounded-r"
            >
              <div className="font-serif font-semibold text-foreground">
                {r.heading}
                <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/60">{r.id}</span>
              </div>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed mt-0.5">{r.text}</p>
              {r.sideNote && (
                <p className="text-muted-foreground/70 italic whitespace-pre-wrap mt-1">{r.sideNote}</p>
              )}
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}
