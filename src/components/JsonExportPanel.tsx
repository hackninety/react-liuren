import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, FileJson } from 'lucide-react';

interface JsonExportPanelProps {
  data: unknown;
  title?: string;
}

/**
 * 数据导出 & AI 分析面板
 * 展示 JSON 数据 + 一键复制
 */
export function JsonExportPanel({ data, title = '排盘数据' }: JsonExportPanelProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!data) return null;

  const jsonStr = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = jsonStr;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPrompt = async () => {
    const meta = (data as { meta?: { school?: string; engineName?: string } })?.meta;
    const schoolNote = meta?.school ? `（流派：${meta.school}，引擎：${meta.engineName ?? '未知'}）` : '';
    const prompt = `请根据以下大六壬/金口诀排盘数据${schoolNote}进行详细的断局分析：\n\n${jsonStr}\n\n请从以下几个方面进行分析：\n1. 天地盘格局\n2. 四课三传分析\n3. 日干与天将关系\n4. 神煞吉凶\n5. 综合断语`;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileJson className="w-4 h-4" />
          <span>{expanded ? '收起' : '展开'} {title} JSON</span>
        </button>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="relative"
        >
          <pre className="p-3 rounded-lg bg-secondary/30 text-xs text-muted-foreground overflow-x-auto max-h-[300px] overflow-y-auto font-mono">
            {jsonStr}
          </pre>
        </motion.div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '已复制' : '复制 JSON'}</span>
        </button>
        <button
          onClick={handleCopyPrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-gold)]/10 hover:bg-[var(--color-gold)]/20 text-[var(--color-gold)] text-sm transition-colors border border-[var(--color-gold)]/20"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>复制 AI 分析 Prompt</span>
        </button>
      </div>
    </div>
  );
}
