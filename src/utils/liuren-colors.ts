/**
 * 大六壬五行颜色映射工具
 * 天干/地支 → 五行 → CSS 颜色类名
 */

// 天干 → 五行
const TIANGAN_WUXING: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 地支 → 五行
const DIZHI_WUXING: Record<string, string> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水',
};

// 十二天将 → 五行（"螣蛇/腾蛇"两种写法并存：大六壬库用螣、金口诀用腾）
const TIANJIANG_WUXING: Record<string, string> = {
  '贵人': '土', '螣蛇': '火', '腾蛇': '火', '朱雀': '火',
  '六合': '木', '勾陈': '土', '青龙': '木',
  '天空': '土', '白虎': '金', '太常': '土',
  '玄武': '水', '太阴': '金', '天后': '水',
};

// 五行 → TailwindCSS 颜色类名
const WUXING_COLOR_CLASS: Record<string, string> = {
  '木': 'text-[var(--color-wood)]',
  '火': 'text-[var(--color-fire)]',
  '土': 'text-[var(--color-earth)]',
  '金': 'text-[var(--color-metal)]',
  '水': 'text-[var(--color-water)]',
};

// 五行 → 背景色
const WUXING_BG_CLASS: Record<string, string> = {
  '木': 'bg-[var(--color-wood)]/15',
  '火': 'bg-[var(--color-fire)]/15',
  '土': 'bg-[var(--color-earth)]/15',
  '金': 'bg-[var(--color-metal)]/15',
  '水': 'bg-[var(--color-water)]/15',
};

/**
 * 根据天干/地支/天将获取五行
 */
export function getWuxing(char: string): string {
  if (!char) return '';
  // 如果是两个字，取第一个字（如 "甲子" → "甲"）
  const c = char.charAt(0);
  return TIANGAN_WUXING[c] || DIZHI_WUXING[c] || TIANJIANG_WUXING[char] || '';
}

/**
 * 获取五行颜色类名
 */
export function getWuxingColorClass(char: string): string {
  const wx = getWuxing(char);
  return WUXING_COLOR_CLASS[wx] || 'text-foreground';
}

/**
 * 获取五行背景色类名
 */
export function getWuxingBgClass(char: string): string {
  const wx = getWuxing(char);
  return WUXING_BG_CLASS[wx] || '';
}

/**
 * 吉凶指示器
 */
export function getJiXiongIndicator(type: string): { color: string; label: string } {
  switch (type) {
    case '吉':
      return { color: 'bg-green-500', label: '吉' };
    case '凶':
      return { color: 'bg-red-500', label: '凶' };
    default:
      return { color: 'bg-muted-foreground/30', label: '平' };
  }
}

/**
 * 十二天将标准顺序
 */
export const TIANJIANG_ORDER = [
  '贵人', '螣蛇', '朱雀', '六合', '勾陈', '青龙',
  '天空', '白虎', '太常', '玄武', '太阴', '天后',
];

/**
 * 十二地支标准顺序
 */
export const DIZHI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 十天干标准顺序
 */
export const TIANGAN_ORDER = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
