import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';
import type { GongInfo } from '@/engines/types';

interface JianChuPanelProps {
  gong: GongInfo[];
}

/**
 * 建除十二直 + 遁干/初建/伏建面板
 * 数据来自统一模型每宫的 jianChu / dunGan / chuJian / fuJian 字段
 */
export function JianChuPanel({ gong }: JianChuPanelProps) {
  const hasJianChu = gong.some((g) => g.jianChu);
  const hasDunGan = gong.some((g) => g.dunGan);
  const hasChuJian = gong.some((g) => g.chuJian);
  const hasFuJian = gong.some((g) => g.fuJian);
  if (!hasJianChu && !hasDunGan && !hasChuJian && !hasFuJian) return null;

  // 建除十二直对应着色
  const jianChuColors: Record<string, string> = {
    '建': 'text-green-400', '除': 'text-green-400',
    '满': 'text-yellow-400', '平': 'text-muted-foreground',
    '定': 'text-green-400', '执': 'text-yellow-400',
    '破': 'text-red-400', '危': 'text-red-400',
    '成': 'text-green-400', '收': 'text-yellow-400',
    '开': 'text-green-400', '闭': 'text-red-400',
  };

  const rows: { label: string; pick: (g: GongInfo) => string | undefined }[] = [
    ...(hasDunGan ? [{ label: '遁干', pick: (g: GongInfo) => g.dunGan }] : []),
    ...(hasChuJian ? [{ label: '初建', pick: (g: GongInfo) => g.chuJian }] : []),
    ...(hasFuJian ? [{ label: '伏建', pick: (g: GongInfo) => g.fuJian }] : []),
  ];

  return (
    <div className="space-y-4">
      {/* 建除十二直一览 */}
      {hasJianChu && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wider">建除十二直</h3>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {gong.map((g, index) => {
              const value = g.jianChu || '';
              return (
                <motion.div
                  key={g.diZhi}
                  className="glass-card rounded-lg p-1.5 flex flex-col items-center gap-0.5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <span className="text-[10px] text-muted-foreground font-serif">{g.diZhi}</span>
                  <span className={cn(
                    'text-sm font-bold font-serif',
                    jianChuColors[value] || 'text-foreground',
                  )}>
                    {value || '—'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 遁干/初建/伏建对比 */}
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-1.5 text-[10px] text-muted-foreground font-normal">地支</th>
                {gong.map((g) => (
                  <th key={g.diZhi} className="p-1 text-xs font-serif text-muted-foreground font-normal">{g.diZhi}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-border/20">
                  <td className="p-1.5 text-[10px] text-muted-foreground whitespace-nowrap">{row.label}</td>
                  {gong.map((g) => {
                    const value = row.pick(g) || '';
                    return (
                      <td key={g.diZhi} className={cn('p-1 font-serif font-semibold', getWuxingColorClass(value))}>
                        {value || '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
