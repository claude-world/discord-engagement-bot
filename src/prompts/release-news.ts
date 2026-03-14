import { SYSTEM_CONTEXT } from './context.js';

export function buildReleaseNewsPrompt(version: string, changelog: string): string {
  return `${SYSTEM_CONTEXT}

任務：寫一則「版本更新」通知貼文。

版本號：${version}
更新內容：
${changelog}

格式：
---
**Claude Code ${version} 更新重點**

[1-2 句總結這次更新的重點方向]

🆕 **新功能**
- [功能 1]
- [功能 2]

🔧 **改善**
- [改善 1]

📦 更新指令：\`claude update\`

💬 你最期待哪個新功能？
---

要求：
- 只列最重要的 3-5 個更新
- 用簡單的語言解釋，不要照搬 changelog
- 標明更新指令
- 長度 150-250 字`;
}
