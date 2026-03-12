# PR #7 本地验证分支与初步合并方案

## 分支信息
- 验证分支：`verify/pr-7-merge`
- 合并对象：`pr-7`（来源：`https://github.com/SomiaWhiteRing/my9/pull/7`）
- 合并方式：在本地基于最新 `main` 执行非快进合并并手动解决冲突

## 冲突与处理策略
- `lib/subject-kind.ts`
  - 保留统一量词字段 `selectionUnit`。
  - 新增 `character` / `person`，并保持旧类别量词为 `部`。
  - 分享标题继续走 `getSubjectKindShareTitle(kind)`，避免分支化字符串逻辑。
- `app/components/HomeKindEntry.tsx`
  - 增加 `character` / `person` 的入口 ref，确保首页类型入口可滚动定位。
- `app/components/v3/SelectedGamesList.tsx`
- `app/components/v3/ReadonlySelectedGamesList.tsx`
  - 为 `character` / `person` 增加 Bangumi 专用跳转（`/character/{id}`、`/person/{id}`）。
  - 避免落到 subject 搜索页导致链接语义不准确。
- `lib/bangumi/search.ts`
- `lib/bangumi/route.ts`
  - 新增角色/人物搜索实现，并在路由按 kind 分发到对应 API。
- `components/share/ShareImagePreviewDialog.tsx`
- `utils/image/exportShareImage.ts`
  - 下载文件名支持按 kind 生成前缀（如“九个角色”“九位人物”）。

## 本地验证结果
- `npm run lint`：通过
- `npm run build`：通过
- `npm run test:e2e`：通过（15/15）

## 初步合并建议
- 已具备推送到远端验证分支并继续人工审查的条件。
- 若准备并入主线，建议按顺序执行：
  1. 推送 `verify/pr-7-merge`。
  2. 在 GitHub 对比该分支与目标 PR 分支差异，确认仅包含预期改动。
  3. 复核 `character/person` 的搜索结果与外链跳转。
  4. 通过后再更新原 PR 或开新 PR 进入主分支流程。
