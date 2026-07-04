import { useState } from 'react';
import { Puzzle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { PLUGINS, getEnabledPluginIds, setPluginEnabled } from '@/plugins';

interface PluginTogglesProps {
  /** 开关变化后触发（App 据此重新排盘） */
  onChange: () => void;
}

/**
 * 扩展插件开关面板
 * 芯片式开关，状态持久化于 localStorage，切换后即时重算
 */
export function PluginToggles({ onChange }: PluginTogglesProps) {
  const [enabled, setEnabled] = useState<string[]>(getEnabledPluginIds);
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    setPluginEnabled(id, !enabled.includes(id));
    setEnabled(getEnabledPluginIds());
    onChange();
  };

  if (PLUGINS.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Puzzle className="w-3.5 h-3.5" />
        <span>扩展插件（{enabled.length}/{PLUGINS.length}）</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PLUGINS.map((plugin) => {
            const isOn = enabled.includes(plugin.id);
            return (
              <button
                key={plugin.id}
                onClick={() => toggle(plugin.id)}
                title={plugin.description}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs border transition-all',
                  isOn
                    ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold)] border-[var(--color-gold)]/30 font-medium'
                    : 'bg-secondary/30 text-muted-foreground border-transparent hover:bg-secondary/50',
                )}
              >
                {plugin.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
