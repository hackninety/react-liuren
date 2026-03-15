import { motion } from 'framer-motion';

interface ShenShaPanelProps {
  shenSha: any;
}

/**
 * 神煞列表面板
 *
 * 实际数据格式（ShenShaItem）：
 *   { name: "太岁", value: "午", description: "主一年吉凶..." }
 *   无 type 字段（无吉凶标记）
 */
export function ShenShaPanel({ shenSha }: ShenShaPanelProps) {
  if (!shenSha) return null;

  const shenShaList: any[] = Array.isArray(shenSha) ? shenSha : [];

  if (shenShaList.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无神煞信息</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {shenShaList.map((sha: any, index: number) => (
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
