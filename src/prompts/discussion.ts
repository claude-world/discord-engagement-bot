import { SYSTEM_CONTEXT, getTodayTopic } from './context.js';

export function buildDiscussionPrompt(): string {
  const topic = getTodayTopic();

  return `${SYSTEM_CONTEXT}

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
- 長度 100-200 字
- 不要太嚴肅或學術`;
}

export const DISCUSSION_FALLBACKS = [
  `**午間討論：你的 Claude Code 日常是什麼？**

好奇大家每天用 Claude Code 做什麼？

是主要拿來寫新功能、修 bug、還是 code review？大概一天花多少時間在上面？

> 我自己大概 70% 寫新功能、20% debug、10% 重構。平均一天跟 Claude 對話 3-4 小時。

來分享你的使用比例！`,

  `**午間討論：Terminal 還是 IDE？**

用 Claude Code 的時候，你偏好在哪裡操作？

A) 純 Terminal（iTerm / Warp / 內建）
B) VS Code 內建 Terminal
C) JetBrains Terminal
D) 其他

> 我自己是用 iTerm + tmux，一個 pane 跑 Claude，旁邊開 VS Code 看程式碼。

你的 setup 是什麼？`,

  `**午間討論：最推薦的 MCP Server？**

如果只能推薦一個 MCP server 給新手，你會推哪個？

幾個常見的選項：
- filesystem - 檔案操作
- sequential-thinking - 思考輔助
- browser - 網頁操作
- 自己寫的 custom server

> 我會推 filesystem，因為幾乎每個專案都用得到，設定也最簡單。

你的答案是？`,
];
