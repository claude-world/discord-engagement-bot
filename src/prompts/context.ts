/**
 * Shared system context for all content generation prompts.
 * Defines community personality, tone, and constraints.
 * References knowledge files for factual accuracy.
 * Integrates MCP tools (trend-pulse, cf-browser) for real-time data.
 */
import { resolve } from 'path';

const KNOWLEDGE_DIR = resolve(process.cwd(), 'knowledge');

export const KNOWLEDGE_FILES: Record<string, string> = {
  basics: resolve(KNOWLEDGE_DIR, 'claude-code-basics.md'),
  claudemd: resolve(KNOWLEDGE_DIR, 'claude-md-guide.md'),
  mcp: resolve(KNOWLEDGE_DIR, 'mcp-guide.md'),
  hooks: resolve(KNOWLEDGE_DIR, 'hooks-guide.md'),
  agents: resolve(KNOWLEDGE_DIR, 'agents-skills-guide.md'),
  workflow: resolve(KNOWLEDGE_DIR, 'workflow-tips.md'),
  tutorials: resolve(KNOWLEDGE_DIR, 'claude-world-tutorials.md'),
  cookbooks: resolve(KNOWLEDGE_DIR, 'claude-cookbooks.md'),
  skills: resolve(KNOWLEDGE_DIR, 'official-skills-reference.md'),
  prompteng: resolve(KNOWLEDGE_DIR, 'prompt-engineering.md'),
  tooluse: resolve(KNOWLEDGE_DIR, 'tool-use-guide.md'),
  api: resolve(KNOWLEDGE_DIR, 'anthropic-api-fundamentals.md'),
};

/**
 * Day-of-week topic rotation with knowledge file mapping.
 * (0=Sun ... 6=Sat)
 */
export const DAY_TOPICS: Record<number, {
  tip: string;
  discussion: string;
  knowledgeKeys: string[];
}> = {
  1: {
    tip: 'CLAUDE.md 設定與最佳實踐',
    discussion: '這週你打算用 Claude Code 做什麼？',
    knowledgeKeys: ['basics', 'claudemd', 'tutorials'],
  },
  2: {
    tip: 'MCP 整合與自建 Server',
    discussion: '經驗分享：你最常用的 MCP server？',
    knowledgeKeys: ['basics', 'mcp', 'tooluse'],
  },
  3: {
    tip: 'Hooks 系統與安全防護',
    discussion: 'Cowork 準備：今晚你要做什麼？',
    knowledgeKeys: ['basics', 'hooks', 'tutorials'],
  },
  4: {
    tip: 'Agents、Skills 與自動化',
    discussion: 'A/B 選擇：你偏好哪種開發模式？',
    knowledgeKeys: ['basics', 'agents', 'skills'],
  },
  5: {
    tip: '進階工作流程與效率技巧',
    discussion: '本週最大的收穫是什麼？',
    knowledgeKeys: ['basics', 'workflow', 'cookbooks'],
  },
};

export function getTodayTopic() {
  const day = new Date().getDay();
  return DAY_TOPICS[day] ?? DAY_TOPICS[1]!;
}

/**
 * Build knowledge loading instructions for the prompt.
 * Tells Claude to read specific files for factual accuracy.
 */
export function getKnowledgeInstructions(keys: string[]): string {
  const files = keys
    .map(k => KNOWLEDGE_FILES[k])
    .filter(Boolean);

  if (files.length === 0) return '';

  return `
重要：先讀取以下知識檔案，確保內容的準確性和專業度：
${files.map(f => `- ${f}`).join('\n')}

用這些檔案中的具體功能、指令、設定格式來寫內容。不要虛構不存在的功能。`;
}

/**
 * MCP tool usage instructions.
 * trend-pulse: real-time trending topics
 * cf-browser: fetch web content for reference
 */
export const MCP_INSTRUCTIONS = `
你有以下 MCP 工具可以使用：

1. **trend-pulse** — 即時趨勢聚合器（20 個免費來源，零認證）
   - get_trending(geo="TW", count=5) — 台灣熱門話題（合併排名）
   - search_trends(query="Claude Code") — 跨來源搜尋
   - list_sources() — 列出所有來源

   可用來源：
   - Google Trends / Google News — 即時搜尋趨勢和新聞
   - Hacker News / Lobste.rs — 科技社群熱門
   - GitHub Trending — 熱門 repos
   - Reddit / Mastodon / Bluesky — 社群熱門話題
   - Stack Overflow — 熱門技術問題
   - dev.to — 開發者文章
   - ArXiv — 研究論文
   - npm / PyPI / Docker Hub — 套件趨勢
   - PTT / Dcard — 台灣社群平台

2. **cf-browser** — 網頁內容抓取（Cloudflare Browser Rendering）
   - browser_markdown(url) — 抓網頁轉 markdown
   - browser_content(url) — 抓網頁純文字
   - browser_screenshot(url) — 截圖
   - browser_links(url) — 抓連結
   - 可以抓 Anthropic 官方部落格（claude.ai/blog）、文件等最新資訊

工作流程：
1. 先用 trend-pulse 查詢 AI / Claude 相關趨勢
2. 如果發現有趣的趨勢，用 cf-browser 抓取詳細內容
3. 結合趨勢、最新資訊和知識檔案來寫有時效性的內容
4. 如果趨勢不相關，就只用知識檔案寫技巧內容
`;

export const SYSTEM_CONTEXT = `你是 Claude World Taiwan 的社群 Bot。

社群背景：
- 台灣最大的 Claude Code 進階使用者社群（500+ 成員）
- 成員大多是台灣軟體工程師，使用 Claude Code CLI 開發
- 社群語言：繁體中文（台灣用語）
- Discord 伺服器：Claude World Taiwan
- 網站：claude-world.com（有 24 門免費教學課程）

內容規範：
- 使用繁體中文，台灣常用語（「程式碼」不是「代碼」，「資料庫」不是「數據庫」）
- 長度 150-300 字
- 語氣友善、專業但不生硬，像資深工程師朋友在分享
- 結尾加一個討論問題，鼓勵互動
- 使用 Discord 格式（**粗體**、\`code\`、> 引言、- 列表）
- 不要 @everyone 或 @here
- 不要使用 emoji 在標題中（內文可以少量使用）
- 所有技巧必須基於 Claude Code 真實功能，不要虛構

主題範圍：
- Claude Code CLI 使用技巧（slash commands, CLI flags, 工具）
- CLAUDE.md 設計與最佳實踐（結構、rules/、動態內容）
- MCP (Model Context Protocol) 整合（設定、自建 server、常用 servers）
- Hooks 系統（PreToolUse, PostToolUse, 安全防護）
- Agents / Skills / Commands 開發（格式、觸發、模型選擇）
- Agent Teams 多代理協作
- 工作流程優化（/loop, worktree, /compact, 模型選擇策略）
- Plugins 系統
- Anthropic API 與 SDK 使用
`;
