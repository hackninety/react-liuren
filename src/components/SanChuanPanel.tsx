import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';

interface SanChuanPanelProps {
  sanChuan: any;
}

/**
 * 三传展示面板
 *
 * 实际数据格式：
 *   sanChuan["初传"] = ["辰", "六合", "兄弟", "壬"]  → [地支, 天将, 六亲, 遁干]
 *   sanChuan["课体"] = "重审"
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
        {chuanList.map((chuan, index) => {
          // [地支, 天将, 六亲, 遁干]
          const [dizhi, tianJiang, liuQin, dunGan] = chuan.data;

          return (
            <motion.div
              key={chuan.name}
              className={cn(
                'relative glass-card rounded-lg p-4 flex flex-col items-center gap-2',
                'bg-gradient-to-b', chuan.color, 'to-transparent',
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
            >
              <span className="text-xs text-[var(--color-gold)] font-semibold tracking-wider uppercase">
                {chuan.name}
              </span>

              {/* 地支 — 大字 */}
              <span className={cn(
                'text-2xl font-bold font-serif',
                getWuxingColorClass(dizhi || ''),
              )}>
                {dizhi || '—'}
              </span>

              {/* 天将 */}
              {tianJiang && (
                <span className={cn(
                  'text-sm font-medium font-serif',
                  getWuxingColorClass(tianJiang),
                )}>
                  {tianJiang}
                </span>
              )}

              {/* 六亲 + 遁干 */}
              <div className="flex items-center gap-2 text-xs">
                {liuQin && (
                  <span className="px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                    {liuQin}
                  </span>
                )}
                {dunGan && (
                  <span className={cn(
                    'font-serif font-semibold',
                    getWuxingColorClass(dunGan),
                  )}>
                    {dunGan}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
