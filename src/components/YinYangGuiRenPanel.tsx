import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass, DIZHI_ORDER } from '@/utils/liuren-colors';
import type { LiuRenChart } from '@/engines/types';

interface YinYangGuiRenPanelProps {
  yinYangGuiRen: NonNullable<LiuRenChart['yinYangGuiRen']>;
}

/**
 * 阴阳贵人天将盘面板
 * 数据格式：{ yang: { 子: 天将, ... }, yin: { 子: 天将, ... } }
 */
export function YinYangGuiRenPanel({ yinYangGuiRen }: YinYangGuiRenPanelProps) {
  const { yang, yin } = yinYangGuiRen;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 阳贵人 */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xs font-semibold text-[var(--color-gold)] mb-2 tracking-wider text-center">
            ☀ 阳贵人
          </h3>
          <div className="grid grid-cols-4 gap-1">
            {DIZHI_ORDER.map((zhi) => {
              const tianJiang = yang[zhi as keyof typeof yang] || '';
              return (
                <div
                  key={`yang-${zhi}`}
                  className="glass-card rounded p-1.5 flex flex-col items-center gap-0.5"
                >
                  <span className="text-[9px] text-muted-foreground font-serif">{zhi}</span>
                  <span className={cn(
                    'text-xs font-medium font-serif truncate max-w-full',
                    getWuxingColorClass(tianJiang),
                  )}>
                    {tianJiang || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 阴贵人 */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-xs font-semibold text-blue-400 mb-2 tracking-wider text-center">
            ☽ 阴贵人
          </h3>
          <div className="grid grid-cols-4 gap-1">
            {DIZHI_ORDER.map((zhi) => {
              const tianJiang = yin[zhi as keyof typeof yin] || '';
              return (
                <div
                  key={`yin-${zhi}`}
                  className="glass-card rounded p-1.5 flex flex-col items-center gap-0.5"
                >
                  <span className="text-[9px] text-muted-foreground font-serif">{zhi}</span>
                  <span className={cn(
                    'text-xs font-medium font-serif truncate max-w-full',
                    getWuxingColorClass(tianJiang),
                  )}>
                    {tianJiang || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
