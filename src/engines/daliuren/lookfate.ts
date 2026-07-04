/**
 * liuren-ts-lib@3（look-fate/liuren-ts-lib）大六壬引擎适配器
 *
 * 上游为通行体系实现：天地盘 / 四课 / 三传（九宗门）/ 遁干 / 建除 /
 * 神煞 / 阴阳贵人，基于 tyme4ts 历法。
 * 上游若再发破坏性版本，只需修改本文件。
 */
import {
  getDateByObj,
  getLiuRenByDate,
  type LiuRenResult,
  type ShiErGong,
} from 'liuren-ts-lib';
import { EightChar } from 'tyme4ts';
import {
  DI_ZHI,
  type ChartDateInfo,
  type ChuanItem,
  type DaLiuRenEngine,
  type DiZhi,
  type GongInfo,
  type LiuRenChart,
  type SiKeItem,
} from '../types';

/** ShiErGong 拼音键 → 地支序（0=子 … 11=亥） */
const PINYIN_KEYS = [
  'zi', 'chou', 'yin', 'mao', 'chen', 'si',
  'wu', 'wei', 'shen', 'you', 'xu', 'hai',
] as const satisfies readonly (keyof ShiErGong)[];

/** 上游 DateInfo 的结构（与 v1.9 相同的字段命名，防御性可选） */
interface UpstreamDateInfo {
  bazi?: string;
  date?: string;
  kong?: string[];
  yima?: string;
  yuejiang?: string;
  xun?: string;
  dingma?: string;
  tianma?: string;
}

function toShiErGongRecord(g?: ShiErGong): Partial<Record<DiZhi, string>> {
  const out: Partial<Record<DiZhi, string>> = {};
  if (!g) return out;
  PINYIN_KEYS.forEach((key, i) => {
    out[DI_ZHI[i]] = g[key];
  });
  return out;
}

function toDateInfo(result: LiuRenResult): ChartDateInfo {
  const d = (result.dateInfo ?? {}) as UpstreamDateInfo;
  return {
    bazi: d.bazi ?? '',
    ganZhiDate: d.date,
    yueJiang: d.yuejiang ?? '',
    xun: d.xun,
    kongWang: d.kong ?? [],
    yiMa: d.yima,
    dingMa: d.dingma,
    tianMa: d.tianma,
  };
}

function toGong(result: LiuRenResult): GongInfo[] {
  const { tianPan, tianJiang } = result.tianDiPan;
  return DI_ZHI.map((diZhi, i) => {
    const key = PINYIN_KEYS[i];
    return {
      diZhi,
      tianZhi: tianPan[key] ?? '',
      tianJiang: tianJiang[key] ?? '',
      dunGan: result.dunGan?.[key],
      jianChu: result.jianChu?.[key],
      chuJian: result.chuJian?.[key],
      fuJian: result.fuJian?.[key],
    };
  });
}

/** 四课数组格式 ["上神下神", "天将"]，如 ["未戊", "贵人"] */
function toSiKeItem(name: string, ke?: string[]): SiKeItem {
  const shangXia = ke?.[0] ?? '';
  return {
    name,
    shang: shangXia.charAt(0),
    xia: shangXia.charAt(1),
    tianJiang: ke?.[1] ?? '',
  };
}

/** 三传数组格式 [地支, 天将, 六亲, 遁干]，如 ["辰", "六合", "兄弟", "壬"] */
function toChuan(chuan?: string[]): ChuanItem {
  return {
    zhi: chuan?.[0] ?? '',
    tianJiang: chuan?.[1] ?? '',
    liuQin: chuan?.[2],
    dunGan: chuan?.[3],
  };
}

function toChart(result: LiuRenResult): LiuRenChart {
  return {
    meta: {
      engineId: 'lookfate',
      engineName: 'liuren-ts-lib',
      school: '通行体系',
    },
    dateInfo: toDateInfo(result),
    gong: toGong(result),
    siKe: [
      toSiKeItem('一课', result.siKe?.ke1),
      toSiKeItem('二课', result.siKe?.ke2),
      toSiKeItem('三课', result.siKe?.ke3),
      toSiKeItem('四课', result.siKe?.ke4),
    ],
    sanChuan: {
      chu: toChuan(result.sanChuan?.chuChuan),
      zhong: toChuan(result.sanChuan?.zhongChuan),
      mo: toChuan(result.sanChuan?.moChuan),
      keTi: result.sanChuan?.keTi ?? '',
    },
    shenSha: result.shenSha ?? [],
    yinYangGuiRen: result.yinYangGuiRen
      ? {
          yang: toShiErGongRecord(result.yinYangGuiRen.yangGuiRen),
          yin: toShiErGongRecord(result.yinYangGuiRen.yinGuiRen),
        }
      : undefined,
    extras: {},
    raw: result,
  };
}

/**
 * 四柱 → 公历时间反推。
 *
 * 上游 getLiuRenBySiZhu 存在缺陷（v1.9 与 v3.0 均抛 getYear 错误，
 * 已用基线验证），此处以 tyme4ts EightChar 反推候选公历时刻，
 * 再用 liuren-ts-lib 自身的 getDateByObj 复核四柱，保证与排盘引擎口径一致。
 *
 * 注意：同一月柱内月将可能因中气换将而不同，反推取区间内首个匹配时刻。
 */
function findDateBySiZhu(year: string, month: string, day: string, hour: string): Date {
  const expectedBazi = `${year} ${month} ${day} ${hour}`;
  let candidates: ReturnType<EightChar['getSolarTimes']>;
  try {
    candidates = new EightChar(year, month, day, hour).getSolarTimes(1900, 2100);
  } catch (error) {
    throw new Error(`四柱「${expectedBazi}」无效：${error instanceof Error ? error.message : String(error)}`);
  }
  for (const t of candidates) {
    const candidate = new Date(t.getYear(), t.getMonth() - 1, t.getDay(), t.getHour(), t.getMinute(), t.getSecond());
    const info = getDateByObj(candidate) as { bazi?: string };
    if (info.bazi === expectedBazi) return candidate;
  }
  throw new Error(`无法根据四柱「${expectedBazi}」反推出 1900–2100 年内的公历时间，请检查四柱是否有效`);
}

export const lookfateDaLiuRen: DaLiuRenEngine = {
  id: 'lookfate',
  name: 'liuren-ts-lib',
  school: '通行体系',
  capabilities: {
    siZhu: true,
    shenSha: 'full',
    yinYangGuiRen: true,
    dunGan: true,
  },
  byDate: (date) => toChart(getLiuRenByDate(date)),
  bySiZhu: (year, month, day, hour) =>
    toChart(getLiuRenByDate(findDateBySiZhu(year, month, day, hour))),
};
