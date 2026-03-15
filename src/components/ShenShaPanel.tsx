import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ShenShaPanelProps {
  shenSha: any;
}

/**
 * 神煞列表面板
 * 以卡片/表格形式展示各神煞，吉/凶区分颜色
 */
export function ShenShaPanel({ shenSha }: ShenShaPanelProps) {
  if (!shenSha) return null;

  // shenSha 可能是数组或对象
  const shenShaList = Array.isArray(shenSha) ? shenSha : Object.entries(shenSha).map(([key, val]) => ({
    name: key,
    value: val,
  }));

  if (shenShaList.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无神煞信息</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {shenShaList.map((sha: any, index: number) => {
        const isJi = sha.type === '吉';
        const iXiong = sha.type === '凶';

        return (
          <motion.div
            key={`${sha.name}-${index}`}
            className="glass-card rounded-lg p-3 flex items-start gap-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            {/* 吉凶标签 */}
            <span className={cn(
              'shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded',
              isJi && 'bg-green-500/20 text-green-400 border border-green-500/30',
              iXiong && 'bg-red-500/20 text-red-400 border border-red-500/30',
              !isJi && !iXiong && 'bg-secondary text-muted-foreground',
            )}>
              {sha.type || '—'}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{sha.name}</span>
                {sha.value && (
                  <span className="text-xs text-muted-foreground">({sha.value})</span>
                )}
              </div>
              {sha.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {sha.description}
                </p>
              )}
              {sha.position && sha.position.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {sha.position.map((pos: string, i: number) => (
                    <span key={i} className="text-[10px] px-1 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                      {pos}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
