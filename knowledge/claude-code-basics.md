# Claude Code 基礎知識

## 版本與模型
- 最新版: v2.1.71+
- 模型選項: Opus 4.6 (最強), Sonnet 4.6 (平衡), Haiku 4.5 (快速便宜)
- Opus 4.6 effort levels: low / medium (預設) / high ("ultrathink")
- Haiku 比 Sonnet 快 2x，費用 1/3
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
| `/fork` | 分叉對話 |
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
- `acceptEdits` - 自動接受編輯
- `plan` - 需要核准計畫
- `ask` - 每次都問
- `deny` - 拒絕
- `Bash(git:*)` - 只允許 git 相關的 bash 指令
