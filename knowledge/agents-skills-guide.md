# Agents 與 Skills 指南

## Agents（子代理）

### 什麼是 Agent
Agent 是專門化的子代理，用 markdown 定義。Claude Code 根據描述自動判斷何時啟動。

### 檔案位置
- `~/.claude/agents/` — 全域
- `.claude/agents/` — 專案層級

### 格式
```markdown
---
name: code-reviewer
description: |
  Expert code reviewer. Use when reviewing PRs or checking code quality.
  <example>
  user: "review this PR"
  assistant: Uses code-reviewer agent
  <commentary>PR review matches this agent</commentary>
  </example>
model: sonnet
color: blue
tools: ["Read", "Grep", "Glob", "Bash"]
---

You are an expert code reviewer...

**Review Checklist:**
1. Logic correctness
2. Security vulnerabilities
3. Performance issues
4. Code style consistency
```

### Frontmatter 欄位
| 欄位 | 說明 |
|------|------|
| `name` | Agent 名稱 (kebab-case) |
| `description` | 觸發描述 + examples |
| `model` | inherit / sonnet / opus / haiku |
| `color` | blue / cyan / green / yellow / magenta / red |
| `tools` | 限制可用工具清單 |

### 使用方式
```bash
# 自動觸發（Claude 根據描述判斷）
claude "review my latest changes"

# 明確指定
claude --agent code-reviewer
```

---

## Skills（技能）

### 什麼是 Skill
Skill 是自動激活的能力模組。Claude Code 根據任務上下文自動載入匹配的 skill。

### 檔案位置
- `~/.claude/skills/skill-name/SKILL.md` — 全域
- `.claude/skills/skill-name/SKILL.md` — 專案層級

### 格式
```markdown
---
name: test-runner
description: |
  Test automation expert. Auto-activates when running tests,
  analyzing failures, or ensuring coverage.
version: 1.0.0
---

## Instructions

Run tests with: `npm test`
Framework: vitest

## Reference Files

Read `${CLAUDE_SKILL_DIR}/references/test-patterns.md` for common patterns.

## Steps

1. Identify which tests to run
2. Execute tests
3. Analyze failures
4. Fix issues
5. Re-run to verify
```

### 特殊變數
- `${CLAUDE_SKILL_DIR}` — 指向 skill 所在目錄，用於引用附帶的參考檔案

### Skill 目錄結構
```
skills/
  test-runner/
    SKILL.md           # 主定義
    references/        # 參考資料
      test-patterns.md
    scripts/           # 輔助腳本
      run-tests.sh
```

---

## Commands（自訂指令）

### 檔案位置
- `~/.claude/commands/` — 全域
- `.claude/commands/` — 專案層級

### 格式
```markdown
---
description: Run full CI pipeline locally
allowed-tools: Bash, Read, Grep
model: sonnet
argument-hint: [--fix]
---

Run the full CI pipeline:
1. Lint check
2. Type check
3. Unit tests
4. Integration tests

If --fix is passed, auto-fix issues.
```

### 使用
```bash
# 在 Claude Code 中
/ci-pipeline --fix
```

---

## Agent Teams（實驗性）

### 啟用
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### 概念
多個 Agent 各自擁有獨立 context window，可以平行工作。

### 快捷鍵
| 鍵 | 功能 |
|----|------|
| Shift+Up/Down | 選擇隊友 |
| Shift+Tab | 委派模式 |
| Ctrl+T | 查看任務清單 |

### 適用場景
- 大型重構（一個 agent 改前端，一個改後端）
- 平行研究（多個 agent 同時探索不同方向）
- Review + Fix（一個 review，一個修）
