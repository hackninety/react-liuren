/**
 * 虚岁流年适配器（liuren-ts-lib@3 getNianMing）
 *
 * v3 的性别参数为 "男" | "女"（v1.9 为 1 | 2），此处兼容两种输入，
 * UI 层不需要感知上游签名变化。
 */
import { getNianMing } from 'liuren-ts-lib';
import type { NianMingChart } from './types';

export type GenderInput = 1 | 2 | '男' | '女';

export function computeNianMing(birthDate: Date, gender: GenderInput): NianMingChart {
  const g: '男' | '女' = gender === 1 || gender === '男' ? '男' : '女';
  return getNianMing(birthDate, g);
}
