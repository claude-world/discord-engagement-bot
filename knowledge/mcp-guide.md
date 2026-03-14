# MCP (Model Context Protocol) 整合指南

## 什麼是 MCP
MCP 讓 Claude Code 連接外部工具和資料源。一個 MCP server 提供 tools（動作）和 resources（資料）。

## 設定方式

### 專案層級 (.mcp.json)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-filesystem", "/path/to/dir"]
    }
  }
}
```

### 全域層級 (~/.claude/settings.json)
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-memory"]
    }
  }
}
```

## 常用 MCP Servers

| Server | 用途 | 安裝 |
|--------|------|------|
| filesystem | 檔案操作（跨目錄） | `@anthropic/mcp-filesystem` |
| memory | 知識圖譜記憶 | `@anthropic/mcp-memory` |
| sequential-thinking | 結構化思考 | `@anthropic/mcp-sequential-thinking` |
| postgres | PostgreSQL 操作 | `@anthropic/mcp-postgres` |
| puppeteer | 瀏覽器自動化 | `@anthropic/mcp-puppeteer` |
| github | GitHub API | `@anthropic/mcp-github` |
| slack | Slack 整合 | `@anthropic/mcp-slack` |

## 環境變數支援
```json
{
  "mcpServers": {
    "db": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-postgres"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

## 自建 MCP Server
```typescript
import { McpServer } from "@anthropic/sdk/mcp";

const server = new McpServer({ name: "my-tools", version: "1.0.0" });

server.tool("search_docs", { query: z.string() }, async ({ query }) => {
  const results = await searchDocs(query);
  return { content: [{ type: "text", text: JSON.stringify(results) }] };
});

server.run(); // stdio transport
```

## 除錯 MCP
- `/mcp` — 查看已連接的 servers
- `claude --mcp-config path/to/.mcp.json` — 指定設定檔
- Server log 通常在 stderr，用 `2>mcp.log` 重導
- 常見問題：npx 版本不對、環境變數未設定、port 被佔用
