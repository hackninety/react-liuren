import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';
import type { JinKouJueChart } from '@/engines/types';

interface JinKouJuePanelProps {
  jkjData: JinKouJueChart | null;
}

/**
 * 金口诀排盘面板
 * 四位展示：人元 → 贵神 → 将神 → 地分
 */
export function JinKouJuePanel({ jkjData }: JinKouJuePanelProps) {
  if (!jkjData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground text-sm">请输入地分起课</p>
      </div>
    );
  }

  const { siWei, shenSha, date } = jkjData;

  const siWeiList = [
    { label: '人元（干）', key: 'renYuan', data: siWei.renYuan },
    { label: '贵神（神）', key: 'guiShen', data: siWei.guiShen },
    { label: '将神（将）', key: 'jiangShen', data: siWei.jiangShen },
    { label: '地分（方）', key: 'diFen', data: siWei.diFen },
  ];

  return (
    <div className="space-y-6">
      {/* 日期信息 */}
      {date.bazi && (
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex gap-2">
            {['年柱', '月柱', '日柱', '时柱'].map((label, i) => {
              const baziArr = (date.bazi || '').split(' ');
              return (
                <span key={label} className="px-2 py-0.5 rounded bg-secondary/30 text-xs">
                  {label}：{baziArr[i] || '—'}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 四位 — 核心展示 */}
      <div className="grid grid-cols-4 gap-3">
        {siWeiList.map((item, index) => (
          <motion.div
            key={item.key}
            className={cn(
              'glass-card rounded-xl p-4 flex flex-col items-center gap-2',
              'bg-gradient-to-b from-[var(--color-gold)]/5 to-transparent',
            )}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <span className="text-[10px] text-[var(--color-gold)] font-semibold tracking-wider">
              {item.label}
            </span>

            {item.data ? (
              <div className="flex flex-col items-center gap-1">
                <span className={cn(
                  'text-2xl font-bold font-serif',
                  getWuxingColorClass(item.data.name || item.data.ganZhi || ''),
                )}>
                  {item.data.name || item.data.ganZhi || '—'}
                </span>
                {item.data.ganZhi && item.data.ganZhi !== item.data.name && (
                  <span className="text-xs text-muted-foreground">{item.data.ganZhi}</span>
                )}
                {item.data.wuXing && (
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full border',
                    getWuxingColorClass(item.data.wuXing.charAt(0) || ''),
                    'border-current/20',
                  )}>
                    {item.data.wuXing}
                  </span>
                )}
                {item.data.wangXiangXiuQiu && (
                  <span className="text-[10px] text-muted-foreground">
                    {item.data.wangXiangXiuQiu}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-lg text-muted-foreground">—</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* 神煞 */}
      {shenSha.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wider">神煞</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {shenSha.map((sha, index) => (
              <motion.div
                key={`${sha.name}-${index}`}
                className="glass-card rounded-lg p-2 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0',
                  sha.type === '吉' && 'bg-green-500/20 text-green-400',
                  sha.type === '凶' && 'bg-red-500/20 text-red-400',
                )}>
                  {sha.type}
                </span>
                <span className="text-sm font-medium">{sha.name}</span>
                {sha.position.length > 0 && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-secondary/50 text-muted-foreground shrink-0">
                    落{sha.position.join('/')}
                  </span>
                )}
                {sha.description && (
                  <span className="text-xs text-muted-foreground truncate">— {sha.description}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
