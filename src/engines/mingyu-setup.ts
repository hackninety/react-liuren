/**
 * mingyu-core 全局时区口径：跟随运行环境本地时区
 *
 * 上游默认 timezoneOffsetMinutesOverride = 480（服务端固定北京时间用），
 * 会把所选时刻换算成东八区墙上时间再取年月日时——在非东八区环境
 * （旅居日本/韩国等）与 lookfate/zslj（按本地钟表时间起课）差出
 * 时辰甚至日柱。置 null 后 mingyu 按 -getTimezoneOffset() 取本地
 * 墙上时间，三引擎口径一致；更精细的地方时校正走「真太阳时」功能。
 *
 * 两个 mingyu 适配器（大六壬/小六壬）各自 import 本模块副作用，
 * 保证绕过 registry 直接引用适配器（如单测）时同样生效。
 */
import { TimeManager } from 'mingyu-core/calendar';

TimeManager.setTimezoneOffsetMinutesOverride(null);
