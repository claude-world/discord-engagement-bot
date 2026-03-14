# Claude World 24 門課程精華

> 來源：claude-world.com 教學課程

---

## 課程總覽

| # | 標題 | 一句話摘要 |
|---|------|-----------|
| S01 | Agent Loop | Claude Code 的核心迴圈：呼叫 API → 判斷 stop_reason → 執行工具 → 重複 |
| S02 | 工具系統與權限 | 工具分三類：自動允許（讀取）、需核准（寫入/執行）、特殊（Agent/MCP） |
| S03 | 使用 TodoWrite 規劃 | 複雜任務先建計畫，規劃→執行→驗證，避免隧道視野 |
| S04 | 子代理與上下文隔離 | 子代理只回傳摘要，保護父代理上下文空間 |
| S05 | Skills 與知識載入 | 雙層載入：名稱預先注入，完整內容按需載入；CLAUDE.md 是最重要的知識源 |
| S06 | 上下文壓縮 | 三層壓縮策略；CLAUDE.md 永不壓縮；長會話靠壓縮維持效率 |
| S07 | 任務圖與依賴關係 | DAG 讓獨立任務平行執行，依賴邊防止錯誤順序 |
| S08 | 背景任務 | `run_in_background=true` 讓 AI 在等待時繼續做有用的事 |
| S09 | Agent Teams 與通訊 | 多個 Claude 實例各有上下文，透過 JSONL 訊息匯流排通訊 |
| S10 | 團隊協定 | request_id + FSM 確保訊息不遺失、不錯配 |
| S11 | 自主代理 | WORK/IDLE 迴圈、自動認領任務、心跳監控、安全約束 |
| S12 | Worktree 隔離 | 每個代理一個 git worktree，樂觀並行避免檔案衝突 |
| S13 | 控制協定 | CLI 與 SDK 是兩個程序，透過 stdin/stdout JSON-RPC 通訊 |
| S14 | MCP 整合 | 標準協議讓第三方工具接入，工具命名 `mcp__server__tool` |
| S15 | Hooks 系統 | PreToolUse/PostToolUse hook 實現確定性政策強制，不依賴 AI 遵從 |
| S16 | Session 儲存 | JSONL 逐字稿、UUID 父子鏈、`claude --resume` 恢復任意 session |
| S17 | CLAUDE.md 設計 | 三層階層：使用者全域 → 專案 → 作用域規則（paths:） |
| S18 | 權限模型與安全性 | 五層縱深防禦：工具可用性、權限閘門、沙箱、網路政策、檔案邊界 |
| S19 | 多 CLI 工作流 | 4 個終端各有角色（協調/實作/驗證/修復），透過檔案系統通訊 |
| S20 | 錯誤恢復 | 錯誤三分類：暫時性（退避重試）、永久性（換方法）、需人工（升級） |
| S21 | 成本優化 | Haiku 探索、Sonnet 程式碼、Opus 架構；上下文大小是成本乘數 |
| S22 | 人機協作 | 可逆性決定自主性；在策略決策點設閘門而非每步詢問 |
| S23 | 自定義 Agents 與 Skills | Skills 用斜線命令觸發，Agents 由 AI 產生；Markdown 就是擴展語言 |
| S24 | 生產環境模式 | 無頭模式、CI/CD 整合、可觀測性、成本追蹤、四階段成熟度模型 |

---

## S01：Agent Loop

### 重點
- `stop_reason` 決定一切：`end_turn` → 停止；`tool_use` → 執行工具再繼續
- 工具結果以 **user 訊息**注入回迴圈，API 本身不知道「工具執行」這件事
- 錯誤不是終止信號，而是 `tool_result`，AI 可以讀取後換方法

### 實用技巧
- 單輪可同時發出多個工具呼叫（平行讀取多個檔案）
- 迴圈像 Node.js 事件迴圈：持續跑到沒事做為止，不是聊天來回

---

## S02：工具系統與權限

