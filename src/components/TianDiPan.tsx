import { motion } from 'framer-motion';
import { GongCell } from './GongCell';
import { DIZHI_ORDER } from '@/utils/liuren-colors';

interface TianDiPanProps {
  liuRenData: any;
}

/**
 * 天地盘 4×4 方盘布局
 *
 * ShiErGong 使用数字索引 0-11（0=子, 1=丑, ... 11=亥）
 *
 * 布局对应（地支索引）：
 *   | 巳(5) | 午(6)  | 未(7) | 申(8)  |
 *   | 辰(4) |  中心区  | 酉(9)  |
 *   | 卯(3) |  四课   | 戌(10) |
 *   | 寅(2) | 丑(1)  | 子(0) | 亥(11) |
 */
const GRID_POSITIONS: { dizhiIndex: number; gridArea: string }[] = [
  { dizhiIndex: 5,  gridArea: '1 / 1 / 2 / 2' },  // 巳
  { dizhiIndex: 6,  gridArea: '1 / 2 / 2 / 3' },  // 午
  { dizhiIndex: 7,  gridArea: '1 / 3 / 2 / 4' },  // 未
  { dizhiIndex: 8,  gridArea: '1 / 4 / 2 / 5' },  // 申
  { dizhiIndex: 4,  gridArea: '2 / 1 / 3 / 2' },  // 辰
  { dizhiIndex: 9,  gridArea: '2 / 4 / 3 / 5' },  // 酉
  { dizhiIndex: 3,  gridArea: '3 / 1 / 4 / 2' },  // 卯
  { dizhiIndex: 10, gridArea: '3 / 4 / 4 / 5' },  // 戌
  { dizhiIndex: 2,  gridArea: '4 / 1 / 5 / 2' },  // 寅
  { dizhiIndex: 1,  gridArea: '4 / 2 / 5 / 3' },  // 丑
  { dizhiIndex: 0,  gridArea: '4 / 3 / 5 / 4' },  // 子
  { dizhiIndex: 11, gridArea: '4 / 4 / 5 / 5' },  // 亥
];

export function TianDiPan({ liuRenData }: TianDiPanProps) {
  if (!liuRenData?.tiandipan) return null;

  const { tiandipan, siKe, dateInfo } = liuRenData;
  const diPanData = tiandipan['地盘'] || {};
  const tianPanData = tiandipan['天盘'] || {};
  const tianJiangData = tiandipan['天将'] || {};

  // dateInfo.bazi 是空格分隔字符串："丙午 辛卯 戊子 辛酉"
  const baziArr = (dateInfo?.bazi || '').split(' ');
  const riZhu = baziArr[2] || '';
  const riGan = riZhu.charAt(0);
  const riZhi = riZhu.charAt(1);
  // 日支在 DIZHI_ORDER 中的索引
  const riZhiIndex = DIZHI_ORDER.indexOf(riZhi);

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
          {GRID_POSITIONS.map(({ dizhiIndex, gridArea }, i) => {
            const zhi = DIZHI_ORDER[dizhiIndex];
            const diPan = diPanData[dizhiIndex] || zhi;
            const tianPan = tianPanData[dizhiIndex] || '';
            const tianJiang = tianJiangData[dizhiIndex] || '';

            // 标记日支所在宫
            let label: string | undefined;
            if (dizhiIndex === riZhiIndex) label = '辰';

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
                  isHighlight={dizhiIndex === riZhiIndex}
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
                    {riGan && `日干：${riGan}　日支：${riZhi}`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {(['一课', '二课', '三课', '四课'] as const).map((ke) => {
                    // siKe 每课格式：["上神关系", "天将"]
                    const keData = siKe[ke] || [];
                    return (
                      <div key={ke} className="flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-muted-foreground">{ke}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold font-serif text-foreground">
                            {keData[0] || '—'}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {keData[1] || ''}
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
