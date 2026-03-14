import { SYSTEM_CONTEXT, getTodayTopic, getKnowledgeInstructions } from './context.js';

export function buildDiscussionPrompt(): string {
  const topic = getTodayTopic();
  const knowledge = getKnowledgeInstructions(topic.knowledgeKeys);

  return `${SYSTEM_CONTEXT}
${knowledge}

任務：寫一則「午間討論」貼文，引導社群成員互動。

討論風格：${topic.discussion}

格式範例：
---
**午間討論：[問題標題]**

[1-2 句背景描述，設定情境]

[提出一個具體問題或選擇]

> 例如：我自己是 [你的做法]...

歡迎分享你的看法！
---

要求：
- 問題要具體，不要太開放
- 最好是有「選擇」的問題（A 還是 B？）或「分享經驗」的問題
- 先給一個示範回答降低門檻
- 語氣輕鬆，像朋友聊天
- 可以引用知識檔案中的具體功能來設計問題
- 長度 100-200 字
- 不要太嚴肅或學術`;
}

export const DISCUSSION_FALLBACKS = [
  `**午間討論：你怎麼組織 .claude/ 目錄？**

隨著 commands、agents、skills 越來越多，\`.claude/\` 目錄也越來越複雜。

你的組織方式是？

A) 全部平放，檔名就是用途
B) 按功能分子目錄（dev/、ops/、review/）
C) 只用全域的 \`~/.claude/\`
D) 還沒想這麼多...

> 我自己是 B，按 workflow 分目錄。全域放通用的，專案放專案特定的。最近在試 rules/ 拆分條件式規則。

你呢？`,

  `**午間討論：Opus、Sonnet 還是 Haiku？**

Claude Code 現在有三個模型可以切換。你的使用比例大概是？

- **Opus 4.6** — 最強推理，但最慢最貴
- **Sonnet 4.6** — 平衡速度和能力
- **Haiku 4.5** — 快 2 倍，便宜 3 倍

> 我自己大概 Sonnet 70%、Haiku 20%、Opus 10%。Haiku 拿來做探索和簡單任務，Opus 只在設計架構時用。

你的比例是？有什麼切換心得？`,

  `**午間討論：最推薦的 MCP Server？**

如果只能推薦一個 MCP server 給新手，你會推哪個？

幾個熱門選項：
- **filesystem** — 跨目錄檔案操作
- **memory** — 知識圖譜記憶
- **sequential-thinking** — 結構化思考
- **postgres** — 直接操作資料庫
- 自建的 custom server

> 我會推 sequential-thinking，因為它讓 Claude 的推理品質明顯提升，而且設定超簡單。

你的答案是？`,
];
