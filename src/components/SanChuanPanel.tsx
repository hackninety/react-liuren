import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ScrollText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { getWuxingColorClass } from '@/utils/liuren-colors';
import type { ChuanItem, SanChuanInfo } from '@/engines/types';
import type { KetiDetailResult } from '@/plugins/keti-detail';
import { GuFaRefs } from './GuFaRefs';
import { KeJingRefs } from './KeJingRefs';

export interface SanChuanCompare {
  school: string;
  chu: string;
  zhong: string;
  mo: string;
}

/** 古法（占事略決）判定路径步骤，来自 chart.extras.path */
interface GuFaStep {
  fa: string;
  note: string;
  ref: string;
}

/** 卅六卦命中，来自 chart.extras.gua36 */
interface GuFaGua {
  name: string;
  certainty: string;
  why: string;
}

/** 毕法命中，来自 chart.extras.bifa（lrdq-ts-lib） */
interface BifaHitView {
  no: number;
  name: string;
  fu: string;
  certainty: string;
  why: string;
}

interface SanChuanPanelProps {
  sanChuan: SanChuanInfo;
  /** 课体细分插件结果（课名 + 细分标签） */
  ketiDetail?: KetiDetailResult;
  /** 其余流派引擎的三传（对照互证，多引擎并排） */
  compares?: SanChuanCompare[];
  /** 引擎 extras（用于古法判定路径 / 卅六卦展示） */
  extras?: Record<string, unknown>;
}

function readGuFaPath(extras?: Record<string, unknown>): GuFaStep[] {
  if (!Array.isArray(extras?.path)) return [];
  return (extras.path as unknown[]).filter(
    (s): s is GuFaStep => !!s && typeof (s as GuFaStep).fa === 'string' && typeof (s as GuFaStep).note === 'string',
  );
}

function readGuFaGua(extras?: Record<string, unknown>): GuFaGua[] {
  if (!Array.isArray(extras?.gua36)) return [];
  return (extras.gua36 as unknown[]).filter(
    (g): g is GuFaGua => !!g && typeof (g as GuFaGua).name === 'string',
  );
}

function readGuFaRefs(extras?: Record<string, unknown>): string[] {
  if (!Array.isArray(extras?.refs)) return [];
  return (extras.refs as unknown[]).filter((r): r is string => typeof r === 'string');
}

function readBifaHits(extras?: Record<string, unknown>): BifaHitView[] {
  if (!Array.isArray(extras?.bifa)) return [];
  return (extras.bifa as unknown[]).filter(
    (h): h is BifaHitView =>
      !!h && typeof (h as BifaHitView).no === 'number' && typeof (h as BifaHitView).fu === 'string',
  );
}

/** 应期候选，来自 chart.extras['ying-qi']（ying-qi 插件） */
interface YingQiView {
  candidates: { zhi: string; reasons: string[] }[];
  notes: string[];
}

function readYingQi(extras?: Record<string, unknown>): YingQiView | null {
  const v = extras?.['ying-qi'] as YingQiView | undefined;
  return v && Array.isArray(v.candidates) && v.candidates.length ? v : null;
}

/**
 * 三传展示面板
 */
const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八'];

