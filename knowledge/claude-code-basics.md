# Claude Code 基礎知識

## 版本與模型
- 最新版: v2.1.305+（`claude update` 更新）
- 模型選項: Opus 5.5 (長時間 agentic coding), Sonnet 5.5 (速度與能力平衡), Haiku 5.5 (最快、最便宜)；另有 Fable (`fable` alias)
- API 價格 (input / output，每百萬 tokens): Opus 5.5 $4 / $20、Sonnet 5.5 $2 / $10、Haiku 5.5 $0.10 / $0.50
- Effort levels: `/effort` 或 `--effort` 選 low / medium / high / xhigh / max（`/effort auto` 回到預設）；`ultrathink` 關鍵字讓下一輪用 high effort
- 切換模型: `/model` 或 `--model sonnet`

## 核心 CLI 指令
```bash
claude                          # 互動模式
claude -p "prompt"              # Print mode (非互動)
claude --resume                 # 恢復上次 session
claude --model opus             # 指定模型
claude --worktree               # 在獨立 git worktree 中工作
claude --agent code-reviewer    # 以特定 agent 身份運行
claude --from-pr 123            # 恢復 PR 相關的 session
claude auth login               # 登入認證
```

## 內建 Slash Commands
| 指令 | 功能 |
|------|------|
| `/model` | 切換模型 |
| `/compact` | 壓縮對話歷史 |
| `/clear` | 清除 session |
| `/plan` | 進入計畫模式 |
| `/copy` | 互動式複製程式碼 |
| `/stats` | Session 統計 |
| `/config` | 設定介面 |
| `/permissions` | 權限管理 |
| `/mcp` | MCP server 管理 |
| `/loop 5m /task` | 定時執行指令 |
| `/branch` | 分叉對話（舊名 `/fork` 仍可用） |
| `/debug` | 切換除錯模式 |
| `/help` | 說明 |

## 工具 (Tools)
Claude Code 內建的工具：
- **Read** - 讀取檔案
- **Write** - 寫入新檔案
- **Edit** - 編輯現有檔案
- **Bash** - 執行 shell 指令
- **Grep** - 搜尋檔案內容
- **Glob** - 搜尋檔案名稱
- **Agent** - 啟動子代理
- **WebFetch** - 抓取網頁
- **WebSearch** - 搜尋網路

## 權限模式
用 `--permission-mode` 指定，或用 Shift+Tab 循環切換（`dontAsk` 只能用 flag 設定）：
- `manual` - 每次需要時都詢問
- `acceptEdits` - 自動接受編輯
- `plan` - 只規劃、不修改，需要核准計畫
- `auto` - 由安全分類器判斷是否放行
- `dontAsk` - 不詢問，未預先允許的動作直接拒絕
- `bypassPermissions` - 略過權限檢查（受保護路徑除外；只在隔離環境使用）

權限規則寫在 settings.json 的 `permissions.allow` / `ask` / `deny`：
- `Bash(git:*)` - 只允許 git 相關的 bash 指令
