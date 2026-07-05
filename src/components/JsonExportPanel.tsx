import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, FileJson, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { chartToMarkdown } from '@/utils/chart-markdown';

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

  // 课体原文引就绪且对应当前盘时并入导出数据（extras.kejing）
  const exportData = useMemo(() => {
    if (!data || kejing?.src !== data || !kejing.entries.length) return data;
    const c = data as { extras?: Record<string, unknown> };
    return { ...c, extras: { ...c.extras, kejing: kejing.entries } };
  }, [data, kejing]);

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

  const handleCopyPrompt = () => {
    // 引擎自带 AI 提示词优先（如占事略決古法「依经断课」提示词，自动附命中原文条文）
    const engineAiPrompt = (data as { extras?: { aiPrompt?: unknown } })?.extras?.aiPrompt;
    if (typeof engineAiPrompt === 'string' && engineAiPrompt) {
      copy(engineAiPrompt, 'prompt');
      return;
    }
    const meta = (data as { meta?: { school?: string; engineName?: string } })?.meta;
    const schoolNote = meta?.school ? `（流派：${meta.school}，引擎：${meta.engineName ?? '未知'}）` : '';
    // 通用提示词附带 Markdown 盘面（比 JSON 更省 token）
    const prompt = `请根据以下排盘数据${schoolNote}进行详细的断局分析：\n\n${mdStr}\n请从以下方面分析：\n1. 天地盘格局\n2. 四课三传\n3. 日干与天将关系\n4. 神煞吉凶\n5. 综合断语`;
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