export function SanChuanPanel({ sanChuan, ketiDetail, compares = [], extras }: SanChuanPanelProps) {
  const [pathOpen, setPathOpen] = useState(false);
  const [bifaOpen, setBifaOpen] = useState(false);
  const guFaPath = readGuFaPath(extras);
  const guFaGua = readGuFaGua(extras);
  const guFaRefs = readGuFaRefs(extras);
  const bifaHits = readBifaHits(extras);
  const yingQi = readYingQi(extras);
  const keJingNames = [sanChuan.keTi, sanChuan.method, ...(ketiDetail?.subTypes ?? [])].filter(
    (n): n is string => !!n,
  );
  const isSame = (c: SanChuanCompare) =>
    c.chu === sanChuan.chu.zhi && c.zhong === sanChuan.zhong.zhi && c.mo === sanChuan.mo.zhi;

  // 参与对照的流派总数（当前 + 其余引擎）与整体一致性
  const totalSchools = compares.length + 1;
  const allSame = compares.length > 0 && compares.every(isSame);
  const schoolWord = CN_NUM[totalSchools] ?? String(totalSchools);

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

      {/* 课体 →《課經》原文深链（lrdq-ts-lib/keju 惰性拉取） */}
      {keJingNames.length > 0 && <KeJingRefs key={keJingNames.join('|')} names={keJingNames} />}

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

      {/* 多流派三传对照 */}
      {compares.length > 0 && (
        <div className="space-y-1.5">
          {/* 整体一致性徽章 */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">三传对照（{schoolWord}派）：</span>
            {allSame ? (
              <span className="text-green-400 font-medium">✓ {schoolWord}派三传一致</span>
            ) : (
              <span
                className="text-amber-400 font-medium"
                title="贵人起法、涉害深浅、月将换将时机等古今流派差异可导致三传不同"
              >
                ⚠ 流派间三传存在差异
              </span>
            )}
          </div>
          {/* 各流派三传逐行 */}
          {compares.map((c) => (
            <div
              key={c.school}
              className="flex flex-wrap items-center gap-2 text-xs rounded-lg bg-secondary/20 border border-border/30 px-3 py-1.5"
            >
              <span className="text-muted-foreground">{c.school}：</span>
              <span className="font-serif font-semibold">
                {c.chu || '—'} → {c.zhong || '—'} → {c.mo || '—'}
              </span>
              {isSame(c) ? (
                <span className="text-green-400">✓ 与当前一致</span>
              ) : (
                <span className="text-amber-400">⚠ 与当前有别</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 应期候选（ying-qi 插件：机器可算候选支，悬停看来由） */}
      {yingQi && (
        <div className="rounded-lg bg-secondary/10 border border-border/30 px-3 py-2 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">应期候选（机器可算）：</span>
            {yingQi.candidates.map((cd) => (
              <span
                key={cd.zhi}
                title={cd.reasons.join('；')}
                className={cn(
                  'px-2 py-0.5 rounded-full border font-serif cursor-help bg-secondary/40 border-border/30',
                  getWuxingColorClass(cd.zhi),
                )}
              >
                {cd.zhi}
              </span>
            ))}
            <span className="text-muted-foreground/60">悬停看来由，取舍结合占事与类神旺衰</span>
          </div>
          {yingQi.notes.map((n) => (
            <div key={n} className="text-xs text-muted-foreground">
              注：{n}
            </div>
          ))}
        </div>
      )}

      {/* 古法（占事略決）：卅六卦命中 + 課用九法判定路径 + 本课原文引用 */}
      {(guFaGua.length > 0 || guFaPath.length > 0 || guFaRefs.length > 0) && (
        <div className="rounded-lg bg-secondary/10 border border-border/30 px-3 py-2 space-y-2">
          {guFaGua.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">卅六卦：</span>
              {guFaGua.map((g, i) => (
                <span
                  key={`${g.name}-${i}`}
                  title={g.why}
                  className={cn(
                    'px-2 py-0.5 rounded-full border font-serif',
                    g.certainty === 'exact'
                      ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-[var(--color-gold)]/25'
                      : 'bg-secondary/40 text-muted-foreground border-border/30',
                  )}
                >
                  {g.name}
                  {g.certainty !== 'exact' && <span className="opacity-70">（近似）</span>}
                </span>
              ))}
            </div>
          )}
          {guFaPath.length > 0 && (
            <div className="text-xs">
              <button
                onClick={() => setPathOpen((v) => !v)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>古法判定路径（{guFaPath.length} 步）</span>
                {pathOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {pathOpen && (
                <ol className="mt-2 space-y-1 list-decimal list-inside">
                  {guFaPath.map((step, i) => (
                    <li key={i} className="text-muted-foreground">
                      <span className="font-medium text-foreground">{step.fa}</span>
                      <span> — {step.note}</span>
                      {step.ref && <span className="opacity-60">（{step.ref}）</span>}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
          {guFaRefs.length > 0 && <GuFaRefs refs={guFaRefs} />}
        </div>
      )}

      {/* 毕法赋命中（《六壬大全》卷十一/十二，97/100 法机器检测） */}
      {bifaHits.length > 0 && (
        <div className="rounded-lg bg-secondary/10 border border-border/30 px-3 py-2 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">毕法命中（检测 97/100）：</span>
            {bifaHits.map((h) => (
              <span
                key={h.no}
                title={`${h.fu} — ${h.why}`}
                className={cn(
                  'px-2 py-0.5 rounded-full border font-serif',
                  h.certainty === 'exact'
                    ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-[var(--color-gold)]/25'
                    : 'bg-secondary/40 text-muted-foreground border-border/30',
                )}
              >
                {h.name}
                {h.certainty !== 'exact' && <span className="opacity-70">（近似）</span>}
              </span>
            ))}
          </div>
          <div className="text-xs">
            <button
              onClick={() => setBifaOpen((v) => !v)}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>断辞详情（{bifaHits.length} 条）</span>
              {bifaOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {bifaOpen && (
              <ul className="mt-2 space-y-1">
                {bifaHits.map((h) => (
                  <li key={h.no} className="text-muted-foreground">
                    <span className="text-foreground font-medium">第{h.no}法</span>
                    <span className="font-serif"> {h.fu}</span>
                    <span> — {h.why}</span>
                    <span className="opacity-60">（{h.certainty === 'exact' ? '确判' : '近似'}，全文见典籍库）</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
