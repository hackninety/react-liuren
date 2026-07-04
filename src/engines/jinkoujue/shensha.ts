/**
 * 金口诀神煞计算
 *
 * 移植自 look-fate/liuren-ts-lib（Apache-2.0）src/jinKouJue/shenSha.ts
 * （提交 dbf6253e），规则与输出保持值级兼容。
 */
import type { JinKouJueChart, JinKouJueShenSha } from '../types';
import {
  DI_ZHI,
  FEI_LIAN,
  JIE_SHA,
  LIU_CHONG,
  LIU_HE,
  RI_LU,
  SANG_CHE,
  SHENG_QI,
  SI_MU,
  SI_QIU,
  TIAN_DE,
  TIAN_GAN,
  TIAN_GAN_WU_HE,
  TIAN_GUI,
  TIAN_MA_MONTH,
  TIAN_XI,
  TIAN_YI_GUI_REN,
  TIAN_YI_SHA,
  YI_MA,
  YUE_DE,
  zhiIndex,
} from './maps';

type SiWei = JinKouJueChart['siWei'];

/** 昼占时辰（卯~申） */
const DAY_HOURS = ['卯', '辰', '巳', '午', '未', '申'];

/** 自某支顺（正）/逆（负）数 N 位 */
function getOffsetZhi(startZhi: string, offset: number): string {
  const idx = zhiIndex(startZhi);
  if (idx === -1) return '';
  let target = (idx + offset) % 12;
  if (target < 0) target += 12;
  return DI_ZHI[target];
}

/** 干支在四位中的落位 */
function getPositions(target: string, siWei: SiWei): string[] {
  const pos: string[] = [];
  if (siWei.renYuan.ganZhi.includes(target)) pos.push('人元');
  if (siWei.guiShen.ganZhi.includes(target)) pos.push('贵神');
  if (siWei.jiangShen.ganZhi.includes(target)) pos.push('将神');
  if (siWei.diFen.ganZhi.includes(target)) pos.push('地分');
  return pos;
}

