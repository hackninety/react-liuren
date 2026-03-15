import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DIZHI_ORDER } from '@/utils/liuren-colors';

export interface LiuRenOptions {
  date: Date;
  mode: 'date' | 'sizhu';
  // 四柱模式
  yearZhu?: string;
  monthZhu?: string;
  dayZhu?: string;
  hourZhu?: string;
  // 金口诀地分
  diFen?: string;
  // 流年
  birthDate?: Date;
  gender?: number;  // 1=男, 2=女
  // 真太阳时
  longitude?: number;
  location?: string;
}

interface DatePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (options: LiuRenOptions) => void;
  currentDate?: Date;
}

/**
 * 自定义排盘对话框
 * 支持日期时间输入 + 四柱直接输入 + 金口诀地分 + 流年参数
 */
export function DatePickerDialog({ open, onClose, onConfirm, currentDate }: DatePickerDialogProps) {
  const now = currentDate || new Date();
  const [mode, setMode] = useState<'date' | 'sizhu'>('date');

  // 日期模式
  const [dateStr, setDateStr] = useState(formatDateInput(now));
  const [timeStr, setTimeStr] = useState(formatTimeInput(now));

  // 四柱模式
  const [yearZhu, setYearZhu] = useState('');
  const [monthZhu, setMonthZhu] = useState('');
  const [dayZhu, setDayZhu] = useState('');
  const [hourZhu, setHourZhu] = useState('');

  // 金口诀地分
  const [diFen, setDiFen] = useState('');

  // 流年参数
  const [birthDateStr, setBirthDateStr] = useState('');
  const [gender, setGender] = useState<number>(1);

  const handleConfirm = () => {
    if (mode === 'date') {
      const date = new Date(`${dateStr}T${timeStr}`);
      onConfirm({
        date,
        mode: 'date',
        diFen: diFen || undefined,
        birthDate: birthDateStr ? new Date(birthDateStr) : undefined,
        gender,
      });
    } else {
      onConfirm({
        date: new Date(),
        mode: 'sizhu',
        yearZhu,
        monthZhu,
        dayZhu,
        hourZhu,
        diFen: diFen || undefined,
        birthDate: birthDateStr ? new Date(birthDateStr) : undefined,
        gender,
      });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* dialog */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="w-full max-w-md glass-card rounded-2xl p-6 bg-card shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold font-serif text-foreground">自定义排盘</h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mode tabs */}
              <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg mb-4">
                {[
                  { key: 'date' as const, label: '日期时间' },
                  { key: 'sizhu' as const, label: '四柱直输' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setMode(tab.key)}
                    className={`flex-1 py-1.5 text-sm rounded-md transition-all ${
                      mode === tab.key
                        ? 'bg-card text-foreground shadow-sm font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {mode === 'date' ? (
                  <>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">日期</label>
                      <input
                        type="date"
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:ring-1 focus:ring-ring outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">时间</label>
                      <input
                        type="time"
                        value={timeStr}
                        onChange={(e) => setTimeStr(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:ring-1 focus:ring-ring outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '年柱', value: yearZhu, set: setYearZhu, ph: '如 甲子' },
                      { label: '月柱', value: monthZhu, set: setMonthZhu, ph: '如 丙寅' },
                      { label: '日柱', value: dayZhu, set: setDayZhu, ph: '如 戊辰' },
                      { label: '时柱', value: hourZhu, set: setHourZhu, ph: '如 庚午' },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => field.set(e.target.value)}
                          placeholder={field.ph}
                          className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:ring-1 focus:ring-ring outline-none font-serif"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 金口诀地分 */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">金口诀地分（可选）</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    <button
                      onClick={() => setDiFen('')}
                      className={`py-1 text-xs rounded-md transition-all ${
                        diFen === ''
                          ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] font-medium border border-[var(--color-gold)]/30'
                          : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                      }`}
                    >
                      无
                    </button>
                    {DIZHI_ORDER.map((zhi) => (
                      <button
                        key={zhi}
                        onClick={() => setDiFen(zhi)}
                        className={`py-1 text-xs rounded-md font-serif transition-all ${
                          diFen === zhi
                            ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] font-medium border border-[var(--color-gold)]/30'
                            : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                        }`}
                      >
                        {zhi}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 流年参数 */}
                <div className="border-t border-border/30 pt-4">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wider">流年计算（可选）</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">出生日期</label>
                      <input
                        type="date"
                        value={birthDateStr}
                        onChange={(e) => setBirthDateStr(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground focus:ring-1 focus:ring-ring outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">性别</label>
                      <div className="flex gap-2">
                        {[
                          { value: 1, label: '男' },
                          { value: 2, label: '女' },
                        ].map((item) => (
                          <button
                            key={item.value}
                            onClick={() => setGender(item.value)}
                            className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                              gender === item.value
                                ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] font-medium border border-[var(--color-gold)]/30'
                                : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50 border border-transparent'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 确认按钮 */}
              <button
                onClick={handleConfirm}
                className="w-full mt-6 py-2.5 rounded-xl bg-[var(--color-gold)] text-black font-semibold text-sm hover:bg-[var(--color-gold-light)] transition-colors"
              >
                排盘
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function formatDateInput(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTimeInput(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
