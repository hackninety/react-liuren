# 大六壬排盘系统

现代化的大六壬排盘 Web 应用，基于 [liuren-ts-lib](https://github.com/hackninety/liuren-ts-lib) 算法引擎。

## ✨ 功能特性

- 🎯 **大六壬排盘** — 4×4 天地盘方盘布局 · 四课 · 三传 · 遁干 · 神煞
- 🪙 **金口诀排盘** — 四位（人元/贵神/将神/地分）展示 · 神煞吉凶分析
- 📈 **虚岁流年** — 出生年柱 · 性别 · 当前流年干支
- 🌗 **明暗主题** — 根据系统时间自动切换，支持手动切换
- 📋 **数据导出** — 一键复制 JSON 数据 · AI 分析 Prompt 生成
- 📅 **自定义排盘** — 日期时间选择 / 四柱干支直接输入

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| [Vite](https://vite.dev/) | v7 | 构建工具 |
| [React](https://react.dev/) | v19 | UI 框架 |
| [TypeScript](https://www.typescriptlang.org/) | v5 | 类型安全 |
| [TailwindCSS](https://tailwindcss.com/) | v4 | 样式系统 |
| [Framer Motion](https://motion.dev/) | v12 | 动画 |
| [liuren-ts-lib](https://github.com/hackninety/liuren-ts-lib) | latest | 六壬/金口诀/流年算法 |

## 📦 安装与运行

```bash
# 安装依赖
npm install

# 开发模式（端口 6688）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📁 项目结构

```
src/
├── App.tsx                     # 主应用（Tab 导航 + 排盘集成）
├── main.tsx                    # 入口文件
├── index.css                   # oklch 设计系统（明暗主题）
├── components/
│   ├── TianDiPan.tsx           # 天地盘 4×4 方盘
│   ├── GongCell.tsx            # 宫位单元格
│   ├── SiKePanel.tsx           # 四课面板
│   ├── SanChuanPanel.tsx       # 三传面板
│   ├── BasicInfoPanel.tsx      # 基础信息（八字/月将/旬空）
│   ├── DunGanPanel.tsx         # 遁干面板
│   ├── ShenShaPanel.tsx        # 神煞列表
│   ├── JinKouJuePanel.tsx      # 金口诀四位展示
│   ├── LiuNianPanel.tsx        # 虚岁流年
│   ├── DatePickerDialog.tsx    # 自定义排盘弹窗
│   └── JsonExportPanel.tsx     # 数据导出 & AI 分析
└── utils/
    ├── cn.ts                   # clsx + tailwind-merge
    ├── liuren-colors.ts        # 五行颜色映射
    └── true-solar-time.ts      # 真太阳时计算
```

## 📄 许可协议

MIT
