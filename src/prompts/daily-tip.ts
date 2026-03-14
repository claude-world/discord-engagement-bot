import { SYSTEM_CONTEXT, getTodayTopic, getKnowledgeInstructions } from './context.js';

export function buildDailyTipPrompt(): string {
  const topic = getTodayTopic();
  const knowledge = getKnowledgeInstructions(topic.knowledgeKeys);

  return `${SYSTEM_CONTEXT}
${knowledge}

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
- 技巧要具體可操作，引用真實的指令、設定格式、CLI flags
- 如果有程式碼範例，用 \`\`\` 包起來，確保語法正確
- 結尾討論問題要容易回答
- 總長度 150-300 字
- 不要重複太基礎的入門知識，目標是進階使用者`;
}

/**
 * Fallback content when CLI is unavailable.
 */
export const DAILY_TIP_FALLBACKS = [
  `**每日技巧：三個讓 CLAUDE.md 更有效的寫法**

1. **條件式規則** - 把不同情境的規則放在 \`.claude/rules/\` 下，用 \`paths:\` 限定觸發範圍
\`\`\`markdown
---
paths: src/api/**
---
API 路由必須有 input validation 和 error handling
\`\`\`

2. **動態內容注入** - 用 \`!\` 前綴執行 shell 命令，結果會注入 context
\`\`\`markdown
目前分支：\`!git branch --show-current\`
\`\`\`

3. **精簡至上** - 超過 200 行效果會下降，用 rules/ 分離關注點

💬 你的 CLAUDE.md 有用到 rules/ 拆分嗎？效果如何？`,

  `**每日技巧：MCP Server 進階設定**

1. **環境變數支援** - 在 \`.mcp.json\` 中用 \`\${VAR}\` 引用環境變數
\`\`\`json
{
  "mcpServers": {
    "db": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-postgres"],
      "env": { "DATABASE_URL": "\${DATABASE_URL}" }
    }
  }
}
\`\`\`

2. **分層設定** - 全域放 \`~/.claude/settings.json\`，專案放 \`.mcp.json\`
3. **除錯** - 用 \`/mcp\` 指令檢查連接狀態，stderr 重導到 log 檔

💬 你目前用了哪些 MCP server？推薦一下！`,

  `**每日技巧：Hooks 安全防護三招**

1. **攔截危險寫入** - 用 PreToolUse hook 防止修改 migrations
\`\`\`json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{ "type": "command", "command": "node .claude/hooks/guard.js" }]
    }]
  }
}
\`\`\`

2. **自動格式化** - PostToolUse hook 在每次寫入後跑 prettier
3. **Session 摘要** - SessionEnd hook 自動記錄本次工作內容

💬 你有設定 hooks 嗎？用來做什麼？`,

  `**每日技巧：Agent 開發三要點**

1. **描述要有 examples** - 在 description 中加 \`<example>\` 區塊，Claude 才知道何時觸發
2. **限制工具** - 用 \`tools:\` 欄位限制 agent 可用的工具，避免越權
\`\`\`yaml
---
name: code-reviewer
model: sonnet
tools: ["Read", "Grep", "Glob"]
---
\`\`\`

3. **選對模型** - 簡單任務用 haiku（快 2x），複雜分析用 opus

💬 你有自建 agent 嗎？做什麼用途？`,

  `**每日技巧：工作流程加速術**

1. **\`/loop\` 持續監控** - 定時執行指令，不需手動重複
\`\`\`
/loop 5m 檢查 CI 狀態並報告
\`\`\`

2. **Worktree 隔離** - \`claude --worktree\` 在獨立分支工作，不影響主分支
3. **模型策略** - 探索用 haiku，開發用 sonnet，架構設計用 opus

💬 你的 Claude Code 工作流程有哪些自動化？`,
];
