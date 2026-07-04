import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Sun, Moon, Hexagon, Coins, TrendingUp, Compass } from 'lucide-react';
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
import { PluginToggles } from '@/components/PluginToggles';
import { XiaoLiuRenTab } from '@/components/XiaoLiuRenTab';
import type { SanChuanCompare } from '@/components/SanChuanPanel';
import {
  DEFAULT_DALIUREN_ENGINE_ID,
  getDaLiuRenEngine,
  listDaLiuRenEngines,
} from '@/engines/registry';
import { getJinKouJueByDate, getJinKouJueBySiZhu } from '@/engines/jinkoujue';
import { computeNianMing } from '@/engines/nianming';
import { applyPlugins } from '@/plugins';
import type { PluginContext } from '@/plugins/types';
import type { KetiDetailResult } from '@/plugins/keti-detail';
import type {
  DaLiuRenEngineId,
  JinKouJueChart,
  LiuRenChart,
  NianMingChart,
} from '@/engines/types';

type TabKey = 'liuren' | 'jinkouque' | 'xiaoliuren' | 'liunian';

/** 排盘输入（记忆最近一次输入，切换流派引擎时重算） */
type ChartInput =
  | { kind: 'date'; date: Date }
  | { kind: 'sizhu'; year: string; month: string; day: string; hour: string };

const TABS: { key: TabKey; label: string; icon: typeof Hexagon }[] = [
  { key: 'liuren', label: '大六壬', icon: Hexagon },
  { key: 'jinkouque', label: '金口诀', icon: Coins },
  { key: 'xiaoliuren', label: '小六壬', icon: Compass },
  { key: 'liunian', label: '流年', icon: TrendingUp },
];

const ENGINE_STORAGE_KEY = 'liuren-engine-id';

function loadEngineId(): DaLiuRenEngineId {
  try {
    const saved = localStorage.getItem(ENGINE_STORAGE_KEY);
    if (saved && listDaLiuRenEngines().some((e) => e.id === saved)) {
      return saved as DaLiuRenEngineId;
    }
  } catch {
    // ignore
  }
  return DEFAULT_DALIUREN_ENGINE_ID;
}

/** 按输入与引擎排盘并应用插件；引擎不支持四柱时回退默认引擎 */
function computeChart(
  input: ChartInput,
  engineId: DaLiuRenEngineId,
  ctx: PluginContext,
): { chart: LiuRenChart; notice: string | null } {
  let engine = getDaLiuRenEngine(engineId);
  let notice: string | null = null;
  if (input.kind === 'sizhu' && !engine.bySiZhu) {
    const fallback = getDaLiuRenEngine(DEFAULT_DALIUREN_ENGINE_ID);
    notice = `「${engine.school}」引擎暂不支持四柱直输，本次已用「${fallback.school}」排盘`;
    engine = fallback;
  }
  const chart =
    input.kind === 'date'
      ? engine.byDate(input.date)
      : engine.bySiZhu!(input.year, input.month, input.day, input.hour);
  return { chart: applyPlugins(chart, ctx), notice };
}

/** 用另一流派引擎对同一输入排盘，取三传做对照互证 */
function buildCompare(input: ChartInput, mainEngineId: DaLiuRenEngineId): SanChuanCompare | null {
  const other = listDaLiuRenEngines().find((e) => e.id !== mainEngineId);
  if (!other) return null;
  try {
    let chart: LiuRenChart | null = null;
    if (input.kind === 'date') {
      chart = other.byDate(input.date);
    } else if (other.bySiZhu) {
      chart = other.bySiZhu(input.year, input.month, input.day, input.hour);
    }
    if (!chart) return null;
    const { chu, zhong, mo } = chart.sanChuan;
    if (!chu.zhi && !zhong.zhi && !mo.zhi) return null;
    return { school: other.school, chu: chu.zhi, zhong: zhong.zhi, mo: mo.zhi };
  } catch (error) {
    console.warn('对照引擎排盘失败:', error);
    return null;
  }
}

