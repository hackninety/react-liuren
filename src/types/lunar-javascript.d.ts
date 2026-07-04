/**
 * lunar-javascript 最小类型声明（上游为纯 JS 包，无官方 d.ts）
 * 仅声明本项目用到的 API。
 */
declare module 'lunar-javascript' {
  export class Lunar {
    /** 农历月（闰月为负数） */
    getMonth(): number;
    /** 农历日 */
    getDay(): number;
    /** 时辰地支，如 "子" */
    getTimeZhi(): string;
    /** 年柱干支（以立春为界） */
    getYearInGanZhiByLiChun(): string;
    /** 月柱干支（以节气为界） */
    getMonthInGanZhiExact(): string;
    /** 日柱干支 */
    getDayInGanZhi(): string;
    /** 时柱干支 */
    getTimeInGanZhi(): string;
  }

  export class Solar {
    static fromDate(date: Date): Solar;
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar;
    getLunar(): Lunar;
  }
}
