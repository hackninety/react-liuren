import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, FileJson, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { chartToMarkdown } from '@/utils/chart-markdown';
import { ZHANSHI_TOPICS, sliceDocSection, zhanShiCaseChapters } from '@/utils/zhanshi-topics';

interface JsonExportPanelProps {
  data: unknown;
  title?: string;
}

/** 剔除 extras.aiPrompt（长提示词，已有专用按钮，避免污染数据视图/文件） */
const jsonReplacer = (key: string, value: unknown) => (key === 'aiPrompt' ? undefined : value);

interface KeJingLike {
  name: string;
  book: string;
  juan: number;
  text: string;
}

interface LeiShenLike {
  kind: string;
  name: string;
  zhi?: string;
  brief: string;
}

/** 大六壬盘的类神检索目标：三传/干支上天将 + 月将支 */
function leiShenTargets(d: unknown): { jiangs: string[]; yueJiang?: string } {
  const c = d as {
    sanChuan?: { chu?: { tianJiang?: string }; zhong?: { tianJiang?: string }; mo?: { tianJiang?: string } };
    siKe?: { tianJiang?: string }[];
    dateInfo?: { yueJiang?: string };
    extras?: Record<string, unknown>;
  };
  if (!c || typeof c !== 'object' || !c.sanChuan || !c.extras) return { jiangs: [] };
  const jiangs = [
    c.sanChuan.chu?.tianJiang, c.sanChuan.zhong?.tianJiang, c.sanChuan.mo?.tianJiang,
    c.siKe?.[0]?.tianJiang, c.siKe?.[2]?.tianJiang,
  ].filter((j): j is string => !!j);
  return { jiangs, yueJiang: c.dateInfo?.yueJiang };
}

/** 大六壬盘形（课体名可深链课体节库）判定 */
function liuRenNames(d: unknown): string[] {
  const c = d as {
    sanChuan?: { keTi?: string; method?: string };
    extras?: Record<string, unknown>;
  };
  if (!c || typeof c !== 'object' || !c.sanChuan || !c.extras) return [];
  const kd = c.extras['keti-detail'] as { subTypes?: string[] } | undefined;
  return [c.sanChuan.keTi, c.sanChuan.method, ...(kd?.subTypes ?? [])].filter(
    (n): n is string => !!n,
  );
}

/**
 * 数据导出 & AI 分析面板
 * 支持 JSON / Markdown 双格式：复制或导出文件（MD 更紧凑省 token，AI 可直接阅读），
 * 两者均完整记录全盘信息。大六壬盘导出前异步补挂 extras.kejing
 * （課經/心鏡课体原文引，lrdq-ts-lib/keju 惰性拉取），MD/JSON/AI Prompt 均携带。
 */