/** 首屏初始排盘（渲染前同步计算，避免 effect 级联渲染与加载闪烁） */
function computeInitialState() {
  const input: ChartInput = { kind: 'date', date: new Date() };
  const engId = loadEngineId();
  try {
    const { chart, notice } = computeChart(input, engId, {});
    return { input, engId, chart, notice, compare: buildCompare(input, engId) };
  } catch (error) {
    console.error('大六壬排盘失败:', error);
    return { input, engId, chart: null, notice: null, compare: null };
  }
}

function App() {
  const [initial] = useState(computeInitialState);
  const [activeTab, setActiveTab] = useState<TabKey>('liuren');
  const [liuRenChart, setLiuRenChart] = useState<LiuRenChart | null>(initial.chart);
  const [jkjData, setJkjData] = useState<JinKouJueChart | null>(null);
  const [liuNianData, setLiuNianData] = useState<NianMingChart | null>(null);

  const [engineId, setEngineId] = useState<DaLiuRenEngineId>(initial.engId);
  const [engineNotice, setEngineNotice] = useState<string | null>(initial.notice);
  const [compareChuan, setCompareChuan] = useState<SanChuanCompare | null>(initial.compare);
  const [pluginCtx, setPluginCtx] = useState<PluginContext>({});
  const [lastInput, setLastInput] = useState<ChartInput>(initial.input);

  // 根据系统时间自动判断：18:00~06:00 为暗色
  const [isDark, setIsDark] = useState(() => {
    const h = new Date().getHours();
    return h >= 18 || h < 6;
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    initial.input.kind === 'date' ? initial.input.date : new Date(),
  );
  const [trueSolarInfo, setTrueSolarInfo] = useState<{ offsetMinutes: number; longitude: number; trueSolarDate: Date } | null>(null);

  // 同步 HTML class
  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle('dark', isDark);
    html.classList.toggle('light', !isDark);
  }, [isDark]);

  const recalc = useCallback((input: ChartInput, engId: DaLiuRenEngineId, ctx: PluginContext) => {
    try {
      const { chart, notice } = computeChart(input, engId, ctx);
      setLiuRenChart(chart);
      setEngineNotice(notice);
      setCompareChuan(buildCompare(input, engId));
      setLastInput(input);
      if (input.kind === 'date') {
        setSelectedDate(input.date);
        setTrueSolarInfo(null);
      }
    } catch (error) {
      console.error('大六壬排盘失败:', error);
    }
  }, []);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // 流派引擎切换：记忆选择并按最近输入重算
  const handleEngineChange = (id: DaLiuRenEngineId) => {
    setEngineId(id);
    try {
      localStorage.setItem(ENGINE_STORAGE_KEY, id);
    } catch {
      // ignore
    }
    recalc(lastInput, id, pluginCtx);
  };

  // 自定义排盘
  const handleDateConfirm = (options: LiuRenOptions) => {
    const ctx: PluginContext = {
      birthYear: options.birthDate?.getFullYear(),
      gender: options.gender,
      chartYear: options.mode === 'date' ? options.date.getFullYear() : undefined,
    };
    setPluginCtx(ctx);

    // 大六壬
    if (options.mode === 'date') {
      recalc({ kind: 'date', date: options.date }, engineId, ctx);
    } else if (options.yearZhu && options.monthZhu && options.dayZhu && options.hourZhu) {
      recalc(
        {
          kind: 'sizhu',
          year: options.yearZhu,
          month: options.monthZhu,
          day: options.dayZhu,
          hour: options.hourZhu,
        },
        engineId,
        ctx,
      );
    }

    // 金口诀（如果有地分）
    if (options.diFen) {
      try {
        if (options.mode === 'date') {
          setJkjData(getJinKouJueByDate(options.date, options.diFen));
        } else if (options.yearZhu && options.monthZhu && options.dayZhu && options.hourZhu) {
          setJkjData(getJinKouJueBySiZhu(
            options.yearZhu,
            options.monthZhu,
            options.dayZhu,
            options.hourZhu,
            options.diFen,
          ));
        }
      } catch (error) {
        console.error('金口诀排盘失败:', error);
      }
    }

    // 流年（如果有出生日期）
    if (options.birthDate) {
      try {
        setLiuNianData(computeNianMing(options.birthDate, options.gender ?? '男'));
      } catch (error) {
        console.error('流年计算失败:', error);
      }
    }
    setPickerOpen(false);
  };

  const engines = listDaLiuRenEngines();
  const currentEngine = getDaLiuRenEngine(engineId);

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
            {/* 流派引擎切换 */}
            {engines.length > 1 ? (
              <select
                value={engineId}
                onChange={(e) => handleEngineChange(e.target.value as DaLiuRenEngineId)}
                className="px-2 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm outline-none border border-transparent focus:border-[var(--color-gold)]/40"
                title="切换流派引擎"
              >
                {engines.map((e) => (
                  <option key={e.id} value={e.id}>{e.school}</option>
                ))}
              </select>
            ) : (
              <span className="px-2 py-1.5 rounded-lg bg-secondary/50 text-xs text-muted-foreground" title="流派引擎">
                {currentEngine.school}
              </span>
            )}
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
        {/* 引擎回退提示 */}
        {engineNotice && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs">
            {engineNotice}
          </div>
        )}
        {/* 插件开关（仅大六壬页） */}
        {activeTab === 'liuren' && (
          <PluginToggles onChange={() => recalc(lastInput, engineId, pluginCtx)} />
        )}
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
              {liuRenChart && (
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
                  <BasicInfoPanel chart={liuRenChart} trueSolarInfo={trueSolarInfo} originalDate={selectedDate} />
                </motion.div>
              )}

              {/* 天地盘 */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="w-full max-w-xl">
                  {liuRenChart ? (
                    <TianDiPan chart={liuRenChart} />
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
              {liuRenChart && liuRenChart.siKe.some((ke) => ke.shang || ke.tianJiang) && (
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
                  <SiKePanel siKe={liuRenChart.siKe} bazi={liuRenChart.dateInfo.bazi} />
                </motion.div>
              )}

              {/* 三传 */}
              {liuRenChart && (liuRenChart.sanChuan.keTi || liuRenChart.sanChuan.chu.zhi) && (
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
                  <SanChuanPanel
                    sanChuan={liuRenChart.sanChuan}
                    ketiDetail={liuRenChart.extras['keti-detail'] as KetiDetailResult | undefined}
                    compare={compareChuan ?? undefined}
                  />
                </motion.div>
              )}

              {/* 建除 + 遁干/初建/伏建 */}
              {liuRenChart && liuRenChart.gong.some((g) => g.dunGan || g.chuJian || g.fuJian || g.jianChu) && (
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
                  <JianChuPanel gong={liuRenChart.gong} />
                </motion.div>
              )}

              {/* 阴阳贵人 */}
              {liuRenChart?.yinYangGuiRen && (
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
                  <YinYangGuiRenPanel yinYangGuiRen={liuRenChart.yinYangGuiRen} />
                </motion.div>
              )}

              {/* 神煞 */}
              {liuRenChart && liuRenChart.shenSha.length > 0 && (
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
                  <ShenShaPanel shenSha={liuRenChart.shenSha} />
                </motion.div>
              )}

              {/* 数据导出 */}
              {liuRenChart && (
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
                  <JsonExportPanel data={liuRenChart} title="大六壬" />
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

          {activeTab === 'xiaoliuren' && (
            <motion.div
              key="xiaoliuren"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <XiaoLiuRenTab />
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
        大六壬排盘系统 · 多引擎插件架构 · 当前流派：{currentEngine.school}
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
