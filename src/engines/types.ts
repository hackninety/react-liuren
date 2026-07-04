/**
 * 引擎层统一领域模型
 *
 * UI 组件只消费本文件定义的类型；具体算法库（liuren-ts-lib / mingyu-core /
 * xiaoliuren-ts-lib）通过 engines/ 下各自的适配器转换为统一模型。
 * 上游库发生破坏性变更时，只需修改对应适配器文件。
 */

// ---------- 基础 ----------

/** 十二地支，序号 0-11 与盘面索引一致 */
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type DiZhi = (typeof DI_ZHI)[number];

// ---------- 大六壬 ----------

/** 排盘基础信息（八字、月将、马星等） */
export interface ChartDateInfo {
  /** 四柱八字，空格分隔："丙午 辛卯 戊子 辛酉" */
  bazi: string;
  /** 干支历字符串 */
  ganZhiDate?: string;
  /** 月将地支 */
  yueJiang: string;
  /** 旬首 */
  xun?: string;
  /** 旬空 */
  kongWang: string[];
  /** 驿马 */
  yiMa?: string;
  /** 丁马 */
  dingMa?: string;
  /** 天马 */
  tianMa?: string;
  /** 昼占/夜占（部分引擎提供） */
  dayNight?: '昼' | '夜';
}

/**
 * 单个宫位的完整信息（索引 = 地支序，0=子 … 11=亥）
 * extras 供插件写入角标数据（如 changSheng / wangShuai / 行年标注）
 */
export interface GongInfo {
  diZhi: DiZhi;
  /** 天盘地支 */
  tianZhi: string;
  /** 天将 */
  tianJiang: string;
  /** 遁干 */
  dunGan?: string;
  /** 建除十二直 */
  jianChu?: string;
  /** 初建（日干五子元遁） */
  chuJian?: string;
  /** 伏建（时干五子元遁） */
  fuJian?: string;
  /** 插件角标：键为插件约定字段，值为展示文本 */
  extras?: Record<string, string>;
}

export interface SiKeItem {
  /** 课名：一课/二课/三课/四课 */
  name: string;
  /** 上神 */
  shang: string;
  /** 下神（干阳/支阳课为日干/日支） */
  xia: string;
  /** 天将 */
  tianJiang: string;
}

export interface ChuanItem {
  /** 传支 */
  zhi: string;
  /** 天将 */
  tianJiang: string;
  /** 六亲 */
  liuQin?: string;
  /** 遁干 */
  dunGan?: string;
}

export interface SanChuanInfo {
  chu: ChuanItem;
  zhong: ChuanItem;
  mo: ChuanItem;
  /** 课体名称 */
  keTi: string;
  /** 取传方法（九宗门大类，部分引擎提供） */
  method?: string;
}

export interface ShenShaEntry {
  name: string;
  value: string;
  description?: string;
}

export type DaLiuRenEngineId = 'lookfate' | 'mingyu';

/** 大六壬排盘统一结果 */
export interface LiuRenChart {
  meta: {
    engineId: DaLiuRenEngineId;
    engineName: string;
    school: string;
  };
  dateInfo: ChartDateInfo;
  /** 十二宫（0=子 … 11=亥） */
  gong: GongInfo[];
  /** 四课（一课 → 四课） */
  siKe: SiKeItem[];
  sanChuan: SanChuanInfo;
  shenSha: ShenShaEntry[];
  yinYangGuiRen?: {
    yang: Partial<Record<DiZhi, string>>;
    yin: Partial<Record<DiZhi, string>>;
  };
  /** 插件输出挂载点：extras[pluginId] */
  extras: Record<string, unknown>;
  /** 引擎原始输出（JSON 导出附带，便于比对与调试） */
  raw: unknown;
}

export interface DaLiuRenCapabilities {
  /** 是否支持四柱干支直接起课 */
  siZhu: boolean;
  /** 神煞完整度 */
  shenSha: 'full' | 'summary' | 'none';
  /** 是否提供阴阳贵人盘 */
  yinYangGuiRen: boolean;
  /** 是否提供遁干/建除表 */
  dunGan: boolean;
}

export interface DaLiuRenEngine {
  id: DaLiuRenEngineId;
  name: string;
  /** 流派说明，展示于切换器 */
  school: string;
  capabilities: DaLiuRenCapabilities;
  byDate(date: Date): LiuRenChart;
  bySiZhu?(year: string, month: string, day: string, hour: string): LiuRenChart;
}

// ---------- 金口诀 ----------

export interface JinKouJuePosition {
  name: string;
  ganZhi: string;
  wuXing: string;
  wangXiangXiuQiu?: string;
}

export interface JinKouJueShenSha {
  name: string;
  value: string;
  position: string[];
  description: string;
  type: '吉' | '凶';
}

/** 金口诀四位排盘结果（与移植前 liuren-ts-lib@1.9 的 JinKouJueResult 形状一致） */
export interface JinKouJueChart {
  date: {
    bazi: string;
    [key: string]: unknown;
  };
  diFen: string;
  siWei: {
    renYuan: JinKouJuePosition;
    guiShen: JinKouJuePosition;
    jiangShen: JinKouJuePosition;
    diFen: JinKouJuePosition;
  };
  shenSha: JinKouJueShenSha[];
}

// ---------- 小六壬 ----------

export type XiaoLiuRenEngineId = 'lookfate' | 'mingyu';
export type XiaoLiuRenMethod = 'time' | 'number';

export interface XiaoLiuRenPalace {
  /** 六宫名：大安/留连/速喜/赤口/小吉/空亡 */
  gong: string;
  /** 对应地支 */
  branch: string;
  /** 六亲 */
  kin?: string;
  /** 六神 */
  deity?: string;
  /** 五行星 */
  star?: string;
  /** 五行 */
  wuXing?: string;
  /** 旺衰（部分引擎提供） */
  wangShuai?: string;
  /** 日宫（落日位） */
  isDayPalace: boolean;
  /** 时宫（落时位，即课象结果宫） */
  isHourPalace: boolean;
  /** 三宫标记：起因/过程/结果（部分引擎提供） */
  sanGongRole?: '起因' | '过程' | '结果';
}

export interface XiaoLiuRenChart {
  meta: {
    engineId: XiaoLiuRenEngineId;
    engineName: string;
    school: string;
  };
  method: XiaoLiuRenMethod;
  /** 起课参数说明（如"三月初五 午时"或"数字 123"） */
  inputSummary: string;
  /** 六宫状态（大安起，顺序固定） */
  palaces: XiaoLiuRenPalace[];
  /** 课象简断（部分引擎提供） */
  summary?: string;
  extras: Record<string, unknown>;
  raw: unknown;
}

export interface XiaoLiuRenEngine {
  id: XiaoLiuRenEngineId;
  name: string;
  school: string;
  /** 时间起课 */
  byTime(date: Date): XiaoLiuRenChart;
  /** 数字起课 */
  byNumber(num: number, date: Date): XiaoLiuRenChart;
}

// ---------- 流年 ----------

export interface NianMingChart {
  /** 出生年干支 */
  year: string;
  /** 当前流年干支 */
  luNian: string;
  /** 性别 */
  gender: string;
}
