import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Hash } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';
import { JsonExportPanel } from '@/components/JsonExportPanel';
import {
  getXiaoLiuRenEngine,
  listXiaoLiuRenEngines,
} from '@/engines/registry';
import type { XiaoLiuRenChart, XiaoLiuRenEngineId } from '@/engines/types';

/** 六宫吉凶底色（大安/速喜/小吉为吉） */
const GONG_TONE: Record<string, string> = {
  大安: 'from-green-500/15',
  留连: 'from-slate-500/15',
  速喜: 'from-red-400/15',
  赤口: 'from-orange-500/15',
  小吉: 'from-sky-500/15',
  空亡: 'from-purple-500/15',
};

/**
 * 小六壬（马前课）Tab
 * 自含起课控件：时间起课 / 数字起课，支持引擎切换
 */
export function XiaoLiuRenTab() {
  const engines = listXiaoLiuRenEngines();
  const [engineId, setEngineId] = useState<XiaoLiuRenEngineId>(engines[0]?.id ?? 'lookfate');
  const [chart, setChart] = useState<XiaoLiuRenChart | null>(null);
  const [numInput, setNumInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const castByTime = (engId: XiaoLiuRenEngineId = engineId) => {
    try {
      setChart(getXiaoLiuRenEngine(engId).byTime(new Date()));
      setError(null);
    } catch (e) {
      console.error('小六壬起课失败:', e);
      setError(e instanceof Error ? e.message : '起课失败');
    }
  };

  const castByNumber = () => {
    const num = Number.parseInt(numInput, 10);
    if (!Number.isFinite(num) || num <= 0) {
      setError('请输入正整数');
      return;
    }
    try {
      setChart(getXiaoLiuRenEngine(engineId).byNumber(num, new Date()));
      setError(null);
    } catch (e) {
      console.error('小六壬起课失败:', e);
      setError(e instanceof Error ? e.message : '起课失败');
    }
  };

  // 进入 Tab 自动按当前时间起一课
  useEffect(() => {
    castByTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (engines.length === 0) {
    return <p className="text-sm text-muted-foreground">暂无可用的小六壬引擎</p>;
  }

  return (
    <div className="space-y-6">
      {/* 起课控件 */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => castByTime()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-gold)]/15 text-[var(--color-gold)] border border-[var(--color-gold)]/25 text-sm hover:bg-[var(--color-gold)]/25 transition-colors"
          >
            <Clock3 className="w-4 h-4" />
            当下时间起课
          </button>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              value={numInput}
              onChange={(e) => setNumInput(e.target.value)}
              placeholder="任意数字"
              className="w-28 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              onClick={castByNumber}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-sm transition-colors"
            >
              <Hash className="w-4 h-4" />
              数字起课
            </button>
          </div>
          {engines.length > 1 && (
            <select
              value={engineId}
              onChange={(e) => {
                const id = e.target.value as XiaoLiuRenEngineId;
                setEngineId(id);
                castByTime(id);
              }}
              className="ml-auto px-2 py-1.5 rounded-lg bg-secondary text-sm outline-none"
              title="切换小六壬引擎"
            >
              {engines.map((e) => (
                <option key={e.id} value={e.id}>{e.school}</option>
              ))}
            </select>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {chart && (
          <p className="text-xs text-muted-foreground">
            {chart.inputSummary} · {chart.meta.school}（{chart.meta.engineName}）
          </p>
        )}
      </div>

      {/* 六宫 */}
      {chart && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {chart.palaces.map((palace, index) => (
            <motion.div
              key={`${palace.gong}-${index}`}
              className={cn(
                'relative glass-card rounded-xl p-4 flex flex-col items-center gap-1.5',
                'bg-gradient-to-b to-transparent',
                GONG_TONE[palace.gong] ?? 'from-secondary/20',
                (palace.isHourPalace || palace.sanGongRole === '结果') &&
                  'ring-1 ring-[var(--color-gold)]/60',
              )}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              {/* 落宫标记 */}
              {(palace.isDayPalace || palace.isHourPalace || palace.sanGongRole) && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 flex gap-1">
                  {palace.isDayPalace && (
                    <span className="text-[8px] bg-secondary text-muted-foreground px-1 py-px rounded-b">日</span>
                  )}
                  {palace.isHourPalace && (
                    <span className="text-[8px] bg-[var(--color-gold)] text-black px-1 py-px rounded-b font-medium">时</span>
                  )}
                  {palace.sanGongRole && (
                    <span className="text-[8px] bg-blue-500/80 text-white px-1 py-px rounded-b">{palace.sanGongRole}</span>
                  )}
                </div>
              )}

              <span className="text-xl font-bold font-serif text-foreground mt-1">
                {palace.gong}
              </span>
              <span className={cn('text-sm font-serif', getWuxingColorClass(palace.branch))}>
                {palace.branch}
              </span>
              <div className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground">
                {palace.kin && <span>{palace.kin}</span>}
                {palace.deity && <span className={getWuxingColorClass(palace.deity)}>{palace.deity}</span>}
                {palace.star && <span>{palace.star}</span>}
                {palace.wangShuai && <span className="text-amber-400/80">{palace.wangShuai}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 课象简断 */}
      {chart?.summary && (
        <div className="glass-card rounded-xl p-4">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wider">课象</h3>
          <p className="text-sm leading-relaxed">{chart.summary}</p>
        </div>
      )}

      {/* 数据导出 */}
      {chart && (
        <div className="glass-card rounded-xl p-4">
          <h2 className="text-sm font-semibold text-[var(--color-gold)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[var(--color-gold)]" />
            数据导出 & AI 分析
          </h2>
          <JsonExportPanel data={chart} title="小六壬" />
        </div>
      )}
    </div>
  );
}