### 重點
- 三種信任等級：讀取（自動允許）/ 寫入執行（提示）/ 特殊（依上下文）
- 三種模式：Default（讀取自動、寫入提示）/ Plan（全部提示）/ Auto（全部自動）

### 實用技巧
- AI 能看到所有工具定義，被拒後能解釋意圖並請求許可
- 「允許此 session」可記住模式，下次相同命令自動通過
- 隱藏工具比開放+閘門更差——AI 默默失敗不如明確拒絕並說明

---

## S03：使用 TodoWrite 規劃

### 重點
- 規劃讓 AI 的推理可見，可在執行前對齊方向
- 三階段：規劃（建 TodoWrite 清單）→ 執行（標記進度）→ 驗證（確認無遺漏）

### 實用技巧
- `claude --plan` 強制先提計畫再動手
- 開始複雜任務時明確說：「在寫任何程式碼前，先建立詳細計畫供我審查」
- 規劃階段抓到錯誤假設，比修了 20 個檔案後再回頭便宜得多

---

## S04：子代理與上下文隔離

### 重點
- 子代理的完整探索歷史在完成後丟棄，**父代理只收到摘要**
- 上下文視窗是最珍貴的資源；研究工作會污染工作上下文

### 實用技巧
- 任務分類匹配模型：Haiku（搜尋/列舉）→ Sonnet（分析/重構）→ Opus（架構決策）
- 「找到 X 後回報」→ 子代理；「跟我一起做接下來 30 分鐘的 X」→ 多 CLI 或 Teams

---

## S05：Skills 與知識載入

### 重點
- 雙層載入：第 1 層（系統提示）只放名稱+一行描述；第 2 層（觸發時）載入完整 500-2000 tokens
- 知識優先級：當前提示 > 對話歷史 > 專案 CLAUDE.md > 使用者 CLAUDE.md > 系統提示

### 實用技巧
- **CLAUDE.md 是最高槓桿的檔案**，一次寫好勝過每次 session 重新解釋
- 雙層設計讓系統輕鬆擴展到 50+ skills，啟動速度不受影響

---

## S06：上下文壓縮

### 重點
- 三層壓縮：修剪長工具輸出 → 摘要早期對話輪次 → 保留最近輪次 + 系統提示 + CLAUDE.md
- 壓縮是「摘要化」不是「刪除」；CLAUDE.md 和活動任務清單永不壓縮

### 實用技巧
- 關鍵資訊放 CLAUDE.md，不放對話——壓縮後仍然存在
- 用子代理做大範圍探索，探索上下文完成後自動丟棄
- 切換任務時主動 `/compact` 釋放空間，別等填滿再壓縮

---

## S07：任務圖與依賴關係

### 重點
- 任務形成 DAG（有向無環圖），`blockedBy` / `blocks` 欄位編碼依賴關係
- 演算法：重複掃描「所有 blockedBy 都已完成」的任務，平行執行它們

### 實用技巧
- 菱形模式最常見：一個分析任務 → 平行實作 → 匯聚整合
- 在提示中明確描述 Phase 1/2/3 依賴關係，引導 AI 產生良好的圖結構
- 失敗時圖讓影響範圍可見——只有下游依賴被阻塞，其他繼續跑

---

## S08：背景任務

### 重點
- `run_in_background: true` 讓 AI 立即取回控制權，在等待時繼續做其他事
- 完成後結果進入通知佇列，AI 在下一輪自然收到，無需輪詢

### 實用技巧
- 決策框架：需要結果才能決定下一步 → 前景；不需要 → 背景
- `npm test`、`docker build`、`pnpm build` 都適合背景執行
- 反模式：啟動背景任務後馬上 sleep 等待——直接破壞目的

---

## S09：Agent Teams 與通訊

