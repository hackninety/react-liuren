import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getWuxingColorClass, DIZHI_ORDER } from '@/utils/liuren-colors';

interface JianChuPanelProps {
  dunGan?: any;    // 遁干 (ShiErGongEx)
  chuJian?: any;   // 初建 (ShiErGongEx)
  fuJian?: any;    // 伏建 (ShiErGongEx)
  jianChu?: any;   // 建除十二直 (ShiErGongEx)
}

/**
 * 建除十二直 + 初建/伏建面板
 *
 * 数据格式（ShiErGongEx）：{ "子": "壬", "丑": "癸", ... }
 * jianChu 格式：{ "子": "闭", "丑": "建", ... }
 */
export function JianChuPanel({ dunGan, chuJian, fuJian, jianChu }: JianChuPanelProps) {
  const hasData = dunGan || chuJian || fuJian || jianChu;
  if (!hasData) return null;

  // 建除十二直对应着色
  const jianChuColors: Record<string, string> = {
    '建': 'text-green-400', '除': 'text-green-400',
    '满': 'text-yellow-400', '平': 'text-muted-foreground',
    '定': 'text-green-400', '执': 'text-yellow-400',
    '破': 'text-red-400', '危': 'text-red-400',
    '成': 'text-green-400', '收': 'text-yellow-400',
    '开': 'text-green-400', '闭': 'text-red-400',
  };

  return (
    <div className="space-y-4">
      {/* 建除十二直一览 */}
      {jianChu && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wider">建除十二直</h3>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {DIZHI_ORDER.map((zhi, index) => {
              const value = jianChu[zhi] || '';
              return (
                <motion.div
                  key={zhi}
                  className="glass-card rounded-lg p-1.5 flex flex-col items-center gap-0.5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                >
                  <span className="text-[10px] text-muted-foreground font-serif">{zhi}</span>
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
      <div className="overflow-x-auto">
        <table className="w-full text-center text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-1.5 text-[10px] text-muted-foreground font-normal">地支</th>
              {DIZHI_ORDER.map((zhi) => (
                <th key={zhi} className="p-1 text-xs font-serif text-muted-foreground font-normal">{zhi}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dunGan && (
              <tr className="border-t border-border/20">
                <td className="p-1.5 text-[10px] text-muted-foreground whitespace-nowrap">遁干</td>
                {DIZHI_ORDER.map((zhi) => (
                  <td key={zhi} className={cn('p-1 font-serif font-semibold', getWuxingColorClass(dunGan[zhi] || ''))}>
                    {dunGan[zhi] || '—'}
                  </td>
                ))}
              </tr>
            )}
            {chuJian && (
              <tr className="border-t border-border/20">
                <td className="p-1.5 text-[10px] text-muted-foreground whitespace-nowrap">初建</td>
                {DIZHI_ORDER.map((zhi) => (
                  <td key={zhi} className={cn('p-1 font-serif font-semibold', getWuxingColorClass(chuJian[zhi] || ''))}>
                    {chuJian[zhi] || '—'}
                  </td>
                ))}
              </tr>
            )}
            {fuJian && (
              <tr className="border-t border-border/20">
                <td className="p-1.5 text-[10px] text-muted-foreground whitespace-nowrap">伏建</td>
                {DIZHI_ORDER.map((zhi) => (
                  <td key={zhi} className={cn('p-1 font-serif font-semibold', getWuxingColorClass(fuJian[zhi] || ''))}>
                    {fuJian[zhi] || '—'}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
