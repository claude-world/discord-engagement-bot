import { SYSTEM_CONTEXT } from './context.js';

export function buildWeeklyRoundupPrompt(): string {
  return `${SYSTEM_CONTEXT}

任務：寫一則「週五週報」貼文，回顧本週社群精華。

格式：
---
**本週回顧 | Week of [日期]**

這週社群有什麼精彩的？

📌 **本週精選**
- [精選話題或討論 1]
- [精選話題或討論 2]

🔥 **Claude Code 更新**
- [最新版本或功能更新，如果有的話]

📚 **推薦閱讀**
- [一篇相關文章或資源]

下週見！祝大家週末愉快 🎉

💬 這週你用 Claude Code 完成了什麼？
---

要求：
- 即使沒有具體社群活動，也可以分享 Claude Code 生態的新聞
- 保持正面、鼓勵的語氣
- 長度 200-350 字`;
}
