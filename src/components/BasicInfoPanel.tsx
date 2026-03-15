import { motion } from 'framer-motion';
import { formatOffset } from '@/utils/true-solar-time';

interface BasicInfoPanelProps {
  liuRenData: any;
  trueSolarInfo?: { offsetMinutes: number; longitude: number; trueSolarDate: Date } | null;
  originalDate?: Date;
}

/**
 * 基础信息面板
 * 展示日期、八字、月将、旬空等
 */
export function BasicInfoPanel({ liuRenData, trueSolarInfo, originalDate }: BasicInfoPanelProps) {
  if (!liuRenData?.dateInfo) return null;

  const { dateInfo } = liuRenData;
  const bazi = dateInfo.bazi || [];
  const yueJiang = dateInfo.yueJiang || '';

  const displayDate = originalDate || new Date();
  const dateStr = displayDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const timeStr = displayDate.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // 八字四柱
  const pillars = [
    { label: '年柱', value: bazi[0] || '' },
    { label: '月柱', value: bazi[1] || '' },
    { label: '日柱', value: bazi[2] || '' },
    { label: '时柱', value: bazi[3] || '' },
  ];

  return (
    <div className="space-y-4">
      {/* 日期和时间 */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <span className="text-xs text-muted-foreground">公历日期</span>
          <p className="text-sm font-medium">{dateStr} {timeStr}</p>
        </div>
        {yueJiang && (
          <div>
            <span className="text-xs text-muted-foreground">月将</span>
            <p className="text-sm font-medium text-[var(--color-gold)]">{yueJiang}</p>
          </div>
        )}
        {trueSolarInfo && (
          <div>
            <span className="text-xs text-muted-foreground">真太阳时修正</span>
            <p className="text-sm font-medium text-blue-400">
              {formatOffset(trueSolarInfo.offsetMinutes)} (经度 {trueSolarInfo.longitude}°)
            </p>
          </div>
        )}
      </div>

      {/* 四柱 */}
      <div className="grid grid-cols-4 gap-2">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.label}
            className="text-center p-2 rounded-lg bg-secondary/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <span className="text-[10px] text-muted-foreground">{pillar.label}</span>
            <p className="text-base font-bold font-serif text-foreground mt-0.5">
              {pillar.value || '—'}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 额外信息 */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {dateInfo.xunKong && (
          <span className="px-2 py-0.5 rounded bg-secondary/30">
            旬空：{dateInfo.xunKong}
          </span>
        )}
        {dateInfo.jieQi && (
          <span className="px-2 py-0.5 rounded bg-secondary/30">
            节气：{dateInfo.jieQi}
          </span>
        )}
      </div>
    </div>
  );
}
