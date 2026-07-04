import { motion } from 'framer-motion';
import { formatOffset } from '@/utils/true-solar-time';
import type { LiuRenChart } from '@/engines/types';

interface BasicInfoPanelProps {
  chart: LiuRenChart;
  trueSolarInfo?: { offsetMinutes: number; longitude: number; trueSolarDate: Date } | null;
  originalDate?: Date;
}

/**
 * 基础信息面板
 * 展示四柱八字、月将、旬空、马星与所用流派
 */
export function BasicInfoPanel({ chart, trueSolarInfo, originalDate }: BasicInfoPanelProps) {
  const { dateInfo, meta } = chart;

  // bazi 是空格分隔字符串："丙午 辛卯 戊子 辛酉"
  const baziArr = (dateInfo.bazi || '').split(' ');
  const pillars = [
    { label: '年柱', value: baziArr[0] || '' },
    { label: '月柱', value: baziArr[1] || '' },
    { label: '日柱', value: baziArr[2] || '' },
    { label: '时柱', value: baziArr[3] || '' },
  ];

  // 额外信息标签
  const infoTags: { label: string; value: string }[] = [];
  if (dateInfo.yueJiang) infoTags.push({ label: '月将', value: dateInfo.yueJiang });
  if (dateInfo.kongWang.length > 0) infoTags.push({ label: '旬空', value: dateInfo.kongWang.join(' ') });
  if (dateInfo.xun) infoTags.push({ label: '旬首', value: dateInfo.xun });
  if (dateInfo.yiMa) infoTags.push({ label: '驿马', value: dateInfo.yiMa });
  if (dateInfo.dingMa) infoTags.push({ label: '丁马', value: dateInfo.dingMa });
  if (dateInfo.tianMa) infoTags.push({ label: '天马', value: dateInfo.tianMa });
  if (dateInfo.dayNight) infoTags.push({ label: '昼夜', value: `${dateInfo.dayNight}占` });

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

  return (
    <div className="space-y-4">
      {/* 日期和时间 */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <span className="text-xs text-muted-foreground">公历日期</span>
          <p className="text-sm font-medium">{dateStr} {timeStr}</p>
        </div>
        {dateInfo.ganZhiDate && (
          <div>
            <span className="text-xs text-muted-foreground">干支历</span>
            <p className="text-sm font-medium">{dateInfo.ganZhiDate}</p>
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
        <div>
          <span className="text-xs text-muted-foreground">流派引擎</span>
          <p className="text-sm font-medium text-[var(--color-gold)]">
            {meta.school} · {meta.engineName}
          </p>
        </div>
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

      {/* 月将/旬空/驿马/旬首/丁马/天马 */}
      <div className="flex flex-wrap gap-2">
        {infoTags.map((tag) => (
          <span
            key={tag.label}
            className="px-2 py-1 rounded-lg bg-secondary/40 text-xs flex items-center gap-1.5"
          >
            <span className="text-muted-foreground">{tag.label}</span>
            <span className="font-semibold font-serif text-[var(--color-gold)]">{tag.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
