import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';

interface SiKePanelProps {
  siKe: any;
  dateInfo?: any;
}

/**
 * 四课独立展示面板
 * 水平排列四课，每课显示上神/下神
 */
export function SiKePanel({ siKe, dateInfo }: SiKePanelProps) {
  if (!siKe) return null;

  const riGan = dateInfo?.bazi?.[2]?.[0] || '';
  const riZhi = dateInfo?.bazi?.[2]?.[1] || '';

  const keList = [
    { name: '一课', desc: `${riGan}上`, data: siKe['一课'] || [] },
    { name: '二课', desc: `${riGan}下`, data: siKe['二课'] || [] },
    { name: '三课', desc: `${riZhi}上`, data: siKe['三课'] || [] },
    { name: '四课', desc: `${riZhi}下`, data: siKe['四课'] || [] },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {keList.map((ke, index) => (
        <motion.div
          key={ke.name}
          className="glass-card rounded-lg p-3 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <span className="text-[10px] text-[var(--color-gold)] font-semibold tracking-wider">
            {ke.name}
          </span>
          <div className="flex flex-col items-center gap-1">
            {/* 上神 */}
            <span className={cn(
              'text-xl font-bold font-serif',
              getWuxingColorClass(ke.data[0] || ''),
            )}>
              {ke.data[0] || '—'}
            </span>
            {/* 分割线 */}
            <div className="w-8 h-px bg-border/60" />
            {/* 下神 */}
            <span className={cn(
              'text-xl font-bold font-serif',
              getWuxingColorClass(ke.data[1] || ''),
            )}>
              {ke.data[1] || '—'}
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground">{ke.desc}</span>
        </motion.div>
      ))}
    </div>
  );
}