export function JsonExportPanel({ data, title = '排盘数据' }: JsonExportPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [format, setFormat] = useState<'md' | 'json'>('md');
  const [kejing, setKejing] = useState<{ src: unknown; entries: KeJingLike[] } | null>(null);
  const [leishen, setLeishen] = useState<{ src: unknown; entries: LeiShenLike[] } | null>(null);
  // 占事定向（localStorage 记忆；仅大六壬盘展示）
  const [topicId, setTopicId] = useState(() => {
    try {
      return localStorage.getItem('liuren-zhanshi-topic') ?? 'general';
    } catch {
      return 'general';
    }
  });
  const pickTopic = (id: string) => {
    setTopicId(id);
    try {
      localStorage.setItem('liuren-zhanshi-topic', id);
    } catch {
      // 忽略持久化失败
    }
  };

  useEffect(() => {
    const names = liuRenNames(data);
    if (!names.length) return;
    let live = true;
    import('lrdq-ts-lib/keju')
      .then((m) => {
        if (live) setKejing({ src: data, entries: m.findKeJing(names) });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [data]);

  useEffect(() => {
    const { jiangs, yueJiang } = leiShenTargets(data);
    if (!jiangs.length && !yueJiang) return;
    let live = true;
    import('lrdq-ts-lib/leishen')
      .then((m) => {
        if (!live) return;
        const out: LeiShenLike[] = [];
        if (yueJiang) {
          const e = m.findYueJiang(yueJiang);
          if (e) out.push({ kind: e.kind, name: e.name, zhi: e.zhi, brief: e.brief });
        }
        const seen = new Set<string>();
        for (const j of jiangs) {
          const e = m.findTianJiang(j);
          if (e && !seen.has(e.name)) {
            seen.add(e.name);
            out.push({ kind: e.kind, name: e.name, brief: e.brief });
          }
        }
        if (out.length) setLeishen({ src: data, entries: out });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [data]);

  // 课体原文引/类神就绪且对应当前盘时并入导出数据（extras.kejing / extras.leishen）
  const exportData = useMemo(() => {
    if (!data) return data;
    const extra: Record<string, unknown> = {};
    if (kejing?.src === data && kejing.entries.length) extra.kejing = kejing.entries;
    if (leishen?.src === data && leishen.entries.length) extra.leishen = leishen.entries;
    if (!Object.keys(extra).length) return data;
    const c = data as { extras?: Record<string, unknown> };
    return { ...c, extras: { ...c.extras, ...extra } };
  }, [data, kejing, leishen]);

  const jsonStr = useMemo(
    () => (exportData ? JSON.stringify(exportData, jsonReplacer, 2) : ''),
    [exportData],
  );
  const mdStr = useMemo(() => (exportData ? chartToMarkdown(exportData) : ''), [exportData]);

  if (!data) return null;

  const flash = (key: string) => {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 2000);
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    flash(key);
  };

  const download = (content: string, ext: 'md' | 'json') => {
    const stamp = new Date()
      .toLocaleString('sv-SE')
      .replace(/[- :]/g, '')
      .slice(0, 12); // YYYYMMDDHHmm
    const blob = new Blob([content], {
      type: (ext === 'md' ? 'text/markdown' : 'application/json') + ';charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}-${stamp}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    flash(`dl-${ext}`);
  };

  const handleCopyPrompt = async () => {
    const topic = ZHANSHI_TOPICS.find((t) => t.id === topicId) ?? ZHANSHI_TOPICS[0];
    // 占事定向：按索引切片典籍断法章节附文（lrdq-ts-lib/docs 惰性拉取，失败不阻断）
    let refText = '';
    if (topic.refs.length) {
      try {
        const docs = await import('lrdq-ts-lib/docs');
        const parts: string[] = [];
        for (const r of topic.refs) {
          const md = await docs.getDocMarkdown(r.path);
          const slice = md ? sliceDocSection(md, r.section) : '';
          if (slice) parts.push(slice);
        }
        refText = parts.join('\n\n');
      } catch {
        // 章节附文失败时仍输出盘面 Prompt
      }
    }
    const topicLine = topic.id === 'general' ? '' : `占事：${topic.label}。`;
    const refBlock = refText ? `\n【占事典籍章节】\n${refText}\n` : '';

    // 相似占例检索（lrdq-ts-lib/cases 惰性拉取）：按占事章/课体/日干支/旬空加权，
    // top-2 作 few-shot 范例附文（含课式盘图与断验原文），失败不阻断
    let caseText = '';
    const names = liuRenNames(data);
    if (names.length) {
      try {
        const cs = await import('lrdq-ts-lib/cases');
        const di = (data as { dateInfo?: { bazi?: string; kongWang?: string[] } }).dateInfo;
        const hits = cs.findSimilarCases({
          keti: names,
          day: di?.bazi?.split(' ')[2],
          chapters: zhanShiCaseChapters(topic),
          kong: di?.kongWang,
          limit: 2,
        });
        caseText = hits
          .map((h) => `▶ ${cs.zhanLiLabel(h.entry)}（相似点：${h.why.join('、')}）\n${h.entry.text}`)
          .join('\n\n');
      } catch {
        // 占例附文失败时仍输出盘面 Prompt
      }
    }
    const caseBlock = caseText ? `\n【相似占例（《六壬指南注解》卷三）】\n${caseText}\n` : '';

    // 引擎自带 AI 提示词优先（如占事略決古法「依经断课」），前缀占事、后附章节与占例
    const engineAiPrompt = (data as { extras?: { aiPrompt?: unknown } })?.extras?.aiPrompt;
    if (typeof engineAiPrompt === 'string' && engineAiPrompt) {
      copy(`${topicLine ? `${topicLine}\n\n` : ''}${engineAiPrompt}${refBlock}${caseBlock}`, 'prompt');
      return;
    }
    const meta = (data as { meta?: { school?: string; engineName?: string } })?.meta;
    const schoolNote = meta?.school ? `（流派：${meta.school}，引擎：${meta.engineName ?? '未知'}）` : '';
    // 结构化推理指令：断必有据，生克直接采用机器核算结果
    const prompt = `你是精研大六壬的命理师。${topicLine}请依据下述盘面与所附资料断课${schoolNote}，严格遵循以下推理流程，且每一断语都必须标注依据（引用所附原文语句或盘面事实，禁止虚构典籍内容）：
1. 定类神：结合占事与「类神」节，指明本占所取类神及其落宫、旺衰；
2. 识格局：解读课体与「毕法命中」，以赋句、课体原文引为据；
3. 论生克：直接采用「关系摘要（机器核算）」的结论，不要自行另算五行生克；
4. 参神煞：以入课传者为要，兼看「大全神煞」课传各位当月吉凶神；
5. 定应期：以「应期候选（机器可算）」为候选池，结合占事与类神旺衰择取并说明理由；
6. 结论：分【断】与【据】两部分总结。若「多派三传对照」显示流派差异，须说明取舍。
若附有【相似占例】，参照其断法思路与应验结果类比推理，并点明本盘与例盘的异同。

【盘面】
${mdStr}${refBlock}${caseBlock}`;
    copy(prompt, 'prompt');
  };

  const previewText = format === 'md' ? mdStr : jsonStr;

  const btn = (key: string, label: string, icon: React.ReactNode, onClick: () => void, gold = false) => (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors border',
        gold
          ? 'bg-[var(--color-gold)]/10 hover:bg-[var(--color-gold)]/20 text-[var(--color-gold)] border-[var(--color-gold)]/20'
          : 'bg-secondary/50 hover:bg-secondary border-transparent',
      )}
    >
      {copiedKey === key ? <Check className="w-3.5 h-3.5 text-green-400" /> : icon}
      <span>{copiedKey === key ? '已完成' : label}</span>
    </button>
  );

  return (
    <div className="space-y-3">
      {/* 预览区（可切换 MD / JSON） */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>{expanded ? '收起' : '预览'} {title} 数据</span>
        </button>
        {expanded && (
          <div className="flex gap-1 p-0.5 bg-secondary/40 rounded-lg text-xs">
            {(['md', 'json'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  'px-2 py-0.5 rounded-md transition-colors',
                  format === f ? 'bg-card text-foreground font-medium shadow-sm' : 'text-muted-foreground',
                )}
              >
                {f === 'md' ? 'Markdown' : 'JSON'}
              </button>
            ))}
          </div>
        )}
      </div>

      {expanded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <pre className="p-3 rounded-lg bg-secondary/30 text-xs text-muted-foreground overflow-x-auto max-h-[320px] overflow-y-auto font-mono whitespace-pre-wrap">
            {previewText}
          </pre>
        </motion.div>
      )}

      {/* 占事定向（大六壬盘限定；影响 AI Prompt 的焦点与附文章节） */}
      {liuRenNames(data).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
          <span className="text-muted-foreground">AI 占事定向</span>
          <select
            value={topicId}
            onChange={(e) => pickTopic(e.target.value)}
            className="bg-secondary/50 border border-border/30 rounded-lg px-2 py-1 text-xs text-foreground"
          >
            {ZHANSHI_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="text-muted-foreground/60">定向后 Prompt 自动附典籍断法章节</span>
        </div>
      )}

      {/* 导出按钮 */}
      <div className="flex flex-wrap gap-2">
        {btn('copy-md', '复制 MD', <Copy className="w-3.5 h-3.5" />, () => copy(mdStr, 'copy-md'))}
        {btn('dl-md', '导出 MD', <Download className="w-3.5 h-3.5" />, () => download(mdStr, 'md'))}
        {btn('copy-json', '复制 JSON', <FileJson className="w-3.5 h-3.5" />, () => copy(jsonStr, 'copy-json'))}
        {btn('dl-json', '导出 JSON', <Download className="w-3.5 h-3.5" />, () => download(jsonStr, 'json'))}
        {btn('prompt', '复制 AI 分析 Prompt', <Sparkles className="w-3.5 h-3.5" />, handleCopyPrompt, true)}
      </div>
    </div>
  );
}
