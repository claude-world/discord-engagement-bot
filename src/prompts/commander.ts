import { SYSTEM_CONTEXT } from './context.js';

/**
 * Build the prompt for parsing natural language commands.
 * The CLI will return JSON with intent + content.
 */
export function buildCommanderPrompt(userInput: string): string {
  return `${SYSTEM_CONTEXT}

你是指揮解析器。用戶用自然語言告訴你要做什麼，你要：
1. 判斷意圖
2. 生成對應的 Discord 貼文內容

用戶輸入：「${userInput}」

請用以下 JSON 格式回覆（不要加 markdown code block）：

{
  "intent": "tip" | "discussion" | "roundup" | "announcement" | "custom",
  "channel": "daily-tips" | "general" | "announcements",
  "content": "生成的 Discord 貼文內容（繁體中文，150-300字，Discord 格式）"
}

判斷邏輯：
- 提到「技巧」「tip」「教學」→ intent: "tip", channel: "daily-tips"
- 提到「討論」「問」「投票」→ intent: "discussion", channel: "daily-tips"
- 提到「週報」「回顧」→ intent: "roundup", channel: "announcements"
- 提到「公告」「通知」→ intent: "announcement", channel: "announcements"
- 其他 → intent: "custom", channel: "general"

content 要是完整的貼文，可以直接發到 Discord。`;
}

export interface CommandResult {
  intent: 'tip' | 'discussion' | 'roundup' | 'announcement' | 'custom';
  channel: string;
  content: string;
}

export function parseCommandResult(raw: string): CommandResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      intent: parsed.intent ?? 'custom',
      channel: parsed.channel ?? 'general',
      content: parsed.content ?? raw,
    };
  } catch {
    // If parsing fails, treat the whole response as content
    return {
      intent: 'custom',
      channel: 'general',
      content: raw,
    };
  }
}
