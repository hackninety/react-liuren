# CLAUDE.md

Claude Code 在本仓库工作时遵循以下约定。

## 协作约定

- **对话语言**：始终用中文交流。
- **Commit 信息**：用中文书写，沿用现有历史风格（`功能：…` / `修复：…` / `维护：…`）。
- **存档式推送**：每完成一项处理，自动 `git commit` 并推送到主分支 `main`（类似存档，无需询问）。
- **姊妹库联动**：本项目引用同一 GitHub 账号（hackninety）下的 `*-ts-lib` 库——`lrdq-ts-lib`、`zslj-ts-lib`（GitHub 依赖，`#semver:*` 跟踪 tag）及 `liuren-ts-lib`、`xiaoliuren-ts-lib`（npm）。任务涉及库侧改动时，可同步修改对应库仓库并推送；GitHub 依赖改完需发新 tag 并更新本仓库 lock。

## 项目速览

大六壬排盘系统（React 19 + Vite + Tailwind CSS 4 + TypeScript），多引擎插件架构，覆盖大六壬 / 金口诀 / 小六壬 / 流年。

- `src/engines/`：排盘引擎（registry 注册多流派：大六壬含 liuren-ts-lib、占事略決古法 zslj、mingyu 等）
- `src/plugins/`：盘面增强插件（毕法、大全神煞、应期、课体细分、行年等，结果写入 `chart.extras`）
- `src/utils/chart-markdown.ts`：盘面 → Markdown 序列化（AI 导出主格式，金标测试锁版式）
- `src/components/JsonExportPanel.tsx`：「数据导出 & AI 分析」面板（MD / JSON / AI Prompt，版式对齐 react-8char）
- 典籍资料（课体原文、类神、断法章节、占例）由 `lrdq-ts-lib` 子路径惰性加载

## 常用命令

- `npm run dev`：开发服务器
- `npm run build`：`tsc -b` 类型检查 + vite 构建（提交前跑）
- `npm test`：vitest 单测（含导出金标测试）
- `npm run lint`：ESLint
