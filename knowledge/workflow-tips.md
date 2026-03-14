# 進階工作流程與實戰技巧

## 高效開發模式

### 1. Print Mode 批次處理
```bash
# 一次性任務，不進入互動模式
claude -p "分析 src/ 下所有 TODO 並產生修復計畫"

# 搭配 shell pipe
cat error.log | claude -p "分析這些錯誤的 root cause"

# 指定模型
claude -p --model haiku "簡化這段 function" < src/utils.ts
```

### 2. Worktree 隔離開發
```bash
# 在獨立分支中工作，不影響主分支
claude --worktree "重構 auth module"

# 完成後自動產生 PR
```

### 3. /loop 持續監控
```bash
# 每 5 分鐘檢查一次
/loop 5m 檢查 CI 狀態並報告

# 每 10 分鐘跑一次測試
/loop 10m npm test
```

### 4. 善用 /compact
長時間工作後 context 會滿，用 `/compact` 壓縮對話歷史但保留重要資訊。搭配 `PreCompact` hook 可以指定哪些資訊必須保留。

## Git 工作流程

### 自動 Commit
```bash
# 在 Claude Code 中
/commit              # 分析 diff，自動寫 commit message
/commit-push-pr      # 一鍵 commit + push + 建 PR
```

### PR 相關
```bash
claude --from-pr 123    # 恢復與 PR 相關的 session
```

## 效能優化策略

### 模型選擇原則
| 場景 | 推薦模型 |
|------|---------|
| 快速搜尋/查找 | Haiku (快且便宜) |
| 一般開發 | Sonnet (平衡) |
| 複雜架構設計 | Opus (最強推理) |
| 大量重複性工作 | Haiku + /loop |

### 減少 Token 消耗
1. 用 `.claude/rules/` 按需載入規則，不要全塞 CLAUDE.md
2. 善用 `/compact` 控制 context 長度
3. 用 Agent 隔離子任務的 context
4. 大型探索用 `subagent_type: Explore` + `model: haiku`

## 除錯技巧

### 系統化除錯流程
1. 先用 `/debug` 開啟 debug logging
2. 給 Claude 完整的錯誤訊息（不要只截一部分）
3. 告訴它相關檔案的路徑
4. 用 `--worktree` 在隔離環境中嘗試修復

### 常見問題
- **MCP 連不上**: 檢查 `.mcp.json` 格式、npx 版本、環境變數
- **Hook 失敗**: 檢查 timeout 設定，用 `echo` 除錯
- **Agent 不觸發**: 確認 description 中有足夠的 examples
- **記憶體不足**: 用 `/compact`，或開新 session

## Plugins 系統

### 安裝 Plugin
```bash
/plugin marketplace    # 瀏覽可用 plugins
/plugin install name   # 安裝
/reload-plugins        # 重新載入（不需重啟）
```

### Plugin 結構
```
my-plugin/
  .claude-plugin/
    plugin.json        # 名稱、版本、描述
  commands/            # 自訂指令
  agents/              # 自訂 agents
  skills/              # 自訂 skills
  hooks/hooks.json     # 事件 hooks
  .mcp.json            # MCP servers
```

## 安全最佳實踐

1. **Hooks 防護**: 用 `PreToolUse` hook 攔截危險操作
2. **工具限制**: Agent 用 `tools:` 限制可用工具
3. **Bash 白名單**: `allowed-tools: Bash(git:*, npm:test)` 精確控制
4. **設定 settings.local.json**: 敏感設定不追蹤進 git
5. **定期更新**: `claude update` 取得最新安全修補
