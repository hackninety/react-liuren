import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';
import type { ChuanItem, SanChuanInfo } from '@/engines/types';
import type { KetiDetailResult } from '@/plugins/keti-detail';

export interface SanChuanCompare {
  school: string;
  chu: string;
  zhong: string;
  mo: string;
}

interface SanChuanPanelProps {
  sanChuan: SanChuanInfo;
  /** 课体细分插件结果（课名 + 细分标签） */
  ketiDetail?: KetiDetailResult;
  /** 另一流派引擎的三传（对照互证） */
  compare?: SanChuanCompare;
}

/**
 * 三传展示面板
 */
export function SanChuanPanel({ sanChuan, ketiDetail, compare }: SanChuanPanelProps) {
  const compareSame =
    compare &&
    compare.chu === sanChuan.chu.zhi &&
    compare.zhong === sanChuan.zhong.zhi &&
    compare.mo === sanChuan.mo.zhi;

  const chuanList: { name: string; data: ChuanItem; color: string }[] = [
    { name: '初传', data: sanChuan.chu, color: 'from-[var(--color-gold)]/20' },
    { name: '中传', data: sanChuan.zhong, color: 'from-blue-500/20' },
    { name: '末传', data: sanChuan.mo, color: 'from-purple-500/20' },
  ];

  return (
    <div className="space-y-4">
      {/* 课体名称 + 课体细分 */}
      {(sanChuan.keTi || ketiDetail) && (
        <div className="flex flex-wrap items-center gap-2">
          {sanChuan.keTi && (
            <>
              <span className="text-sm text-muted-foreground">课体：</span>
              <span className="px-3 py-1 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-sm font-semibold border border-[var(--color-gold)]/20">
                {sanChuan.keTi}
              </span>
            </>
          )}
          {sanChuan.method && sanChuan.method !== sanChuan.keTi && (
            <span className="px-3 py-1 rounded-full bg-secondary/50 text-muted-foreground text-xs border border-border/30">
              {sanChuan.method}
            </span>
          )}
          {ketiDetail?.subTypes.map((sub) => (
            <span
              key={sub}
              className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20"
            >
              {sub}
            </span>
          ))}
          {ketiDetail?.keName && (
            <span className="text-xs text-muted-foreground ml-auto font-serif">
              {ketiDetail.keName}
            </span>
          )}
        </div>
      )}

      {/* 三传 */}
      <div className="grid grid-cols-3 gap-3">
        {chuanList.map((chuan, index) => (
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
              getWuxingColorClass(chuan.data.zhi || ''),
            )}>
              {chuan.data.zhi || '—'}
            </span>

            {/* 天将 */}
            {chuan.data.tianJiang && (
              <span className={cn(
                'text-sm font-medium font-serif',
                getWuxingColorClass(chuan.data.tianJiang),
              )}>
                {chuan.data.tianJiang}
              </span>
            )}

            {/* 六亲 + 遁干 */}
            <div className="flex items-center gap-2 text-xs">
              {chuan.data.liuQin && (
                <span className="px-1.5 py-0.5 rounded bg-secondary/50 text-muted-foreground">
                  {chuan.data.liuQin}
                </span>
              )}
              {chuan.data.dunGan && (
                <span className={cn(
                  'font-serif font-semibold',
                  getWuxingColorClass(chuan.data.dunGan),
                )}>
                  {chuan.data.dunGan}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 双引擎三传对照 */}
      {compare && (
        <div className="flex flex-wrap items-center gap-2 text-xs rounded-lg bg-secondary/20 border border-border/30 px-3 py-2">
          <span className="text-muted-foreground">三传对照 · {compare.school}：</span>
          <span className="font-serif font-semibold">
            {compare.chu || '—'} → {compare.zhong || '—'} → {compare.mo || '—'}
          </span>
          {compareSame ? (
            <span className="text-green-400">✓ 两派一致</span>
          ) : (
            <span className="text-amber-400" title="贵人起法、月将换将时机等流派差异可导致三传不同">
              ⚠ 存在流派差异
            </span>
          )}
        </div>
      )}
    </div>
  );
}
