# 大六壬排盘系统

现代化的大六壬排盘 Web 应用：**大六壬 · 金口诀 · 小六壬 · 流年**，多引擎流派切换 + 插件式扩展架构。

## ✨ 功能特性

- 🎯 **大六壬排盘** — 4×4 天地盘方盘布局 · 四课 · 三传 · 遁干 · 建除 · 神煞 · 阴阳贵人
- 🔀 **多流派引擎** — 引擎适配器架构，支持流派切换（通行体系 / 《大六壬大全》体系）
- 🧩 **扩展插件** — 课体细分+课名 · 十二长生 · 五行旺衰 · 神煞补充 · 本命行年，可独立开关
- 🪙 **金口诀排盘** — 四位（人元/贵神/将神/地分）· 旺相休囚死 · 神煞落位
- 🧭 **小六壬（马前课）** — 时间/数字起课 · 六宫六亲六神 · 五行星
- 📈 **虚岁流年** — 出生年柱 · 性别 · 当前流年干支
- 🌗 **明暗主题** — 根据系统时间自动切换，支持手动切换
- 📋 **数据导出** — 一键复制 JSON 数据 · AI 分析 Prompt 生成（附流派标注）
- 📅 **自定义排盘** — 日期时间选择 / 四柱干支直接输入

## 🛠️ 技术栈与算法引擎

| 技术 | 版本 | 用途 |
|------|------|------|
| [Vite](https://vite.dev/) | v7 | 构建工具 |
| [React](https://react.dev/) | v19 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | v5 | 类型安全 |
| [TailwindCSS](https://tailwindcss.com/) | v4 | 样式系统 |
| [Framer Motion](https://motion.dev/) | v12 | 动画 |

**算法引擎**（全部来自 npm，可独立升级）：

| 引擎 | 用途 | 流派 |
|------|------|------|
| [liuren-ts-lib](https://github.com/look-fate/liuren-ts-lib) v3 | 大六壬（默认）、流年、历法 | 通行体系 |
| [mingyu-core](https://github.com/Brhiza/mingyu) | 大六壬（第二引擎） | 《大六壬大全》体系 |
| [xiaoliuren-ts-lib](https://www.npmjs.com/package/xiaoliuren-ts-lib) | 小六壬 | 马前课 |
| 本地移植 `src/engines/jinkoujue/` | 金口诀 | 《大六壬金口诀》通行起课法 |

> 金口诀模块自 liuren-ts-lib v2.0.0 起被上游移除，本项目按经典起课法本地实现（类型契约与 v1.9 兼容）。

## 🏗️ 架构

核心思想：**UI 只消费统一领域模型，算法库通过引擎适配器接入，扩展算法以插件形式挂载**。上游库发生破坏性变更时只需修改对应适配器文件。

```
src/
├── engines/                    # 引擎适配层
│   ├── types.ts                # 统一领域模型（LiuRenChart 等，UI 唯一消费的类型）
│   ├── registry.ts             # 引擎注册表（流派切换唯一入口）
│   ├── daliuren/
│   │   ├── lookfate.ts         # liuren-ts-lib@3 适配器（日期 + 四柱起课）
│   │   └── mingyu.ts           # mingyu-core 适配器（仅日期起课）
│   ├── jinkoujue/              # 金口诀本地实现（人元/贵神/将神/地分 + 神煞）
│   ├── xiaoliuren/             # 小六壬引擎适配器
│   └── nianming.ts             # 流年适配器
├── plugins/                    # 扩展插件层（纯函数，消费统一模型）
│   ├── keti-detail.ts          # 课体细分 + 课名（第几局）
│   ├── chang-sheng.ts          # 十二长生
│   ├── wang-shuai.ts           # 五行旺衰
│   ├── shensha-extra.ts        # 神煞补充（桃花/劫煞/华盖）
│   └── xingnian.ts             # 本命 · 行年上盘标注
└── components/                 # UI 组件（TianDiPan / SiKePanel / SanChuanPanel …）
```

**新增流派引擎**：在 `engines/daliuren/` 实现 `DaLiuRenEngine` 接口输出统一模型，在 `registry.ts` 注册即可。
**新增插件**：在 `plugins/` 实现 `LiuRenPlugin` 接口，在 `plugins/index.ts` 注册即可。

## 📦 安装与运行

```bash
# 安装依赖
npm install

# 开发模式（端口 6688）
npm run dev

# 运行测试（引擎/插件金标断言）
npm test

# 构建生产版本
npm run build
```

## 📄 许可协议

MIT。金口诀模块移植自 [look-fate/liuren-ts-lib](https://github.com/look-fate/liuren-ts-lib) v1.9（Apache-2.0），出处见源码头注释。
