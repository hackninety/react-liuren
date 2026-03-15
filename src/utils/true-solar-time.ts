/**
 * 真太阳时计算工具
 *
 * 真太阳时 = 北京标准时 + 经度修正 + 时差方程修正
 *
 * 经度修正: (当地经度 - 120°) × 4 分钟/度
 *   - 120° 是北京时间基准经度
 *   - 东边经度 > 120 → 加时间（太阳先到）
 *   - 西边经度 < 120 → 减时间（太阳后到）
 *
 * 时差方程 (Equation of Time):
 *   因地球公转轨道为椭圆 + 黄赤交角，真太阳日并非恒24小时，
 *   需通过时差方程修正，精度约 ±30 秒。
 */

const BEIJING_LONGITUDE = 120;

/**
 * 计算时差方程 (Equation of Time) — 单位：分钟
 * 使用 Spencer (1971) 近似公式，精度 ±30 秒
 */
function equationOfTime(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  // B = 2π(d - 81) / 365，其中 d 为年积日
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;

  // Spencer 公式
  return (
    9.87 * Math.sin(2 * B) -
    7.53 * Math.cos(B) -
    1.5 * Math.sin(B)
  );
}

/**
 * 经度修正 — 单位：分钟
 */
function longitudeCorrection(longitude: number): number {
  return (longitude - BEIJING_LONGITUDE) * 4;
}

/**
 * 计算真太阳时
 * @param date 北京标准时间
 * @param longitude 当地经度（东经，如 116.41 为北京）
 * @returns { trueSolarDate: 修正后的 Date, offsetMinutes: 总修正量(分钟) }
 */
export function toTrueSolarTime(
  date: Date,
  longitude: number,
): { trueSolarDate: Date; offsetMinutes: number } {
  const lngCorrection = longitudeCorrection(longitude);
  const eot = equationOfTime(date);
  const totalMinutes = lngCorrection + eot;

  const trueSolarDate = new Date(date.getTime() + totalMinutes * 60 * 1000);
  return {
    trueSolarDate,
    offsetMinutes: Math.round(totalMinutes * 10) / 10,
  };
}

/**
 * 格式化修正量为可读字符串
 * 例如: "+12.3 分钟" 或 "-5.8 分钟"
 */
export function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '';
  return `${sign}${minutes.toFixed(1)} 分钟`;
}

/**
 * 将任意 Date 转换为北京时间表示
 */
export function toBeijingTime(date: Date): Date {
  const adjustment = (date.getTimezoneOffset() + 480) * 60000;
  return new Date(date.getTime() + adjustment);
}

/**
 * 获取当前北京时间
 */
export function nowBeijing(): Date {
  return toBeijingTime(new Date());
}
