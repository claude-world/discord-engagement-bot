# CLAUDE.md 設計指南

## 檔案層級（載入優先順序）
1. `~/.claude/CLAUDE.md` — 全域（所有專案共用）
2. `CLAUDE.md` — 專案根目錄
3. `.claude/CLAUDE.md` — 專案 .claude 目錄
4. 子目錄的 `CLAUDE.md` — 進入該目錄時才載入

## 最佳結構
```markdown
# 專案名稱

## 技術棧
- Runtime: Node.js + TypeScript
- Framework: Next.js 14
- DB: PostgreSQL + Prisma

## 開發指令
- `pnpm dev` — 開發模式
- `pnpm test` — 跑測試
- `pnpm build` — 建置

## 慣例
- 函式名稱用 camelCase
- 檔案名稱用 kebab-case
- 每個 PR 至少一個測試
- Commit message 用 Conventional Commits

## 重要注意事項
- 不要修改 migrations/ 裡的檔案
- API 路由在 src/app/api/ 下
```

## 進階技巧

### 條件式規則 (.claude/rules/)
```markdown
---
paths: src/api/**
---
API 路由必須有 input validation 和 error handling
```
只有在操作 `src/api/` 下的檔案時才會載入。

### 動態內容
```markdown
開發分支：`!git branch --show-current`
最近修改：`!git log --oneline -5`
```
用 `!` 前綴執行 shell 命令，結果會被注入 context。

### 分離關注點
```
.claude/
  CLAUDE.md          # 主要指引
  rules/
    api.md           # API 相關規則 (paths: src/api/**)
    testing.md       # 測試規則 (paths: **/*.test.*)
    security.md      # 安全規則 (paths: src/auth/**)
  settings.json      # 工具權限設定
  settings.local.json # 本地覆寫（不追蹤）
```

### 常見錯誤
- 太長：超過 200 行效果會下降，精簡為主
- 太模糊：「寫好的程式碼」不如「函式不超過 30 行，單一職責」
- 沒有範例：給 Claude 看你期望的輸出格式
- 重複指示：跟 rules/ 重複的內容只放一處
