import { motion } from 'framer-motion';
import type { ShenShaEntry } from '@/engines/types';

interface ShenShaPanelProps {
  shenSha: ShenShaEntry[];
}

/**
 * 神煞列表面板
 */
export function ShenShaPanel({ shenSha }: ShenShaPanelProps) {
  if (shenSha.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无神煞信息</p>;
  }

  return (
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
  );
}
