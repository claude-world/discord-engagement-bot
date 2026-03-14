# Hooks 系統指南

## 什麼是 Hooks
Hooks 是事件驅動的腳本，在 Claude Code 特定動作前後自動執行。用於品質管控、安全防護、自動化。

## 設定位置
- `~/.claude/settings.json` — 全域 hooks
- `.claude/settings.json` — 專案層級

## Hook 類型

| Hook | 觸發時機 | 用途 |
|------|---------|------|
| `PreToolUse` | 工具執行前 | 攔截危險操作、驗證參數 |
| `PostToolUse` | 工具執行後 | 記錄操作、自動格式化 |
| `SessionStart` | Session 開始 | 載入環境、設定 |
| `SessionEnd` | Session 結束 | 清理、產生摘要 |
| `PreCompact` | 壓縮對話前 | 保留重要資訊 |
| `UserPromptSubmit` | 使用者輸入後 | 輸入檢查 |
| `Stop` | Claude 停止前 | 收尾工作 |
| `SubagentStop` | 子代理停止 | 收集結果 |
| `Notification` | 通知事件 | 外部通知 |
| `InstructionsLoaded` | CLAUDE.md 載入後 | 動態調整 |
| `Setup` | `--init` 執行時 | 專案初始化 |

## 設定格式

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/lint-check.js $CLAUDE_TOOL_INPUT",
            "timeout": 30
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/log-bash.js"
          }
        ]
      }
    ]
  }
}
```

## Matcher 語法
- `"Write"` — 精確匹配
- `"Write|Edit"` — 多個工具用 `|` 分隔
- `"Bash(git:*)"` — 匹配特定 bash 指令模式

## Handler 類型
1. **command** — 執行 shell 命令
2. **http** — POST JSON 到 URL

## 實用範例

### 防止修改特定檔案
```json
{
  "PreToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{
      "type": "command",
      "command": "node -e \"const f=JSON.parse(process.env.CLAUDE_TOOL_INPUT||'{}').file_path||''; if(f.includes('migrations/')) { console.error('禁止修改 migrations'); process.exit(1); }\""
    }]
  }]
}
```

### 自動格式化
```json
{
  "PostToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{
      "type": "command",
      "command": "npx prettier --write $CLAUDE_FILE_PATH"
    }]
  }]
}
```

### Session 結束時產生摘要
```json
{
  "SessionEnd": [{
    "hooks": [{
      "type": "command",
      "command": "node .claude/hooks/session-summary.js"
    }]
  }]
}
```
