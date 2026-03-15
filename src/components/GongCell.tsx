import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';

interface GongCellProps {
  diPan: string;      // 地盘（地支）
  tianPan: string;     // 天盘（地支）
  tianJiang: string;   // 天将
  position: string;    // 宫位名（如 "子", "丑"...）
  isHighlight?: boolean;
  label?: string;      // 额外标记（如 "日" "辰"）
}

/**
 * 天地盘单个宫位
 * 垂直三层：天将（顶）→ 天盘（中）→ 地盘（底）
 */
export function GongCell({
  diPan,
  tianPan,
  tianJiang,
  position,
  isHighlight = false,
  label,
}: GongCellProps) {
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
          {position}
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

      {/* 天将 */}
      <span className={cn(
        'text-[10px] sm:text-xs font-medium font-serif relative z-10 truncate max-w-full',
        getWuxingColorClass(tianJiang),
      )}>
        {tianJiang || '\u00A0'}
      </span>

      {/* 天盘（大字） */}
      <span className={cn(
        'text-lg sm:text-xl font-bold font-serif relative z-10',
        getWuxingColorClass(tianPan),
      )}>
        {tianPan || '\u00A0'}
      </span>

      {/* 地盘 */}
      <span className={cn(
        'text-xs sm:text-sm font-semibold font-serif text-muted-foreground relative z-10',
        getWuxingColorClass(diPan),
      )}>
        {diPan || '\u00A0'}
      </span>
    </div>
  );
}
