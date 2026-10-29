# 大六壬排盘系统

现代化的大六壬排盘 Web 应用：**大六壬 · 金口诀 · 小六壬 · 流年**，多引擎流派切换 + 插件式扩展架构。

## 在 AI 中使用统一 MCP

支持 MCP 的 AI 客户端可直接连接 **[https://mcp.0x7c.cc/mcp](https://mcp.0x7c.cc/mcp)**，传输方式选 **Streamable HTTP**，认证选**无**，无需访问令牌。MCP 负责排盘和检索 common 资料，解读由当前 AI 完成；远程调用会把填写的时间等参数发送到该服务。

统一服务 `paipan-common` 提供 **31 个工具**：6 个跨术数排盘与 common 检索基础工具、11 个 `bazi_` 八字高级工具、14 个 `taiyi_` 太乙高级工具；另有 7 个提示词和 5 个静态资源。本机 stdio 与远程 HTTP 使用同一套能力，每次传完整参数，不使用旧 `chartId`。

`prepare_reading.searchQueries` 可明确提供 1–3 个检索关键词，原问题保留在 `question`，结果会返回实际关键词。

首次配置时按所用客户端选择一条；本机 stdio 与远程 HTTP 二选一。已存在 `paipan-common` 时先在客户端移除旧同名连接再更换方式，旧 `bazi`、`taiyi`、`paipan-common-remote` 连接可移除，避免重复注册。保存后重连 MCP。

安装对应 CLI 后，在终端执行其中一条：

```bash
# Codex
codex mcp add paipan-common --url https://mcp.0x7c.cc/mcp

# Claude Code（当前用户范围）
claude mcp add --transport http --scope user paipan-common https://mcp.0x7c.cc/mcp
```

配置后重新打开客户端会话。已有本机 `paipan-common` 配置时，本机与远程选择一个即可，无需重复添加。命令说明见 [Codex MCP 文档](https://learn.chatgpt.com/docs/extend/mcp)和 [Claude Code MCP 文档](https://code.claude.com/docs/en/mcp)。

连接后可复制以下示例给 AI（请替换成实际起课资料）：

> 请先调用 system_catalog 核对参数，再用 prepare_reading 排大六壬（systems=["liuren"]）。起课时间 eventTime 为公历 2026-10-29 14:30，timezone="+08:00"，不启用真太阳时；使用 lookfate 引擎，研究主题为求财，不开启算命模式。检索 common 中的六壬典籍，再用 corpus_read 读取相关原文，标注书名、资料 ID 和来源，区分盘面字段、原典说法与推测。缺少必要参数时先问我。

统一 MCP 当前覆盖：

| 系统 | 必要输入 | 已开放能力 |
|---|---|---|
| `liuren` 大六壬 | `eventTime` | `lookfate` / `zslj` 两个引擎；common 检索《六壬大全》与《占事略決》 |
| `jinkoujue` 金口诀 | `eventTime`、`options.diFen` | 地分必须是「子」至「亥」的地支汉字；当前无对应 common 典籍 |
| `xiaoliuren` 小六壬 | `eventTime` | 时间法，或 `method="number"` + 正整数 `number`；数字法也需起课时间，当前无对应 common 典籍 |

普通占事只填写起课时间，不需要无关的生日或性别。大六壬若要附本命、行年标记，可另提供出生年与性别；网页的第三引擎、流年页面及扩展插件尚未全部开放为统一 MCP 选项。`chart_calculate` 的选项直接放 `options`；`prepare_reading` 按系统分组，例如 `options={"liuren":{"engine":"zslj"}}`。

所有时间均需明确公历日期、时分和时区（IANA 名或固定偏移，二者在夏令时日期可能不同）。启用真太阳时须明确提供 `eventTime.longitude`，不能由 AI 猜测。要联查人生主题命例，必须明确设置 `fortuneMode=true` 并另提供完整 `birth`；生日不能替代 `eventTime`。默认 `practice` 不读取案例答案；只有明确要求参考答案时，才使用 `corpus_read` 的 `mode="reference"` 与 `includeAnswers=true`。

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

## 命例参考

在数据导出面板手动开启「算命模式」，再展开「命例库」，可检索人生主题案例。当前使用 `mingli-cases-ts-lib` / `mingli-cases-react` 独立 Release `0.1.1`。点击「用于 AI 参考（不含答案）」会附入独立命例及来源；如需答案，先揭晓，再明确点击「用于 AI 参考（含已揭晓答案）」。隐藏答案会撤销含答案的引用。两种引用均只追加到 AI Prompt，纯盘面 MD / TOON 不附加命例。

案例显示出生资料注记、钟点精度与来源；「钟点未核实」和「区间中点」不能视为已证实的精确出生时刻，也不能直接替当前求测人填表。

开关默认关闭，不记忆开启状态。普通占事不加载命例界面或数据；关闭模式、换盘会清除引用。原有六壬占事典籍与占例仍按原规则使用。命例属于其他命主，不能当作当前求测人的经历；起课时间也不会转作出生时间。

门控回归：`npm run test:e2e` 会构建后启动独立临时预览，通过 Playwright 截获真实复制文本，验证默认关闭、仅开启时均不加载资源，展开后按需加载，关闭后复制恢复原文。结果写入忽略目录 `test-results/`。默认使用 Windows 系统 Chrome；其他环境先运行 `npx playwright install chromium`，或用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定浏览器。`E2E_BASE_URL` 可指向已有预览。

## 🛠️ 技术栈与算法引擎

| 技术 | 版本 | 用途 |
|------|------|------|
| [Vite](https://vite.dev/) | v7 | 构建工具 |
| [React](https://react.dev/) | v19 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | v5 | 类型安全 |
| [TailwindCSS](https://tailwindcss.com/) | v4 | 样式系统 |
| [Framer Motion](https://motion.dev/) | v12 | 动画 |

**算法引擎与典籍依赖**（npm 包与 common-ts-lib 的独立 Release 分别锁定）：

| 引擎 | 用途 | 流派 |
|------|------|------|
| [liuren-ts-lib](https://github.com/look-fate/liuren-ts-lib) v3 | 大六壬（默认）、流年、历法 | 通行体系 |
| [mingyu-core](https://github.com/Brhiza/mingyu) | 大六壬（第二引擎） | 《大六壬大全》体系 |
| [zslj-ts-lib](https://github.com/hackninety/common-ts-lib/tree/main/packages/zslj-ts-lib) | 大六壬（第三引擎） | 安倍晴明《占事略決》古法（983 年）：涉害孟仲季、旦暮贵人寅酉界、課用九法、卅六卦课体，附原文锚点与「依经断课」AI 提示词 |
| [lrdq-ts-lib](https://github.com/hackninety/common-ts-lib/tree/main/packages/lrdq-ts-lib) | 毕法命中插件 + 典籍 | 《六壬大全》全书典籍（四庫全書本十三篇，`lrdq-ts-lib/docs` 子入口随典籍抽屉懒加载）；《畢法賦》百法语料，97/100 法机器命中（exact/approx 分级；第93/97/98法为校勘/方法论不设机判） |
| [xiaoliuren-ts-lib](https://www.npmjs.com/package/xiaoliuren-ts-lib) | 小六壬 | 马前课 |
| 本地移植 `src/engines/jinkoujue/` | 金口诀 | 《大六壬金口诀》通行起课法 |

`lrdq-ts-lib` 当前锁定 `0.11.0`，`zslj-ts-lib` 锁定 `0.1.1`；两者源码统一维护于 [common-ts-lib](https://github.com/hackninety/common-ts-lib)，保留独立包名和接口。升级时先发布对应包的 `<包名>-v<版本>` Release，再同步本项目的 `package.json` 与锁文件；生产安装使用固定 `.tgz` 地址。

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
依赖的典籍语料库 [lrdq-ts-lib](https://github.com/hackninety/common-ts-lib/tree/main/packages/lrdq-ts-lib) 自 v0.8.0 起为 **CC BY-NC 4.0（禁止商用）**——古籍原文公有领域，在版权期今注（如《六壬指南注解》張洪注）署名收录、权利人异议即撤。
