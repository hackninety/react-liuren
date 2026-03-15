import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Sun, Moon, Hexagon, Coins, TrendingUp } from 'lucide-react';
import { TianDiPan } from '@/components/TianDiPan';
import { SiKePanel } from '@/components/SiKePanel';
import { SanChuanPanel } from '@/components/SanChuanPanel';
import { BasicInfoPanel } from '@/components/BasicInfoPanel';
import { JianChuPanel } from '@/components/JianChuPanel';
import { ShenShaPanel } from '@/components/ShenShaPanel';
import { JinKouJuePanel } from '@/components/JinKouJuePanel';
import { LiuNianPanel } from '@/components/LiuNianPanel';
import { YinYangGuiRenPanel } from '@/components/YinYangGuiRenPanel';
import { JsonExportPanel } from '@/components/JsonExportPanel';
import { DatePickerDialog, type LiuRenOptions } from '@/components/DatePickerDialog';
import {
  getLiuRenByDate,
  getLiuRenBySiZhu,
  getJinKouJueByDate,
  getJinKouJueBySiZhu,
  getNianMing,
} from 'liuren-ts-lib';

type TabKey = 'liuren' | 'jinkouque' | 'liunian';

const TABS: { key: TabKey; label: string; icon: typeof Hexagon }[] = [
  { key: 'liuren', label: '大六壬', icon: Hexagon },
  { key: 'jinkouque', label: '金口诀', icon: Coins },
  { key: 'liunian', label: '流年', icon: TrendingUp },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('liuren');
  const [liuRenData, setLiuRenData] = useState<any>(null);
  const [jkjData, setJkjData] = useState<any>(null);
  const [liuNianData, setLiuNianData] = useState<any>(null);

  // 根据系统时间自动判断：18:00~06:00 为暗色
  const [isDark, setIsDark] = useState(() => {
    const h = new Date().getHours();
    return h >= 18 || h < 6;
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [trueSolarInfo, setTrueSolarInfo] = useState<{ offsetMinutes: number; longitude: number; trueSolarDate: Date } | null>(null);

  // 同步 HTML class
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('dark', isDark);
    html.classList.toggle('light', !isDark);
  }, [isDark]);

  // 默认排盘：大六壬
  const doCalculate = useCallback((date: Date) => {
    try {
      const result = getLiuRenByDate(date);
      setLiuRenData(result);
      setSelectedDate(date);
      setTrueSolarInfo(null);
    } catch (error) {
      console.error('大六壬排盘失败:', error);
    }
  }, []);

  useEffect(() => {
    doCalculate(new Date());
  }, [doCalculate]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // 自定义排盘
  const handleDateConfirm = (options: LiuRenOptions) => {
    try {
      // 大六壬
      if (options.mode === 'date') {
        const result = getLiuRenByDate(options.date);
        setLiuRenData(result);
        setSelectedDate(options.date);
      } else {
        // 四柱模式
        if (options.yearZhu && options.monthZhu && options.dayZhu && options.hourZhu) {
          const result = getLiuRenBySiZhu(
            options.yearZhu,
            options.monthZhu,
            options.dayZhu,
            options.hourZhu,
          );
          setLiuRenData(result);
        }
      }

      // 金口诀（如果有地分）
      if (options.diFen) {
        try {
          if (options.mode === 'date') {
            const jkjResult = getJinKouJueByDate(options.date, options.diFen);
            setJkjData(jkjResult);
          } else if (options.yearZhu && options.monthZhu && options.dayZhu && options.hourZhu) {
            const jkjResult = getJinKouJueBySiZhu(
              options.yearZhu,
              options.monthZhu,
              options.dayZhu,
              options.hourZhu,
              options.diFen,
            );
            setJkjData(jkjResult);
          }
        } catch (error) {
          console.error('金口诀排盘失败:', error);
        }
      }

      // 流年（如果有出生日期）
      if (options.birthDate) {
        try {
          const liuNianResult = getNianMing(options.birthDate, options.gender || 1);
          setLiuNianData(liuNianResult);
        } catch (error) {
          console.error('流年计算失败:', error);
        }
      }
    } catch (error) {
      console.error('排盘计算失败:', error);
    }
    setPickerOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/20 flex items-center justify-center">
              <span className="text-[var(--color-gold)] font-serif font-bold text-sm">壬</span>
            </div>
            <h1 className="text-lg font-bold font-serif tracking-widest text-foreground">
              大六壬
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="切换主题"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm"
            >
              <CalendarDays className="w-4 h-4" />
              <span>自定义排盘</span>
            </button>
          </div>
        </div>
        {/* 金色底部装饰线 */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-gold)]/30 to-transparent" />
      </header>

      {/* Tab 导航 */}
      <div className="max-w-5xl w-full mx-auto px-4 pt-4">
        <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'text-[var(--color-gold)] font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-card rounded-lg shadow-sm border border-border/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 主体 */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'liuren' && (
            <motion.div
              key="liuren"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* 基础信息 */}
              <motion.div
                className="glass-card rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                  基础信息
                </h2>
                <BasicInfoPanel liuRenData={liuRenData} trueSolarInfo={trueSolarInfo} originalDate={selectedDate} />
              </motion.div>

              {/* 天地盘 */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="w-full max-w-xl">
                  {liuRenData ? (
                    <TianDiPan liuRenData={liuRenData} />
                  ) : (
                    <div className="glass-card rounded-xl min-h-[400px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-muted-foreground text-sm">正在起课...</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* 四课（独立面板） */}
              {liuRenData?.siKe && (
                <motion.div
                  className="glass-card rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                    四课
                  </h2>
                  <SiKePanel siKe={liuRenData.siKe} dateInfo={liuRenData.dateInfo} />
                </motion.div>
              )}

              {/* 三传 */}
              {liuRenData?.sanChuan && (
                <motion.div
                  className="glass-card rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                    三传
                  </h2>
                  <SanChuanPanel sanChuan={liuRenData.sanChuan} />
                </motion.div>
              )}

              {/* 建除 + 遁干/初建/伏建 */}
              {(liuRenData?.dunGan || liuRenData?.chuJian || liuRenData?.fuJian || liuRenData?.jianChu) && (
                <motion.div
                  className="glass-card rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                >
                  <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                    建除 · 遁干
                  </h2>
                  <JianChuPanel
                    dunGan={liuRenData.dunGan}
                    chuJian={liuRenData.chuJian}
                    fuJian={liuRenData.fuJian}
                    jianChu={liuRenData.jianChu}
                  />
                </motion.div>
              )}

              {/* 阴阳贵人 */}
              {liuRenData?.yinYangGuiRen && (
                <motion.div
                  className="glass-card rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.28 }}
                >
                  <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                    阴阳贵人
                  </h2>
                  <YinYangGuiRenPanel yinYangGuiRen={liuRenData.yinYangGuiRen} />
                </motion.div>
              )}

              {/* 神煞 */}
              {liuRenData?.shenSha && (
                <motion.div
                  className="glass-card rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                    神煞
                  </h2>
                  <ShenShaPanel shenSha={liuRenData.shenSha} />
                </motion.div>
              )}

              {/* 数据导出 */}
              {liuRenData && (
                <motion.div
                  className="glass-card rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                >
                  <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                    数据导出 & AI 分析
                  </h2>
                  <JsonExportPanel data={liuRenData} title="大六壬" />
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'jinkouque' && (
            <motion.div
              key="jinkouque"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <motion.div
                className="glass-card rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                  金口诀排盘
                </h2>
                <JinKouJuePanel jkjData={jkjData} />
              </motion.div>

              {jkjData && (
                <motion.div
                  className="glass-card rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                    数据导出 & AI 分析
                  </h2>
                  <JsonExportPanel data={jkjData} title="金口诀" />
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'liunian' && (
            <motion.div
              key="liunian"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <motion.div
                className="glass-card rounded-xl p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
                  虚岁流年
                </h2>
                <LiuNianPanel liuNianData={liuNianData} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部 */}
      <footer className="text-center py-4 text-xs text-muted-foreground/50 border-t border-border/30">
        大六壬排盘系统 · liuren-ts-lib v1.0
      </footer>

      {/* 自定义排盘弹窗 */}
      <DatePickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={handleDateConfirm}
        currentDate={selectedDate}
      />
    </div>
  );
}

export default App;
