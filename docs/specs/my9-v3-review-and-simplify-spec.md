# My9 当前态代码审查与等价精简 Spec（2026-03-08）

## 1. 目标与范围
- 目标：在不改变用户可见行为的前提下，先完成一轮“稳定性 + 可维护性”精简。
- 范围：`app/`、`components/`、`lib/`、`utils/` 的运行链路与重复代码。
- 非目标：UI/交互重设计、数据结构破坏性迁移、功能新增。

## 2. 当前运行逻辑（As-Is）
### 2.1 页面入口
- `/` 进入创建页：渲染 `My9V3App`。
- `/s/[shareId]` 进入只读分享页：加载分享数据并禁用编辑。
- `/trends` 展示聚合趋势榜。

### 2.2 前端核心状态（My9V3App）
- 维护 9 宫格 `games[9]`、`creatorName`、单步撤销快照、搜索弹窗状态、评论弹窗状态、提示 toast。
- 创建页会读取/写入 `localStorage` 草稿（key: `my-nine-games:v1`）。
- 只读页会加载分享数据并上报 `/api/share/touch` 更新时间。

### 2.3 搜索链路
- 前端调用 `/api/games/search?q=...`。
- 后端转 Bangumi API，返回标准化搜索结果、推荐项、兜底建议。
- 前端按 `topPickIds` 重排结果，支持键盘上下/回车选择。

### 2.4 分享链路
- 前端 POST `/api/share`（creator + 9 宫格数据）。
- 后端生成 `shareId`，写入 KV（失败回退内存），返回 `/s/{shareId}`。
- 前端跳转到只读页并展示分享操作（复制链接、导出图片）。

### 2.5 趋势链路
- `/api/trends` 读取周期内分享数据，按维度（overall/genre/decade/year）聚合并缓存。
- 样本数 `<30` 时返回空榜，前端显示“样本不足”。

### 2.6 分享图链路
- `/api/share-image/[shareId]` 与 `/api/og/share/[shareId]` 均生成 `next/og` 图片。
- 前端也支持 Canvas 本地导图（标准版与二维码增强版）。

## 3. 审查结论（问题清单）

| 级别 | 问题 | 影响 | 位置 | 处置状态 |
|---|---|---|---|---|
| P0 | 入口组件路径与文件名不一致，生产构建直接失败 | 阻断上线 | `app/page.tsx`, `app/s/[shareId]/page.tsx`, `app/components/GameGridV3App.tsx` | 已修复 |
| P1 | 3 条搜索 API 路由实现重复 | 维护成本高，改动易漏 | `app/api/games/search/route.ts`, `app/api/search/route.ts`, `app/api/bangumi-search/route.ts` | 已修复 |
| P1 | 2 条分享图 API 路由实现重复 | 维护成本高，改动易漏 | `app/api/share-image/[shareId]/route.ts`, `app/api/og/share/[shareId]/route.ts` | 已修复 |
| P1 | `next.config.js` 默认忽略 TS 与 ESLint 构建错误 | 问题被掩盖，质量门失效 | `next.config.js` | 已修复 |
| P2 | 未使用遗留模块较多（旧 tooltip、旧 analytics、旧分享文案工具） | 增加认知负担与 lint 噪音 | `app/components/ui/tooltip.tsx` 等 | 已修复 |
| P2 | 全局禁用 `focus-visible` | 可访问性退化，键盘可用性变差 | `app/globals.css` | 待处理 |
| P2 | KV 不可用时只用进程内内存存储 | 多实例/重启后数据不可见 | `lib/share/storage.ts` | 已知风险 |
| P3 | 文档与现状不一致（提及 locale 目录等） | 新贡献者误判架构 | `AGENTS.md` | 待处理 |

## 4. 第一阶段等价精简（This Change Set）
### 4.1 已实施
- 组件命名/路径对齐：`GameGridV3App.tsx` -> `My9V3App.tsx`。
- 抽取 `lib/bangumi/route.ts`：统一搜索路由处理。
- 抽取 `lib/share/imageRoute.ts`：统一分享图路由处理。
- `app/api/share/route.ts` 去除 `any`，改为 `unknown + Record` 解析。
- 删除未使用遗留模块：
  - `app/components/ui/tooltip.tsx`
  - `components/ui/tooltip.tsx`
  - `lib/analytics.ts`
  - `utils/share/copyBuilder.ts`
  - `utils/share/platformUrls.ts`
- `My9V3App` 内部抽出 `createSearchMeta`，消除重复状态模板。
- 修复 `ShareImagePreviewDialog` effect 依赖遗漏（保证预览刷新逻辑一致）。

### 4.2 验收标准
- `npm run lint` 通过。
- `npm run build` 通过。
- 主页、分享页、搜索、保存、只读页、导图流程行为不变。

## 5. 下一阶段建议（破坏性改造前）
1. 先恢复质量门：移除 `ignoreDuringBuilds` 与 `ignoreBuildErrors`。
2. 为分享/趋势核心链路补单元测试与 API 集成测试。
3. 拆分 `My9V3App`（状态机/自定义 hooks）降低单组件复杂度。
4. 明确存储策略（KV 必需化，或本地开发 fallback 仅 dev 环境）。
5. 清理或重写与现状不符的仓库指南。

## 6. 第二批执行记录（2026-03-08）
### 6.1 已完成
- 恢复构建质量门：删除 `next.config.js` 中对 ESLint/TypeScript 的忽略配置。
- 清理图片告警：前端页面与弹窗中的 `<img>` 统一改为 `next/image`；`next/og` 生成文件保留 `<img>` 并加规则豁免。
- 修复质量门恢复后暴露的隐藏类型问题：
  - `My9V3App` 中 `initialShareId` 异步闭包窄化问题。
  - `lib/share/trends.ts` 中 `Map.entries()` 迭代类型问题。
  - `qrcode` 缺失类型声明问题（补充 `@types/qrcode`）。

### 6.2 验证结果
- `npm run lint`：通过，0 warning / 0 error。
- `npm run build`：通过（启用真实 lint + type check）。
- `npm run test:e2e`：6/6 通过。

## 7. 第三批执行记录（2026-03-08）
### 7.1 已完成
- 抽取公共页脚组件 `components/layout/SiteFooter.tsx`，替换主页与趋势页重复 footer。
- 抽取法律文档模板 `components/legal/LegalDocumentPage.tsx`，替换隐私政策/使用条款/商业声明三页重复结构。
- 删除 `app/globals.css` 中已无引用的 `github-corner` 动画样式。

### 7.2 验证结果
- `npm run lint`：通过。
- `npm run build`：通过。
- `npm run test:e2e`：6/6 通过。
