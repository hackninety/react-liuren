/**
 * 金口诀排盘引擎（本地移植）
 *
 * 移植自 look-fate/liuren-ts-lib（Apache-2.0）src/jinKouJue/index.ts，
 * 版本为 v2.0.0（提交 185a2f5c "移除金口诀模块"）的父提交 dbf6253e。
 * 算法与输出与 liuren-ts-lib@1.9 值级兼容（已用 1.9 基线逐字段验证）。
 * 历法信息复用 liuren-ts-lib@3 的 getDateByObj / getDateBySiZhu。
 *
 * 起课四位：
 * - 地分：来人所报方位地支（入式之门）
 * - 将神：月将加占时，顺数至地分
 * - 贵神：按占时地支阴阳取昼贵/夜贵，贵人支在亥~辰顺布、巳~戌逆布，
 *   自贵人支直数至地分
 * - 人元：日干五鼠遁至地分所得天干
 */
import { getDateByObj, getDateBySiZhu } from 'liuren-ts-lib';
import type { JinKouJueChart, JinKouJuePosition } from '../types';
import {
  DI_ZHI,
  GAN_WU_XING,
  GUI_SHEN_ORDER,
  SHEN_ZHI,
  TIAN_GAN,
  TIAN_YI_GUI_REN,
  WU_SHU_DUN_START,
  WU_XING_KE,
  WU_XING_SHENG,
  YUE_JIANG_NAME,
  ZHI_WU_XING,
  ganIndex,
  zhiIndex,
} from './maps';
import { getShenSha } from './shensha';

/** 昼占时辰（卯~申为阳/昼，酉~寅为阴/夜） */
const DAY_HOURS = ['卯', '辰', '巳', '午', '未', '申'];

/** 与 liuren-ts-lib DateInfo 对齐的最小结构 */
export interface JkjDateInfo {
  bazi?: string;
  yuejiang?: string;
  kong?: string[];
  [key: string]: unknown;
}

/** 五鼠遁：日干遁至某地支所得天干 */
export function getWuShuDun(dayGan: string, diZhi: string): string {
  const start = WU_SHU_DUN_START[dayGan];
  if (!start) return '';
  return TIAN_GAN[(ganIndex(start) + zhiIndex(diZhi)) % 10];
}

/** 将神：月将加占时，顺数至地分 */
export function getJiangShen(yueJiang: string, timeZhi: string, diFen: string): string {
  const idx = (zhiIndex(yueJiang) + zhiIndex(diFen) - zhiIndex(timeZhi) + 12) % 12;
  return DI_ZHI[idx];
}

/**
 * 贵神：占时阳支（卯~申）用昼贵、阴支用夜贵；
 * 贵人支临亥子丑寅卯辰顺布十二贵神、临巳午未申酉戌逆布，
 * 自贵人支直数至地分。
 */
export function getGuiShen(dayGan: string, timeZhi: string, diFen: string): string {
  const guiRen = TIAN_YI_GUI_REN[dayGan];
  if (!guiRen) return '';
  const isDay = DAY_HOURS.includes(timeZhi);
  const guiZhi = isDay ? guiRen.day : guiRen.night;

  const startIdx = zhiIndex(guiZhi);
  const diFenIdx = zhiIndex(diFen);
  if (startIdx < 0 || diFenIdx < 0) return '';

  // 贵人支本身定顺逆：亥(11)子丑寅卯辰(4)顺，巳(5)~戌(10)逆
  const isShun = startIdx >= 11 || startIdx <= 4;
  const step = isShun
    ? (diFenIdx - startIdx + 12) % 12
    : (startIdx - diFenIdx + 12) % 12;
  return GUI_SHEN_ORDER[step];
}

/** 神将对应的地支（名不匹配时原样返回，与上游一致） */
export function getShenGanZhi(name: string): string {
  return SHEN_ZHI[name] ?? name;
}

/** 通用五行查询（天干/地支/神将名/月将名） */
export function getWuXing(name: string): string {
  if (GAN_WU_XING[name]) return GAN_WU_XING[name];
  if (ZHI_WU_XING[name]) return ZHI_WU_XING[name];
  const shenZhi = SHEN_ZHI[name];
  if (shenZhi) return ZHI_WU_XING[shenZhi] ?? '';
  const byName = Object.entries(YUE_JIANG_NAME).find(([, n]) => n === name);
  if (byName) return ZHI_WU_XING[byName[0]] ?? '';
  return '';
}

