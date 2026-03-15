import { motion } from 'framer-motion';
import { GongCell } from './GongCell';
import { DIZHI_ORDER } from '@/utils/liuren-colors';

interface TianDiPanProps {
  liuRenData: any;
}

/**
 * 天地盘 4×4 方盘布局
 *
 * 布局对应：
 *   | 巳(5) | 午(6)  | 未(7) | 申(8)  |
 *   | 辰(4) |  中心区  | 酉(9)  |
 *   | 卯(3) |  四课   | 戌(10) |
 *   | 寅(2) | 丑(1)  | 子(0) | 亥(11) |
 *
 * 地支索引 → Grid 位置映射
 */
const GRID_POSITIONS: { index: number; gridArea: string }[] = [
  { index: 6,  gridArea: '1 / 1 / 2 / 2' },  // 巳
  { index: 7,  gridArea: '1 / 2 / 2 / 3' },  // 午
  { index: 8,  gridArea: '1 / 3 / 2 / 4' },  // 未
  { index: 9,  gridArea: '1 / 4 / 2 / 5' },  // 申
  { index: 5,  gridArea: '2 / 1 / 3 / 2' },  // 辰
  { index: 10, gridArea: '2 / 4 / 3 / 5' },  // 酉
  { index: 4,  gridArea: '3 / 1 / 4 / 2' },  // 卯
  { index: 11, gridArea: '3 / 4 / 4 / 5' },  // 戌
  { index: 3,  gridArea: '4 / 1 / 5 / 2' },  // 寅
  { index: 2,  gridArea: '4 / 2 / 5 / 3' },  // 丑
  { index: 1,  gridArea: '4 / 3 / 5 / 4' },  // 子
  { index: 0,  gridArea: '4 / 4 / 5 / 5' },  // 亥
];

export function TianDiPan({ liuRenData }: TianDiPanProps) {
  if (!liuRenData?.tiandipan) return null;

  const { tiandipan, siKe, dateInfo } = liuRenData;
  const diPanData = tiandipan['地盘'] || {};
  const tianPanData = tiandipan['天盘'] || {};
  const tianJiangData = tiandipan['天将'] || {};

  // 从 dateInfo 中提取日干支来标记日/辰
  const riGan = dateInfo?.bazi?.[2]?.[0] || '';
  const riZhi = dateInfo?.bazi?.[2]?.[1] || '';

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="rounded-xl border border-border/50 overflow-hidden shadow-lg shadow-black/20">
        <div className="tiandipan-grid">
          {/* 外圈十二宫 */}
          {GRID_POSITIONS.map(({ index, gridArea }, i) => {
            const zhi = DIZHI_ORDER[index];
            const diPan = diPanData[zhi] || zhi;
            const tianPan = tianPanData[zhi] || '';
            const tianJiang = tianJiangData[zhi] || '';

            // 标记日干/日支所在宫
            let label: string | undefined;
            if (zhi === riZhi) label = '辰';

            return (
              <motion.div
                key={zhi}
                style={{ gridArea }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.03,
                  ease: 'easeOut',
                }}
              >
                <GongCell
                  diPan={diPan}
                  tianPan={tianPan}
                  tianJiang={tianJiang}
                  position={zhi}
                  label={label}
                  isHighlight={zhi === riZhi}
                />
              </motion.div>
            );
          })}

          {/* 中心区域 — 四课 */}
          <div className="tiandipan-center flex items-center justify-center p-3 bg-card/30 border border-border/20">
            {siKe ? (
              <div className="w-full">
                <div className="text-center mb-2">
                  <span className="text-[10px] font-semibold text-[var(--color-gold)] uppercase tracking-wider">
                    {riGan && `日干：${riGan}`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['一课', '二课', '三课', '四课'] as const).map((ke) => {
                    const keData = siKe[ke] || [];
                    return (
                      <div key={ke} className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-muted-foreground">{ke}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold font-serif text-foreground">
                            {keData[0] || '—'}
                          </span>
                          <div className="w-6 h-px bg-border/50 my-0.5" />
                          <span className="text-sm font-bold font-serif text-muted-foreground">
                            {keData[1] || '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">四课</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