### 重點
- 啟用：`export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Teams vs 子代理：子代理短暫一次性；Teams 持久、有狀態、多輪協作
- JSONL 訊息匯流排：僅追加、可檢視，`cat ~/.claude/teams/session-xyz.jsonl` 看通訊

### 實用技巧
- 三代理黃金組合：Implementer + Reviewer + Tester 平行運作
- 每個隊友有獨立 200K 上下文，總計 600K 可用，各自深入自己的領域
- 可用 `grep '"from": "reviewer"' session.jsonl` 過濾特定代理的訊息

---

## S10：團隊協定

### 重點
- `request_id` 將請求與回應綁定，解決分散式通訊的關聯性問題
- FSM 四狀態：IDLE → REQUEST_SENT → WAITING → RESPONSE_RECEIVED → IDLE
- 四種訊息類型：request（需回應）/ response（回答請求）/ status（資訊性）/ broadcast（全員廣播）

### 實用技巧
- 逾時策略：30 秒無回應 → 重試一次 → 升級或自行執行
- 訊息 payload 要包含足夠的獨立執行上下文，不要假設對方有你的上下文

---

## S11：自主代理

### 重點
- WORK/IDLE 循環：自動認領 `status: ready` 的任務，每次認領一個防止囤積
- 心跳模式：30 秒一次，60 秒無心跳 → 任務自動釋放回佇列
- 安全約束四層：作用域限制 / 核准閘門 / Kill switch / 資源預算

### 實用技巧
- 好的自主代理：單一職責 + 明確成功標準 + 有界執行時間 + 結構化輸出
- 啟用自主代理前先投資任務分解（S07）和協定（S10）品質
- 守護模式：監控檔案系統變化，永久運行直到明確停止信號

---

## S12：Worktree 隔離

### 重點
- `git worktree add .worktrees/agent-a -b feat/auth`：快速（hardlinks）、完全隔離
- 子代理不知道自己在 worktree 中——隔離對工作者透明
- 樂觀並行：代理自由工作，衝突在合併時一次解決

### 實用技巧
- 隔離層級比較：無隔離（單代理）→ Worktree（推薦）→ Full Clone → Container
- 沒有變更的 worktree 自動清理，防止長時間 session 中堆積
- 父代理只觀察事件串流，不干預——干預會破壞一致性

---

## S13：控制協定

### 重點
- Claude Code = CLI（終端 UI）+ SDK（AI 引擎）兩個 Node.js 程序，透過 stdin/stdout JSON-RPC 通訊
- 三種訊息：request（有 id，需回應）/ response（有對應 id）/ notification（無 id，單向廣播）
- 權限流程：SDK 遇到需核准工具時阻塞，等 CLI 的使用者決策後才繼續

### 實用技巧
- 可程式化使用：`import { claude } from "@anthropic-ai/claude-code"` 直接呼叫 SDK
- token 串流透過 `assistant_token` notification 逐個發送，產生打字機效果
- 協議版本協商（握手）確保新舊版本相容

---

## S14：MCP 整合

### 重點
- MCP 伺服器設定在 `.mcp.json`，工具命名規則：`mcp__<server>__<tool>`
- 兩種傳輸：stdio（本地子程序，推薦）/ SSE（遠端 HTTP 伺服器）
- MCP 工具經過**相同的權限系統**，不會繞過安全閘門

### 實用技巧
- 最小 MCP 伺服器只需 `McpServer` + `StdioServerTransport` + 工具定義（Zod schema）
- 命名防衝突：兩個伺服器都有 `search` → `mcp__wiki__search` 和 `mcp__jira__search`
- PreToolUse hook 可攔截 MCP 工具呼叫，加入額外安全檢查

---

## S15：Hooks 系統

### 重點
- 四種 hook：PreToolUse（可阻止）/ PostToolUse（僅記錄）/ Notification / Stop（可阻止）
- 輸入：JSON stdin；輸出：exit code（0=允許，2=阻止，其他=視為允許）
- Hook 是**確定性**的——不依賴 AI 的遵從，CLAUDE.md 指令可能被忽略但 hook 不會

### 實用技巧
```bash
# 阻止危險命令（exit 2 + stdout 說明原因）
echo "$INPUT" | jq -r '.tool_input.command' | grep -qi "rm -rf /" && echo "BLOCKED" && exit 2

