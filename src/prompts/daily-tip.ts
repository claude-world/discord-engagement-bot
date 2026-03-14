import { SYSTEM_CONTEXT, getTodayTopic } from './context.js';

export function buildDailyTipPrompt(): string {
  const topic = getTodayTopic();

  return `${SYSTEM_CONTEXT}

任務：寫一則「每日技巧」貼文。

主題方向：${topic.tip}

格式範例：
---
**每日技巧：[標題]**

[2-3 個具體技巧，用編號列出]

1. **[技巧名]** - [說明]
\`\`\`
[如果適用，附一小段程式碼或設定範例]
\`\`\`

2. **[技巧名]** - [說明]

3. **[技巧名]** - [說明]

💬 [一個相關的討論問題]
---

要求：
- 標題用 **粗體**
- 技巧要具體可操作，不是空泛建議
- 如果有程式碼範例，用 \`\`\` 包起來
- 結尾討論問題要容易回答
- 總長度 150-300 字`;
}

/**
 * Fallback content when CLI is unavailable.
 */
export const DAILY_TIP_FALLBACKS = [
  `**每日技巧：三個讓 CLAUDE.md 更有效的寫法**

1. **明確角色定義** - 在最上方寫清楚「你是 X 專案的 Y 角色」，Claude 會更精準地回應
\`\`\`markdown
# CLAUDE.md
你是 MyApp 的資深後端工程師，熟悉 TypeScript + PostgreSQL
\`\`\`

2. **加入專案慣例** - 列出命名規則、檔案結構、測試要求，減少來回溝通
\`\`\`markdown
## 慣例
- 函式名稱用 camelCase
- 每個 PR 至少一個測試
\`\`\`

3. **用 rules/ 拆分** - 把不同情境的規則放在 \`.claude/rules/\` 下，用 \`paths:\` 限定觸發範圍

💬 你的 CLAUDE.md 有多長？都放了什麼？`,

  `**每日技巧：MCP Server 快速上手**

1. **用 stdio transport** - 最簡單的連接方式，直接跑本地指令
\`\`\`json
{
  "mcpServers": {
    "my-tool": {
      "command": "npx",
      "args": ["my-mcp-server"]
    }
  }
}
\`\`\`

2. **善用 resources** - 讓 Claude 讀取外部資料（DB、API、檔案系統）
3. **一個 server 一個功能** - 不要把所有工具塞在同一個 server

💬 你目前用了哪些 MCP server？推薦一下！`,

  `**每日技巧：Claude Code 除錯三步驟**

1. **先看錯誤訊息** - 用 \`/diagnose\` 讓 Claude 分析完整的 error stack
2. **縮小範圍** - 如果問題在測試，先跑單一測試檔 \`npx vitest run path/to/test.ts\`
3. **給 Claude 上下文** - 把相關檔案路徑告訴它，不要讓它猜

\`\`\`bash
# 好的提問方式
claude "src/api/users.ts 的 getUser 函式回傳 null，但 DB 有資料，幫我查"
\`\`\`

💬 你遇過最難 debug 的 Claude Code 問題是什麼？`,

  `**每日技巧：善用 Agent 模式提升效率**

1. **讓 Agent 自己跑** - 用 \`--allowedTools\` 指定允許的工具，然後放手
\`\`\`bash
claude --allowedTools "Read,Write,Edit,Bash" "重構 src/utils/ 下所有 helper functions"
\`\`\`

2. **Agent Teams** - 多個 Agent 協作，各自獨立 context window，互不干擾
3. **設好 hooks** - PreToolUse hook 可以在 Agent 執行危險操作前攔截

💬 你試過讓 Claude Code Agent 自主完成什麼任務？`,

  `**每日技巧：Git Workflow 加速術**

1. **用 /commit** - 讓 Claude 分析 diff 自動寫 commit message
2. **自動 PR** - \`/commit-push-pr\` 一鍵完成 commit → push → create PR
3. **Pre-commit hooks** - 在 \`.claude/settings.json\` 設定 hooks，自動 lint + format

\`\`\`json
{
  "hooks": {
    "PreCommit": [{ "command": "npm run lint" }]
  }
}
\`\`\`

💬 你的 Git workflow 有哪些自動化？分享一下！`,
];