/** 月令五行（辰戌丑未四季属土） */
export function getYueLingWuXing(monthZhi: string): string {
  return ZHI_WU_XING[monthZhi] ?? '';
}

/** 旺相休囚死：同令旺，令生者相，生令者休，克令者囚，令克者死 */
export function getWangXiangXiuQiu(wuXing: string, monthZhi: string): string {
  const ling = getYueLingWuXing(monthZhi);
  if (!ling || !wuXing) return '';
  if (wuXing === ling) return '旺';
  if (WU_XING_SHENG[ling] === wuXing) return '相';
  if (WU_XING_SHENG[wuXing] === ling) return '休';
  if (WU_XING_KE[wuXing] === ling) return '囚';
  if (WU_XING_KE[ling] === wuXing) return '死';
  return '';
}

/** 月将字段归一化：兼容"亥"“登明”“亥（登明）”等形式，返回地支 */
function normalizeYueJiang(raw: string): string {
  for (const ch of raw) {
    if (zhiIndex(ch) >= 0) return ch;
  }
  const byName = Object.entries(YUE_JIANG_NAME).find(([, name]) => raw.includes(name));
  return byName ? byName[0] : '';
}

export function getJinKouJueByDateInfo(dateInfo: JkjDateInfo, diFen: string): JinKouJueChart {
  if (zhiIndex(diFen) < 0) {
    throw new Error(`地分必须是十二地支之一，收到："${diFen}"`);
  }
  const baziArr = (dateInfo.bazi ?? '').split(' ');
  const monthZhi = (baziArr[1] ?? '').charAt(1);
  const dayGan = (baziArr[2] ?? '').charAt(0);
  const timeZhi = (baziArr[3] ?? '').charAt(1);
  const yueJiang = normalizeYueJiang(dateInfo.yuejiang ?? '');
  if (!dayGan || !timeZhi || !yueJiang) {
    throw new Error('历法信息不完整，无法起金口诀课');
  }

  // 1. 人元：日干五鼠遁至地分
  const renYuanName = getWuShuDun(dayGan, diFen);
  const renYuanWuXing = getWuXing(renYuanName);

  // 2. 贵神：名为神将名，干支 = 日干五鼠遁至神支 + 神支
  const guiShenName = getGuiShen(dayGan, timeZhi, diFen);
  const guiShenZhi = getShenGanZhi(guiShenName);
  const guiShenGan = getWuShuDun(dayGan, guiShenZhi);
  const guiShenWuXing = getWuXing(guiShenName);

  // 3. 将神：名用月将别名（如"传送"），干支 = 遁干 + 支，五行按支
  const jiangShenZhi = getJiangShen(yueJiang, timeZhi, diFen);
  const jiangShenName = YUE_JIANG_NAME[jiangShenZhi] ?? jiangShenZhi;
  const jiangShenGan = getWuShuDun(dayGan, jiangShenZhi);
  const jiangShenWuXing = getWuXing(jiangShenZhi);

  // 4. 地分
  const diFenWuXing = getWuXing(diFen);

  const makePosition = (name: string, ganZhi: string, wuXing: string): JinKouJuePosition => ({
    name,
    ganZhi,
    wuXing,
    wangXiangXiuQiu: getWangXiangXiuQiu(wuXing, monthZhi),
  });

  const result: JinKouJueChart = {
    date: { ...dateInfo, bazi: dateInfo.bazi ?? '' },
    diFen,
    siWei: {
      renYuan: makePosition(renYuanName, renYuanName, renYuanWuXing),
      guiShen: makePosition(guiShenName, guiShenGan + guiShenZhi, guiShenWuXing),
      jiangShen: makePosition(jiangShenName, jiangShenGan + jiangShenZhi, jiangShenWuXing),
      diFen: makePosition(diFen, diFen, diFenWuXing),
    },
    shenSha: [],
  };

  result.shenSha = getShenSha(result);
  return result;
}

/** 使用 Date 对象起金口诀课 */
export function getJinKouJueByDate(date: Date, diFen: string): JinKouJueChart {
  return getJinKouJueByDateInfo(getDateByObj(date) as unknown as JkjDateInfo, diFen);
}

/** 使用四柱干支起金口诀课 */
export function getJinKouJueBySiZhu(
  year: string,
  month: string,
  day: string,
  hour: string,
  diFen: string,
): JinKouJueChart {
  return getJinKouJueByDateInfo(getDateBySiZhu(year, month, day, hour) as unknown as JkjDateInfo, diFen);
}
