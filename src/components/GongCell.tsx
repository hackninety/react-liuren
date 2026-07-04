import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';
import type { GongInfo } from '@/engines/types';

interface GongCellProps {
  gong: GongInfo;
  isHighlight?: boolean;
  label?: string;      // 额外标记（如 "日" "辰" "行年"）
}

/** 插件角标的展示顺序与样式 */
const EXTRA_BADGES: { key: string; className: string }[] = [
  { key: 'changSheng', className: 'text-sky-400/80' },
  { key: 'wangShuai', className: 'text-amber-400/80' },
  { key: 'mark', className: 'text-[var(--color-gold)]' },
];

/**
 * 天地盘单个宫位
 * 垂直三层：天将（顶）→ 天盘（中）→ 地盘（底）
 * 左下角为插件角标（十二长生/旺衰等）
 */
export function GongCell({ gong, isHighlight = false, label }: GongCellProps) {
  const badges = EXTRA_BADGES
    .map(({ key, className }) => ({ value: gong.extras?.[key], className }))
    .filter((b): b is { value: string; className: string } => Boolean(b.value));

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-between p-1.5 sm:p-2 min-h-[80px] sm:min-h-[100px]',
        'bg-card/60 backdrop-blur-sm',
        'border border-border/40',
        'transition-all duration-200',
        'hover:bg-card/80 hover:border-border/70',
        isHighlight && 'ring-1 ring-[var(--color-gold)]/50 bg-[var(--color-gold)]/5',
      )}
    >
      {/* 宫位背景水印 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-3xl sm:text-4xl font-black font-serif text-foreground/[0.04] select-none">
          {gong.diZhi}
        </span>
      </div>

      {/* 额外标记 */}
      {label && (
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
          <span className="text-[8px] sm:text-[9px] bg-[var(--color-gold)] text-black px-1 py-px rounded-b font-medium leading-tight">
            {label}
          </span>
        </div>
      )}

      {/* 插件角标（长生/旺衰等） */}
      {badges.length > 0 && (
        <div className="absolute bottom-0.5 left-1 flex flex-col items-start leading-none z-10">
          {badges.map((b, i) => (
            <span key={i} className={cn('text-[8px] sm:text-[9px] font-serif', b.className)}>
              {b.value}
            </span>
          ))}
        </div>
      )}

      {/* 遁干（右上角） */}
      {gong.dunGan && (
        <span className={cn(
          'absolute top-0.5 right-1 text-[8px] sm:text-[9px] font-serif z-10',
          getWuxingColorClass(gong.dunGan),
        )}>
          {gong.dunGan}
        </span>
      )}

      {/* 天将 */}
      <span className={cn(
        'text-[10px] sm:text-xs font-medium font-serif relative z-10 truncate max-w-full',
        getWuxingColorClass(gong.tianJiang),
      )}>
        {gong.tianJiang || ' '}
      </span>

      {/* 天盘（大字） */}
      <span className={cn(
        'text-lg sm:text-xl font-bold font-serif relative z-10',
        getWuxingColorClass(gong.tianZhi),
      )}>
        {gong.tianZhi || ' '}
      </span>

      {/* 地盘 */}
      <span className={cn(
        'text-xs sm:text-sm font-semibold font-serif text-muted-foreground relative z-10',
        getWuxingColorClass(gong.diZhi),
      )}>
        {gong.diZhi || ' '}
      </span>
    </div>
  );
}
