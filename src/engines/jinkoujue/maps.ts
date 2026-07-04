/**
 * 金口诀基础常量表
 *
 * 移植自 look-fate/liuren-ts-lib（Apache-2.0）v2.0.0 移除金口诀模块前的
 * 最后版本（提交 dbf6253e，src/maps/*），保持值级兼容。
 */

export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export const GAN_WU_XING: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
  己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};

export const ZHI_WU_XING: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火',
  午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

/** 五行相生：键生值 */
export const WU_XING_SHENG: Record<string, string> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};

/** 五行相克：键克值 */
export const WU_XING_KE: Record<string, string> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
};

/** 十二贵神顺序（贵、蛇、雀、合、勾、龙、空、虎、常、玄、阴、后）——上游写法为"腾蛇" */
export const GUI_SHEN_ORDER = [
  '贵人', '腾蛇', '朱雀', '六合', '勾陈', '青龙',
  '天空', '白虎', '太常', '玄武', '太阴', '天后',
] as const;

/**
 * 神将 → 地支（上游取法；注意玄武配子、天后配亥，与部分古籍
 * "玄武亥、天后子"相反，为保持与上游值级兼容按上游表保留）
 */
export const SHEN_ZHI: Record<string, string> = {
  贵人: '丑', 腾蛇: '巳', 朱雀: '午', 六合: '卯',
  勾陈: '辰', 青龙: '寅', 天空: '戌', 白虎: '申',
  太常: '未', 玄武: '子', 太阴: '酉', 天后: '亥',
};

/** 十二月将名（按地支） */
export const YUE_JIANG_NAME: Record<string, string> = {
  子: '神后', 丑: '大吉', 寅: '功曹', 卯: '太冲', 辰: '天罡', 巳: '太乙',
  午: '胜光', 未: '小吉', 申: '传送', 酉: '从魁', 戌: '河魁', 亥: '登明',
};

/**
 * 天乙贵人（甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸蛇兔藏，六辛逢虎马）
 * day = 阳贵（卯~申时用），night = 阴贵（酉~寅时用）
 */
export const TIAN_YI_GUI_REN: Record<string, { day: string; night: string }> = {
  甲: { day: '丑', night: '未' },
  戊: { day: '丑', night: '未' },
  庚: { day: '丑', night: '未' },
  乙: { day: '子', night: '申' },
  己: { day: '子', night: '申' },
  丙: { day: '亥', night: '酉' },
  丁: { day: '亥', night: '酉' },
  壬: { day: '巳', night: '卯' },
  癸: { day: '巳', night: '卯' },
  辛: { day: '午', night: '寅' },
};

/** 五鼠遁起干（日干 → 子时起干）：甲己还加甲，乙庚丙作初… */
export const WU_SHU_DUN_START: Record<string, string> = {
  甲: '甲', 己: '甲',
  乙: '丙', 庚: '丙',
  丙: '戊', 辛: '戊',
  丁: '庚', 壬: '庚',
  戊: '壬', 癸: '壬',
};

/** 地支六合 */
export const LIU_HE: Record<string, string> = {
  子: '丑', 丑: '子', 寅: '亥', 卯: '戌', 辰: '酉', 巳: '申',
  午: '未', 未: '午', 申: '巳', 酉: '辰', 戌: '卯', 亥: '寅',
};

/** 地支六冲 */
export const LIU_CHONG: Record<string, string> = {
  子: '午', 丑: '未', 寅: '申', 卯: '酉', 辰: '戌', 巳: '亥',
  午: '子', 未: '丑', 申: '寅', 酉: '卯', 戌: '辰', 亥: '巳',
};

/** 天干五合 */
export const TIAN_GAN_WU_HE: Record<string, string> = {
  甲: '己', 乙: '庚', 丙: '辛', 丁: '壬', 戊: '癸',
  己: '甲', 庚: '乙', 辛: '丙', 壬: '丁', 癸: '戊',
};

/** 日禄（甲禄在寅…） */
export const RI_LU: Record<string, string> = {
  甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳',
  己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子',
};

/** 驿马（寅午戌马在申，申子辰马在寅，亥卯未马在巳，巳酉丑马在亥） */
export const YI_MA: Record<string, string> = {
  寅: '申', 午: '申', 戌: '申',
  申: '寅', 子: '寅', 辰: '寅',
  巳: '亥', 酉: '亥', 丑: '亥',
  亥: '巳', 卯: '巳', 未: '巳',
};

/** 桃花/咸池（寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子）——大六壬神煞补充插件用 */
export const TAO_HUA: Record<string, string> = {
  寅: '卯', 午: '卯', 戌: '卯',
  申: '酉', 子: '酉', 辰: '酉',
  巳: '午', 酉: '午', 丑: '午',
  亥: '子', 卯: '子', 未: '子',
};