export function getShenSha(result: JinKouJueChart): JinKouJueShenSha[] {
  const shenShaList: JinKouJueShenSha[] = [];
  const siWei = result.siWei;

  const baziParts = (result.date.bazi ?? '').split(' ');
  const yearGanZhi = baziParts[0] ?? '';
  const monthGanZhi = baziParts[1] ?? '';
  const dayGanZhi = baziParts[2] ?? '';
  const hourGanZhi = baziParts[3] ?? '';

  const yearGan = yearGanZhi.charAt(0);
  const yearZhi = yearGanZhi.charAt(1);
  const monthZhi = monthGanZhi.charAt(1);
  const dayGan = dayGanZhi.charAt(0);
  const dayZhi = dayGanZhi.charAt(1);
  const timeZhi = hourGanZhi.charAt(1);

  const addIfIn = (name: string, val: string | undefined, desc: string, type: '吉' | '凶') => {
    if (!val) return;
    const pos = getPositions(val, siWei);
    if (pos.length > 0) {
      shenShaList.push({ name, value: val, position: pos, description: desc, type });
    }
  };

  // --- 吉神 ---

  // 天德
  const tianDeVal = TIAN_DE[monthZhi];
  addIfIn('天德', tianDeVal, '主化解百祸，逢凶化吉', '吉');

  // 天德合（天德为干取五合，为支取六合）
  if (tianDeVal) {
    const tianDeHe = (TIAN_GAN as readonly string[]).includes(tianDeVal)
      ? TIAN_GAN_WU_HE[tianDeVal]
      : LIU_HE[tianDeVal];
    addIfIn('天德合', tianDeHe, '主解百祸，吉庆，化凶解忧', '吉');
  }

  // 月德 / 月德合
  const yueDeVal = YUE_DE[monthZhi];
  addIfIn('月德', yueDeVal, '主和睦，万事顺达', '吉');
  if (yueDeVal) {
    addIfIn('月德合', TIAN_GAN_WU_HE[yueDeVal], '作用同月德，吉庆稍次', '吉');
  }

  // 天赦（春戊寅，夏甲午，秋戊申，冬甲子）
  const monthIdx = zhiIndex(monthZhi);
  let season = '冬';
  if (monthIdx >= 2 && monthIdx <= 4) season = '春';
  else if (monthIdx >= 5 && monthIdx <= 7) season = '夏';
  else if (monthIdx >= 8 && monthIdx <= 10) season = '秋';

  let sheVals: string[] = [];
  if (season === '春' && dayGanZhi === '戊寅') sheVals = ['戊', '寅'];
  if (season === '夏' && dayGanZhi === '甲午') sheVals = ['甲', '午'];
  if (season === '秋' && dayGanZhi === '戊申') sheVals = ['戊', '申'];
  if (season === '冬' && dayGanZhi === '甲子') sheVals = ['甲', '子'];
  sheVals.forEach((v) => addIfIn('天赦', v, '主解刑禁、官司、危险之灾', '吉'));

  // 天喜 / 天医 / 天马 / 驿马
  addIfIn('天喜', TIAN_XI[monthZhi], '主家中喜庆、婚姻、进财', '吉');
  addIfIn('天医', TIAN_YI_SHA[monthZhi], '问病忧中有乐，得良医', '吉');
  addIfIn('天马', TIAN_MA_MONTH[monthZhi], '主办事迅速，逃亡远去不归', '吉');
  addIfIn('驿马', YI_MA[dayZhi], '主求事迅速，升迁远行', '吉');

  // 三奇（课内人元/贵神/将神之干集齐）
  const lessonStems = new Set<string>();
  const checkStem = (gz: string) => {
    if (gz.length > 0 && (TIAN_GAN as readonly string[]).includes(gz[0])) lessonStems.add(gz[0]);
  };
  checkStem(siWei.renYuan.ganZhi);
  checkStem(siWei.guiShen.ganZhi);
  checkStem(siWei.jiangShen.ganZhi);

  const addSanQi = (stems: string[], name: string) => {
    if (stems.every((s) => lessonStems.has(s))) {
      stems.forEach((s) => addIfIn(name, s, '利见大人，百事吉昌', '吉'));
    }
  };
  addSanQi(['甲', '戊', '庚'], '天三奇');
  addSanQi(['乙', '丙', '丁'], '地三奇');
  addSanQi(['壬', '癸', '辛'], '人三奇');

  // 生气
  addIfIn('生气', SHENG_QI[monthZhi], '绝处逢生，开辟新事业', '吉');

  // 六甲（人元见甲）
  if (siWei.renYuan.ganZhi === '甲') {
    shenShaList.push({ name: '六甲', value: '甲', position: ['人元'], description: '主有不测之喜，为头目', type: '吉' });
  }

  // --- 凶煞 ---

  // 劫煞
  addIfIn('劫煞', JIE_SHA[dayZhi], '常人主凶伤、官司', '凶');

  // 截命灾煞（甲己见申酉…）
  const jieMingMap: Record<string, string[]> = {
    甲: ['申', '酉'], 己: ['申', '酉'], 乙: ['午', '未'], 庚: ['午', '未'],
    丙: ['辰', '巳'], 辛: ['辰', '巳'], 丁: ['寅', '卯'], 壬: ['寅', '卯'],
    戊: ['子', '丑'], 癸: ['子', '丑'],
  };
  (jieMingMap[dayGan] || []).forEach((v) => addIfIn('截命灾煞', v, '求谋不通，出行受阻', '凶'));

  // 五鬼
  const wuGuiMap: Record<string, string[]> = {
    甲: ['巳', '午'], 己: ['巳', '午'], 乙: ['寅', '卯'], 庚: ['寅', '卯'],
    丙: ['子', '丑'], 辛: ['子', '丑'], 丁: ['戌', '亥'], 壬: ['戌', '亥'],
    戊: ['申', '酉'], 癸: ['申', '酉'],
  };
  (wuGuiMap[dayGan] || []).forEach((v) => addIfIn('五鬼', v, '损财、官司、车祸', '凶'));

  // 丧门（太岁前二）、吊客（太岁后二）
  addIfIn('丧门', getOffsetZhi(yearZhi, 2), '主凶丧、孝服、哭泣', '凶');
  addIfIn('吊客', getOffsetZhi(yearZhi, -2), '主阴私、凶伤、亲朋凶丧', '凶');

  // 丧车、天鬼
  addIfIn('丧车', SANG_CHE[monthZhi], '主病灾、车祸、血光', '凶');
  addIfIn('天鬼', TIAN_GUI[monthZhi], '主凶灾，鬼变', '凶');

  // 灭门（阳月退三、阴月进三）
  const isYangMonth = ['子', '寅', '辰', '午', '申', '戌'].includes(monthZhi);
  addIfIn('灭门', getOffsetZhi(monthZhi, isYangMonth ? -3 : 3), '忌迁居、嫁娶，主病灾', '凶');

  // 天罗（日支前一）/ 地网（天罗对冲）
  const tianLuo = getOffsetZhi(dayZhi, 1);
  addIfIn('天罗', tianLuo, '主牢狱官司', '凶');
  addIfIn('地网', LIU_CHONG[tianLuo], '主牢狱官司', '凶');

  // 关 / 隔 / 锁（下位上乘特定支）
  const checkStack = (bottom: string, top: string, name: string) => {
    if (siWei.diFen.ganZhi === bottom && siWei.jiangShen.ganZhi.endsWith(top)) {
      shenShaList.push({ name, value: `${bottom}${top}`, position: ['地分', '将神'], description: '关节不通，囚禁', type: '凶' });
    }
    if (siWei.jiangShen.ganZhi.endsWith(bottom) && siWei.guiShen.ganZhi.endsWith(top)) {
      shenShaList.push({ name, value: `${bottom}${top}`, position: ['将神', '贵神'], description: '关节不通，囚禁', type: '凶' });
    }
  };
  checkStack('酉', '寅', '关');
  checkStack('卯', '戌', '隔');
  checkStack('卯', '申', '锁');

  // 四绝
  const checkPair = (z1: string, z2: string, name: string) => {
    const p1 = getPositions(z1, siWei);
    const p2 = getPositions(z2, siWei);
    if (p1.length > 0 && p2.length > 0) {
      shenShaList.push({ name, value: `${z1}${z2}`, position: [...new Set([...p1, ...p2])], description: '主办事难成，劳而无功', type: '凶' });
    }
  };
  checkPair('寅', '酉', '金绝');
  checkPair('卯', '申', '木绝');
  checkPair('午', '亥', '水绝');
  checkPair('子', '巳', '火绝');

  // 四败
  const hasWuXing = (wx: string) =>
    [siWei.renYuan, siWei.guiShen, siWei.jiangShen, siWei.diFen].some((p) => p.wuXing === wx);
  if (getPositions('酉', siWei).length > 0 && (hasWuXing('水') || hasWuXing('土'))) addIfIn('四败', '酉', '主拘禁、口舌', '凶');
  if (getPositions('卯', siWei).length > 0 && hasWuXing('火')) addIfIn('四败', '卯', '主拘禁、口舌', '凶');
  if (getPositions('子', siWei).length > 0 && hasWuXing('木')) addIfIn('四败', '子', '主拘禁、口舌', '凶');
  if (getPositions('午', siWei).length > 0 && hasWuXing('金')) addIfIn('四败', '午', '主拘禁、口舌', '凶');

  // 天盗（贵神/将神落子）
  {
    const pos: string[] = [];
    if (siWei.guiShen.ganZhi.endsWith('子')) pos.push('贵神');
    if (siWei.jiangShen.ganZhi.endsWith('子')) pos.push('将神');
    if (pos.length > 0) {
      shenShaList.push({ name: '天盗', value: '子', position: pos, description: '主被盗、失财', type: '凶' });
    }
  }

  // 飞廉、四丘、四墓
  addIfIn('飞廉', FEI_LIAN[monthZhi], '主迅速，非常惊骇', '凶');
  addIfIn('四丘', SI_QIU[monthZhi], '主争论田土坟墓', '凶');
  addIfIn('四墓', SI_MU[monthZhi], '主争讼坟墓之事', '凶');

  // 望门煞（劫煞对冲）
  if (JIE_SHA[dayZhi]) {
    addIfIn('望门煞', LIU_CHONG[JIE_SHA[dayZhi]], '主妄想、空想', '凶');
  }

  // 病符（太岁后一）、官符（贵人对冲）
  addIfIn('病符', getOffsetZhi(yearZhi, -1), '主大病、灾祸', '凶');
  const guiRen = TIAN_YI_GUI_REN[dayGan];
  if (guiRen) {
    const guiRenZhi = DAY_HOURS.includes(timeZhi) ? guiRen.day : guiRen.night;
    addIfIn('官符', LIU_CHONG[guiRenZhi], '主官司刑法', '凶');
  }

  // 六丁、禄倒、马倒
  if (siWei.renYuan.ganZhi === '丁') addIfIn('六丁', '丁', '主家中不安宁', '凶');
  const yearLu = RI_LU[yearGan];
  if (yearLu) addIfIn('禄倒', getOffsetZhi(yearLu, 1), '主百事不顺', '凶');
  const yearMa = YI_MA[yearZhi];
  if (yearMa) addIfIn('马倒', getOffsetZhi(yearMa, 1), '主百事不顺', '凶');

  return shenShaList;
}
