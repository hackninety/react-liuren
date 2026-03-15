import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass, DIZHI_ORDER } from '@/utils/liuren-colors';

interface DunGanPanelProps {
  dunGan: any;
}

/**
 * 遁干展示面板
 * 十二宫的遁干信息以 Grid 展示
 */
export function DunGanPanel({ dunGan }: DunGanPanelProps) {
  if (!dunGan) return null;

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {DIZHI_ORDER.map((zhi, index) => {
        const gan = dunGan[zhi] || '';
        return (
          <motion.div
            key={zhi}
            className="glass-card rounded-lg p-2 flex flex-col items-center gap-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
          >
            <span className="text-xs text-muted-foreground font-serif">{zhi}</span>
            <span className={cn(
              'text-base font-bold font-serif',
              getWuxingColorClass(gan),
            )}>
              {gan || '—'}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
