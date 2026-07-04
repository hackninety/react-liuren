/**
 * mingyu-core（Brhiza/mingyu）大六壬引擎适配器 —— 第二流派
 *
 * 上游为独立实现（《大六壬大全》《大六壬指南》体系）：昼夜贵人、
 * 课体标签、天将全属性。限制：仅支持日期起课（无四柱直输）、
 * 神煞为汇总级。
 */
import { generateLiuren } from 'mingyu-core/divination/liuren';
import type {
  LiurenData,
  LiurenLesson,
  LiurenTransmission,
} from 'mingyu-core/types';
import {
  DI_ZHI,
  type ChuanItem,
  type DaLiuRenEngine,
  type GongInfo,
  type LiuRenChart,
  type ShenShaEntry,
  type SiKeItem,
} from '../types';
import { zhiIndex } from '../jinkoujue/maps';

function toGong(data: LiurenData): GongInfo[] {
  const gong: GongInfo[] = DI_ZHI.map((diZhi) => ({ diZhi, tianZhi: '', tianJiang: '' }));
  for (const item of data.heavenlyPlate ?? []) {
    const idx = zhiIndex(item.under);
    if (idx < 0) continue;
    gong[idx] = {
      diZhi: DI_ZHI[idx],
      tianZhi: item.branch,
      tianJiang: item.god,
    };
  }
  return gong;
}

function toSiKe(lessons: LiurenLesson[]): SiKeItem[] {
  const names = ['一课', '二课', '三课', '四课'] as const;
  return names.map((name, i) => {
    const lesson = lessons[i];
    return {
      name,
      shang: lesson?.upper ?? '',
      xia: lesson?.lower ?? '',
      tianJiang: lesson?.god ?? '',
    };
  });
}

function toChuan(item?: LiurenTransmission): ChuanItem {
  return {
    zhi: item?.branch ?? '',
    tianJiang: item?.god ?? '',
    liuQin: item?.relation || undefined,
  };
}

function toShenSha(summary?: string[]): ShenShaEntry[] {
  return (summary ?? [])
    .filter((s) => s.length > 0)
    .map((s) => {
      // 兼容 "名：值" / "名:值" / 纯文本
      const m = s.match(/^(.+?)[：:](.+)$/);
      return m ? { name: m[1].trim(), value: m[2].trim() } : { name: s, value: '' };
    });
}

function toChart(data: LiurenData): LiuRenChart {
  const { ganzhi } = data;
  const bazi = [ganzhi.year, ganzhi.month, ganzhi.day, ganzhi.hour].join(' ').trim();
  const transmissions = data.threeTransmissions ?? [];

  return {
    meta: {
      engineId: 'mingyu',
      engineName: 'mingyu-core',
      school: '大全体系',
    },
    dateInfo: {
      bazi,
      yueJiang: data.monthLeader ?? '',
      kongWang: data.xunKong ?? [],
      dayNight: data.dayNight === '昼占' ? '昼' : data.dayNight === '夜占' ? '夜' : undefined,
    },
    gong: toGong(data),
    siKe: toSiKe(data.fourLessons ?? []),
    sanChuan: {
      chu: toChuan(transmissions[0]),
      zhong: toChuan(transmissions[1]),
      mo: toChuan(transmissions[2]),
      keTi: data.guaTi?.[0] || data.transmissionRule || '',
      method:
        [data.transmissionRule, data.transmissionPattern].filter(Boolean).join(' · ') || undefined,
    },
    shenSha: toShenSha(data.shenShaSummary),
    extras: {
      mingyu: {
        patternTags: data.patternTags,
        guaTi: data.guaTi,
        lessonSummary: data.lessonSummary,
        transmissionSummary: data.transmissionSummary,
        transmissionDetail: data.transmissionDetail,
        dayOfficer: data.dayOfficer,
        noblemanBranch: data.noblemanBranch,
      },
    },
    raw: data,
  };
}

export const mingyuDaLiuRen: DaLiuRenEngine = {
  id: 'mingyu',
  name: 'mingyu-core',
  school: '大全体系',
  capabilities: {
    siZhu: false,
    shenSha: 'summary',
    yinYangGuiRen: false,
    dunGan: false,
  },
  byDate: (date) => toChart(generateLiuren(date)),
};
