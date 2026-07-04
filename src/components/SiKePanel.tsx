import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';
import type { SiKeItem } from '@/engines/types';

interface SiKePanelProps {
  siKe: SiKeItem[];
  /** 四柱八字（空格分隔），用于展示每课的干支归属 */
  bazi?: string;
}

/**
 * 四课独立展示面板
 */
export function SiKePanel({ siKe, bazi }: SiKePanelProps) {
  if (siKe.length === 0) return null;

  const baziArr = (bazi || '').split(' ');
  const riZhu = baziArr[2] || '';
  const riGan = riZhu.charAt(0);
  const riZhi = riZhu.charAt(1);

  const descList = [`${riGan}上`, `${riGan}下`, `${riZhi}上`, `${riZhi}下`];

  return (
    <div className="grid grid-cols-4 gap-3">
      {siKe.map((ke, index) => (
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
            {/* 上神+下神（如 "未戊"） */}
            <span className={cn(
              'text-xl font-bold font-serif',
              getWuxingColorClass(ke.shang || ''),
            )}>
              {ke.shang || ke.xia ? `${ke.shang}${ke.xia}` : '—'}
            </span>
            {/* 分割线 */}
            <div className="w-8 h-px bg-border/60" />
            {/* 天将 */}
            <span className={cn(
              'text-sm font-medium font-serif',
              getWuxingColorClass(ke.tianJiang || ''),
            )}>
              {ke.tianJiang || '—'}
            </span>
          </div>
          <span className="text-[9px] text-muted-foreground">{descList[index] || ''}</span>
        </motion.div>
      ))}
    </div>
  );
}