// ---------- 神煞表（月支/日支/日干系） ----------

/** 天德：正丁二申庚，三壬四辛同，五癸亥六甲，七癸八甲寅，九丙十居乙，子巳丑庚中 */
export const TIAN_DE: Record<string, string> = {
  寅: '丁', 卯: '申', 辰: '壬', 巳: '辛', 午: '亥', 未: '甲',
  申: '癸', 酉: '寅', 戌: '丙', 亥: '乙', 子: '巳', 丑: '庚',
};

/** 月德：寅午戌月在丙，亥卯未月在甲，申子辰月在壬，巳酉丑月在庚 */
export const YUE_DE: Record<string, string> = {
  寅: '丙', 午: '丙', 戌: '丙',
  亥: '甲', 卯: '甲', 未: '甲',
  申: '壬', 子: '壬', 辰: '壬',
  巳: '庚', 酉: '庚', 丑: '庚',
};

/** 天马（月）：正七午，二八申，三九戌，四十子，五十一寅，六腊辰 */
export const TIAN_MA_MONTH: Record<string, string> = {
  寅: '午', 申: '午', 卯: '申', 酉: '申', 辰: '戌', 戌: '戌',
  巳: '子', 亥: '子', 午: '寅', 子: '寅', 未: '辰', 丑: '辰',
};

/** 天喜：正月戌，顺推十二月 */
export const TIAN_XI: Record<string, string> = {
  寅: '戌', 卯: '亥', 辰: '子', 巳: '丑', 午: '寅', 未: '卯',
  申: '辰', 酉: '巳', 戌: '午', 亥: '未', 子: '申', 丑: '酉',
};

/** 天医：正月戌，顺推十二月（排布与天喜一致，从上游保留） */
export const TIAN_YI_SHA: Record<string, string> = {
  寅: '戌', 卯: '亥', 辰: '子', 巳: '丑', 午: '寅', 未: '卯',
  申: '辰', 酉: '巳', 戌: '午', 亥: '未', 子: '申', 丑: '酉',
};

/** 劫煞：申子辰见巳，巳酉丑见寅，寅午戌见亥，亥卯未见申 */
export const JIE_SHA: Record<string, string> = {
  申: '巳', 子: '巳', 辰: '巳',
  巳: '寅', 酉: '寅', 丑: '寅',
  寅: '亥', 午: '亥', 戌: '亥',
  亥: '申', 卯: '申', 未: '申',
};

/** 丧车：春酉，夏子，秋卯，冬午 */
export const SANG_CHE: Record<string, string> = {
  寅: '酉', 卯: '酉', 辰: '酉',
  巳: '子', 午: '子', 未: '子',
  申: '卯', 酉: '卯', 戌: '卯',
  亥: '午', 子: '午', 丑: '午',
};

/** 飞廉：正月戌，二月巳…（上游表） */
export const FEI_LIAN: Record<string, string> = {
  寅: '戌', 卯: '巳', 辰: '午', 巳: '未', 午: '申', 未: '酉',
  申: '戌', 酉: '亥', 戌: '子', 亥: '丑', 子: '寅', 丑: '卯',
};

/** 四丘：春丑，夏辰，秋未，冬戌 */
export const SI_QIU: Record<string, string> = {
  寅: '丑', 卯: '丑', 辰: '丑',
  巳: '辰', 午: '辰', 未: '辰',
  申: '未', 酉: '未', 戌: '未',
  亥: '戌', 子: '戌', 丑: '戌',
};

/** 四墓：春未，夏戌，秋丑，冬辰 */
export const SI_MU: Record<string, string> = {
  寅: '未', 卯: '未', 辰: '未',
  巳: '戌', 午: '戌', 未: '戌',
  申: '丑', 酉: '丑', 戌: '丑',
  亥: '辰', 子: '辰', 丑: '辰',
};

/** 天鬼：春酉，夏子，秋卯，冬午 */
export const TIAN_GUI: Record<string, string> = {
  寅: '酉', 卯: '酉', 辰: '酉',
  巳: '子', 午: '子', 未: '子',
  申: '卯', 酉: '卯', 戌: '卯',
  亥: '午', 子: '午', 丑: '午',
};

/** 生气：正月在子，顺行十二 */
export const SHENG_QI: Record<string, string> = {
  寅: '子', 卯: '丑', 辰: '寅', 巳: '卯', 午: '辰', 未: '巳',
  申: '午', 酉: '未', 戌: '申', 亥: '酉', 子: '戌', 丑: '亥',
};

export function ganIndex(gan: string): number {
  return TIAN_GAN.indexOf(gan as (typeof TIAN_GAN)[number]);
}

export function zhiIndex(zhi: string): number {
  return DI_ZHI.indexOf(zhi as (typeof DI_ZHI)[number]);
}