# 稽核日誌（exit 0 記錄每次工具呼叫）
echo "$LOG_ENTRY" >> ~/.claude/audit.jsonl && exit 0
```
- Matcher 支援萬用字元：`"mcp__*"` 匹配所有 MCP 工具

---

## S16：Session 儲存

### 重點
- JSONL 格式：每行獨立 JSON，僅追加，崩潰只丟失最後一行
- 儲存位置：`~/.claude/projects/<project-hash>/sessions/<uuid>.jsonl`
- 父子鏈：`parentSessionId` 連結恢復 session 和子代理 session

### 實用技巧
- `claude --resume` 列出近期 session，選擇後重建訊息陣列繼續工作
- 用腳本分析 session：`grep -c '"type":"tool_use"'` 計算工具呼叫次數
- 子代理工作可追蹤：父子 UUID 鏈重建完整工作樹

---

## S17：CLAUDE.md 設計

### 重點
- 三層：`~/.claude/CLAUDE.md`（全域個人偏好）→ `<repo>/CLAUDE.md`（專案）→ `.claude/rules/*.md`（作用域規則）
- 作用域規則用 `paths:` frontmatter 指定 glob 模式，只在匹配的檔案被操作時載入

### 實用技巧
- Project CLAUDE.md 保持 200 行以內，過長的移到 `.claude/rules/`
- 好的指令：明確（RFC 7807 格式）、含「為什麼」、結構化（表格/要點）
- 常見反模式：文字之牆 / 矛盾指令 / 顯而易見的廢話 / 過時內容
- 測試問題：「新開發者讀完能貢獻嗎？有沒有顯而易見的東西可以刪？」

---

## S18：權限模型與安全性

### 重點
- 五層縱深防禦：工具可用性 → 權限閘門 → OS 沙箱 → 網路政策 → 檔案系統邊界
- macOS 沙箱用 `sandbox-exec`，禁止存取鑰匙圈、掛載磁碟、修改系統設定
- `allowedTools` 自動核准特定模式，`deniedTools` 完全封鎖

### 實用技巧
```json
// .claude/settings.json
{
  "permissions": {
    "allowedTools": ["Bash(npm *)", "Bash(git status)", "Edit"],
    "deniedTools": ["Bash(git push --force *)", "Bash(rm -rf *)"]
  }
}
```
- 漸進式信任：第 1 天 Plan 模式 → 第 1 週 Default → 第 2 週加 allowedTools → 第 1 個月 CI 用 Auto

---

## S19：多 CLI 工作流

### 重點
- 四終端模式：Orchestrator（規劃）+ Implementer（實作）+ Validator（測試）+ Fixer（修復）
- 終端間透過**檔案系統**通訊：`.tasks/plan.md`、`.tasks/progress.md`、`.tasks/errors.md`
- 子代理摘要 ≠ 完整上下文；大型任務需要完整 session 的深度領域認知

### 實用技巧
- 使用時機：任務 > 1 小時、跨多個系統層、可平行、上下文會溢出
- 協調者的提示：「不要自己寫程式碼，只規劃和審查」
- 驗證者的提示：「只回報錯誤，不修復」

---

## S20：錯誤恢復

### 重點
- 三分類：暫時性（速率限制/網路/逾時）→ 指數退避；永久性（路徑錯誤/語法錯誤）→ 換方法；需人工 → 升級
- 指數退避上限：最多 3-5 次，等待上限 30-60 秒
- 錯誤即資訊：`ENOENT` 告訴你路徑錯，`429` 告訴你要等

### 實用技巧
- 備用鏈範例：`npm install` 失敗 → `yarn add` → `pnpm add` → 查 `package.json`
- 在 CLAUDE.md 中編碼恢復策略：「讀取**完整**錯誤輸出，不只最後一行」
- 最常見錯誤：把所有錯誤都當致命錯誤 / 對所有錯誤無腦重試

---

## S21：成本優化

### 重點
- 成本四驅動因素：輸入 token × 輸出 token × 模型價格 × API 呼叫次數
- 關鍵洞見：每次 API 呼叫都重送完整上下文，**上下文大小是成本乘數**
- 子代理模型匹配：探索 → Haiku；實作 → Sonnet；架構 → Opus（可省 50-70% 成本）

### 實用技巧
- CLAUDE.md 精簡到 500 tokens 以內（只留必要資訊），不是 2000+ tokens 的文件
- 針對性讀取：`src/auth/middleware.ts`（800 tokens）vs 「讀取 src/ 所有檔案」（40,000 tokens）
- 批次平行讀取：同時讀 A、B、C（1 次 API 往返）vs 依序讀（3 次往返）

---

## S22：人機協作（Human-in-the-Loop）

### 重點
- 可逆性決定自主性：`git checkout` 可復原 → 自動允許；改變生產狀態 → 必須人工核准
- 審批閘門是策略性暫停點，不是每步都問的煩人提示
- 升級階梯：自行解決 → 告知繼續 → 請求澄清 → 停止報告（依信心×後果決定）

### 實用技巧
```markdown
# CLAUDE.md 中的審批閘門
- Always present a plan before changing more than 3 files
- Never push to remote without explicit user confirmation
- After tests, report results and wait for approval
```
- 好的 HITL：問「3 種方法哪個較好？」；壞的 HITL：問「可以讀這個檔案嗎？」

---

## S23：自定義 Agents 與 Skills

### 重點
- Skills（使用者輸入 `/skill-name` 觸發）→ 注入到主對話執行
- Agents（AI 用 Agent 工具產生）→ 在隔離子上下文執行，單一職責
- 工具限制：審查 agent 只給 `Read, Glob, Grep`，不給 `Edit, Bash`

### 實用技巧
```markdown
# .claude/agents/security-reviewer.md
## Tools
Allowed: Read, Glob, Grep
Not allowed: Edit, Write, Bash
```
- 三種 skill 模式：逐步工作流 / 決策樹（依條件分支）/ 範本輸出
- 核心理念：**「工作流即 Markdown」**——把部落知識編碼成可重複執行的指令

---

## S24：生產環境模式

### 重點
- 無頭模式：`claude -p "..." --output-format json`，輸出包含 result、cost_usd、duration_ms
- CI/CD 關鍵設定：`timeout-minutes`、`--max-turns 20`、`|| true` 防止失敗炸 workflow、`if: always()` 確保結果發布
- 四階段成熟度：臨時使用 → 個人自動化 → 團隊標準化 → 平台整合

### 實用技巧
```yaml
# GitHub Actions 關鍵設定
jobs:
  ai-review:
    timeout-minutes: 10    # 防止失控
    steps:
      - run: claude -p "..." --max-turns 20 --output-format json || true
```
- 成本追蹤：解析 JSON 輸出的 `cost_usd` 欄位，記錄到 CSV
- 五個生產就緒標準：知道何時失敗（監控）/ 為何失敗（日誌）/ 花多少錢（預算）/ 表現一致（測試）/ 不做非預期的事（權限）

---

## 核心原則（貫穿全課程）

1. **Agent Loop 是基礎** — 所有架構都建在「呼叫 API → 判斷 stop_reason → 執行工具 → 重複」這個簡單迴圈上
2. **上下文是最珍貴的資源** — 子代理、壓縮、skills、worktrees 全都是為了有效管理上下文
3. **權限是安全網** — 信任從嚴格開始，隨時間逐步建立
4. **Markdown 是擴展語言** — CLAUDE.md、skills、agents 全是 Markdown，放入檔案即獲得能力
5. **生產需要生產紀律** — 監控、測試、錯誤處理、成本管理，工具相同，應用場景是新的
