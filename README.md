# 大六壬排盘系统

现代化的大六壬排盘 Web 应用：**大六壬 · 金口诀 · 小六壬 · 流年**，多引擎流派切换 + 插件式扩展架构。

## ✨ 功能特性

- 🎯 **大六壬排盘** — 4×4 天地盘方盘布局 · 四课 · 三传 · 遁干 · 建除 · 神煞 · 阴阳贵人
- 🔀 **多流派引擎** — 引擎适配器架构，三流派切换（通行体系 / 《大六壬大全》体系 / 《占事略決》古法），三传多派对照互证
- 🧩 **扩展插件** — 课体细分+课名 · 十二长生 · 五行旺衰 · 神煞补充 · **大全神煞**（《六壬大全》卷一立成：三表落支入传标记 + 课传各位当月吉凶神） · 本命行年 · **毕法赋命中**（《畢法賦》百法，97/100 法机器检测，年命类法随本命行年插件联动） · **应期候选**（初末传值日/合/冲、旬空填实、驿马、三合虚一、墓冲开等机器可算候选池，附来由），可独立开关
- 📜 **典籍库** — 内置《占事略決》全书 + 《六壬大全》全书十三篇（序、起例、神將釋、歌賦、兵占、宿度分野、課經集一~四、畢法賦上下；双书并册、离线可读），古法排盘深链原文条文、毕法命中断辞可溯源、**课体深链《課經》原文**（70 节结构化，就地展开）
- 🪙 **金口诀排盘** — 四位（人元/贵神/将神/地分）· 旺相休囚死 · 神煞落位
- 🧭 **小六壬（马前课）** — 时间/数字起课 · 六宫六亲六神 · 五行星
- 📈 **虚岁流年** — 出生年柱 · 性别 · 当前流年干支
- 🌗 **明暗主题** — 根据系统时间自动切换，支持手动切换
- 📋 **数据导出 & AI 案卷** — JSON / Markdown 双格式复制与文件导出（MD 更省 token、AI 可直接阅读，含毕法命中、大全神煞、**多派三传对照**（流派一致/有异标注）、**关系摘要**（机器核算生克刑冲，AI 免自算五行）、**应期候选**、**类神**（卷二神將釋要点）、**课体原文引**两书互证节文）· **占事定向 AI Prompt**（婚姻/疾病/求财等 13 类，自动附《指南》《心鏡》对应断法章节 + **相似占例 few-shot**——《指南注解》卷三 135 例结构化，按占事章/课体/日干支/旬空加权检索 top-2 连课式盘图断验原文附入，六步推理流程、断必有据）
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
| [zslj-ts-lib](https://github.com/hackninety/zslj-ts-lib) | 大六壬（第三引擎） | 安倍晴明《占事略決》古法（983 年）：涉害孟仲季、旦暮贵人寅酉界、課用九法、卅六卦课体，附原文锚点与「依经断课」AI 提示词 |
| [lrdq-ts-lib](https://github.com/hackninety/lrdq-ts-lib) | 毕法命中插件 + 典籍 | 《六壬大全》全书典籍（四庫全書本十三篇，`lrdq-ts-lib/docs` 子入口随典籍抽屉懒加载）；《畢法賦》百法语料，97/100 法机器命中（exact/approx 分级；第93/97/98法为校勘/方法论不设机判） |
| [xiaoliuren-ts-lib](https://www.npmjs.com/package/xiaoliuren-ts-lib) | 小六壬 | 马前课 |
| 本地移植 `src/engines/jinkoujue/` | 金口诀 | 《大六壬金口诀》通行起课法 |

> 古法与通行体系的三传在涉害、伏吟、返吟等局面**本应存在分歧**（古今取传规则不同），三传对照条会标注「流派差异」，这正是多流派互证的价值。
>
> 顶栏「典籍」按钮打开典籍库抽屉（`getDocsManifest`/`getDocMarkdown`，react-markdown 懒加载渲染）；古法盘三传下方「本课原文引用」经 `getBookEntry` 就地展开涉及的《占事略決》条文。

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
│   │   ├── mingyu.ts           # mingyu-core 适配器（仅日期起课）
│   │   └── zslj.ts             # zslj-ts-lib 适配器（占事略決古法，日期 + 四柱）
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

本应用代码 MIT。金口诀模块移植自 [look-fate/liuren-ts-lib](https://github.com/look-fate/liuren-ts-lib) v1.9（Apache-2.0），出处见源码头注释。
依赖的典籍语料库 [lrdq-ts-lib](https://github.com/hackninety/lrdq-ts-lib) 自 v0.8.0 起为 **CC BY-NC 4.0（禁止商用）**——古籍原文公有领域，在版权期今注（如《六壬指南注解》張洪注）署名收录、权利人异议即撤。
