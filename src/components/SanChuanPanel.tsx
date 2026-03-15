import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';

interface SanChuanPanelProps {
  sanChuan: any;
}

/**
 * 三传展示面板
 * 初传 → 中传 → 末传，水平排列 + 课体
 */
export function SanChuanPanel({ sanChuan }: SanChuanPanelProps) {
  if (!sanChuan) return null;

  const chuanList = [
    { name: '初传', data: sanChuan['初传'] || [], color: 'from-[var(--color-gold)]/20' },
    { name: '中传', data: sanChuan['中传'] || [], color: 'from-blue-500/20' },
    { name: '末传', data: sanChuan['末传'] || [], color: 'from-purple-500/20' },
  ];

  return (
    <div className="space-y-4">
      {/* 课体名称 */}
      {sanChuan['课体'] && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">课体：</span>
          <span className="px-3 py-1 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-sm font-semibold border border-[var(--color-gold)]/20">
            {sanChuan['课体']}
          </span>
        </div>
      )}

      {/* 三传 */}
      <div className="grid grid-cols-3 gap-3">
        {chuanList.map((chuan, index) => (
          <motion.div
            key={chuan.name}
            className={cn(
              'glass-card rounded-lg p-4 flex flex-col items-center gap-3',
              'bg-gradient-to-b', chuan.color, 'to-transparent',
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <span className="text-xs text-[var(--color-gold)] font-semibold tracking-wider uppercase">
              {chuan.name}
            </span>
            <div className="flex flex-col items-center gap-1">
              {chuan.data.map((item: string, i: number) => (
                <span
                  key={i}
                  className={cn(
                    'text-lg font-bold font-serif',
                    getWuxingColorClass(item),
                  )}
                >
                  {item}
                </span>
              ))}
            </div>
            {/* 箭头连接 */}
            {index < 2 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-muted-foreground/30 text-lg z-20 hidden sm:block">
                →
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
