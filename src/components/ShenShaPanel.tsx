import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ScrollText } from 'lucide-react';
import type { ShenShaEntry } from '@/engines/types';
import type { DqShenShaResult } from '@/plugins/dq-shensha';
import { cn } from '@/utils/cn';

interface ShenShaPanelProps {
  shenSha: ShenShaEntry[];
  /** 大全神煞插件结果（extras['dq-shensha']） */
  dq?: DqShenShaResult;
}

/**
 * 神煞列表面板：引擎神煞 + 《六壬大全》卷一立成检索（大全神煞插件）
 */
export function ShenShaPanel({ shenSha, dq }: ShenShaPanelProps) {
  const [tableOpen, setTableOpen] = useState(false);
  const hits = dq?.table.filter((r) => r.hit) ?? [];

  return (
    <div className="space-y-3">
      {shenSha.length === 0 ? (
        <p className="text-sm text-muted-foreground">暂无神煞信息</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {shenSha.map((sha, index) => (
            <motion.div
              key={`${sha.name}-${index}`}
              className="glass-card rounded-lg p-3 flex items-start gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              {/* 地支标签 */}
              {sha.value && (
                <span className="shrink-0 text-xs font-bold font-serif px-1.5 py-0.5 rounded bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold)]/20">
                  {sha.value}
                </span>
              )}

              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">{sha.name}</span>
                {sha.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {sha.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 大全神煞（《六壬大全》卷一立成） */}
      {dq && (
        <div className="rounded-lg bg-secondary/10 border border-border/30 px-3 py-2 space-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground">大全神煞（卷一立成·月建{dq.month || '—'}）入课传：</span>
            {hits.length === 0 && <span className="text-muted-foreground/60">无</span>}
            {hits.map((r) => (
              <span
                key={`${r.section}-${r.name}`}
                title={`${r.section}${r.note ? ` · ${r.note}` : ''}`}
                className="px-2 py-0.5 rounded-full border font-serif bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-[var(--color-gold)]/25"
              >
                {r.name}
                <span className="opacity-80">{r.value}</span>
              </span>
            ))}
          </div>
          {dq.gongYue.length > 0 && (
            <div className="space-y-1">
              {dq.gongYue.map((g) => (
                <p key={g.pos} className="text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-medium">{g.pos}{g.zhi}</span>
                  <span className="font-serif">
                    {g.ji.length > 0 && <>{'　'}吉：{g.ji.join(' ')}</>}
                    {g.xiong.length > 0 && <>{'　'}凶：{g.xiong.join(' ')}</>}
                  </span>
                </p>
              ))}
            </div>
          )}
          <button
            onClick={() => setTableOpen((v) => !v)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>神煞全表（{dq.table.length} 条）</span>
            {tableOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {tableOpen && (
            <div className="flex flex-wrap gap-1.5">
              {dq.table.map((r) => (
                <span
                  key={`${r.section}-${r.name}`}
                  title={`${r.section}${r.note ? ` · ${r.note}` : ''}`}
                  className={cn(
                    'px-2 py-0.5 rounded-full border font-serif',
                    r.hit
                      ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-[var(--color-gold)]/25'
                      : 'bg-secondary/30 text-muted-foreground border-border/30',
                  )}
                >
                  {r.name}
                  <span className="opacity-80">{r.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
