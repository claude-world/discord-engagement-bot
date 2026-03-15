# Discord Engagement Bot

Automated Discord community engagement bot for [Claude World Taiwan](https://discord.gg/claude-world). Generates and posts scheduled content using the Claude CLI, logs community activity, monitors Claude Code releases, and exposes a RESTful API consumed by both a standalone web dashboard and an Electron menubar app.

## Features

- **Scheduled Posts** — Six cron jobs: daily tips, lunch discussions, cowork reminders, weekly roundups, weekend challenges, and automated version-change announcements
- **Claude-Powered Content** — Calls `claude -p` (with optional MCP tools) to generate fresh, knowledge-grounded posts for every job
- **MCP Integration** — Uses `trend-pulse` (real-time trending data, zero auth) and `cf-browser` (web scraping via Cloudflare Browser Rendering) to enrich generated content
- **Knowledge Base** — Twelve curated markdown files covering Claude Code, MCP, hooks, agents, prompt engineering, and more; injected into prompts for factual accuracy
- **Natural Language Commander** — Type commands like `發一篇關於 MCP 的技巧` or shortcut aliases (`發技巧`, `tip`, `roundup`) to generate and post on demand
- **Chat Logger** — Passively records every member message and reaction; builds per-user topic interest profiles stored in `data/chat-log.jsonl` and `data/users.json`
- **Version Checker** — Polls `claude --version` every 4 hours and automatically posts release notes to `#news` when a new version is detected
- **Web UI** — Standalone React dashboard (no Electron required) at `http://localhost:5174`; communicates with the bot via the HTTP API
- **Electron Menubar App** — macOS system-tray app with compact and full-dashboard modes
- **HTTP API** — RESTful API on port 3456 used by the web UI and Electron IPC handlers

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — fill in DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, and channel IDs

# 3. (Optional) Configure MCP tools
cp .mcp.json.example .mcp.json
# Edit .mcp.json — add CF_BROWSER_URL / CF_BROWSER_API_KEY if you have a cf-browser worker

# 4. Start the bot + API server
npm run dev

# --- Alternative modes ---

# Web UI (React dashboard)  — open a second terminal:
npm run dev:ui              # UI at http://localhost:5174

# Electron menubar app (macOS):
npm run electron:dev

# Backfill existing chat history into the log:
npm run backfill

# Package Electron app for distribution:
npm run package
```

## Configuration

### `.env`

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DISCORD_BOT_TOKEN` | Yes | — | Discord bot token from the Developer Portal |
| `DISCORD_GUILD_ID` | Yes | — | Discord server (guild) ID |
| `CHANNEL_DAILY_TIPS` | Yes | — | Channel ID for tips and discussions |
| `CHANNEL_GENERAL` | Yes | — | General discussion channel ID |
| `CHANNEL_ANNOUNCEMENTS` | Yes | — | Announcements channel ID |
| `CHANNEL_NEWS` | No | `""` | Channel ID for version-update announcements |
| `CHANNEL_SHOWCASE` | No | `""` | Showcase channel ID |
| `CHANNEL_BOT_LOGS` | No | `""` | Channel for internal bot log messages |
| `CLAUDE_CLI_PATH` | No | `claude` | Absolute path to the Claude CLI binary |
| `CONTENT_TIMEOUT` | No | `60000` | Content generation timeout in milliseconds (5000–300000) |

### `.mcp.json`

Provides MCP server definitions loaded via `claude -p --mcp-config`. Two servers are supported out of the box:

| Server | Purpose |
|--------|---------|
| `trend-pulse` | Real-time trending topics from 20+ sources (Google, HN, GitHub, PTT, Dcard…) |
| `cf-browser` | Web content fetching via Cloudflare Browser Rendering |

Copy `.mcp.json.example` to `.mcp.json` and fill in `CF_BROWSER_URL` and `CF_BROWSER_API_KEY`. Content generation works without MCP — the bot falls back to knowledge-file-only prompts.

## Schedule

All jobs run on Asia/Taipei timezone. The version-check job handles its own Discord posting internally.

| Job ID | Name | Cron | Channel | Description |
|--------|------|------|---------|-------------|
| `dailyTip` | 每日技巧 | `0 9 * * 1-5` | `#daily-tips` | Weekday Claude Code tip of the day |
| `discussion` | 午間討論 | `0 12 * * 1-5` | `#daily-tips` | Weekday lunchtime discussion prompt |
| `coworkRemind` | Cowork 提醒 | `0 20 * * 3` | `#general` | Wednesday evening cowork session reminder |
| `weeklyRoundup` | 週五週報 | `0 18 * * 5` | `#announcements` | Friday weekly summary |
| `weekendChallenge` | 週末挑戰 | `0 9 * * 6` | `#daily-tips` | Saturday coding challenge |
| `versionCheck` | 版本檢查 | `0 */4 * * *` | `#news` | Every 4 hours — posts release notes if Claude Code version changes |

Jobs can be enabled/disabled and have their cron expression or target channel updated at runtime via the API or web UI without restarting the bot.

## Architecture

```
discord-engagement-bot/
├── src/
│   ├── index.ts              CLI entry point — starts bot, scheduler, and API server
│   ├── bot.ts                discord.js client; logs all messages and reactions
│   ├── config.ts             Zod-validated environment config
│   ├── scheduler.ts          node-cron job registry (6 jobs, Asia/Taipei)
│   ├── content-generator.ts  Calls claude -p (with --mcp-config) or codex; fallback to static
│   ├── commander.ts          Natural language command parser and executor
│   ├── poster.ts             Discord message posting with 2000-char chunking
│   ├── history.ts            Post history tracking (data/history.json)
│   ├── chat-logger.ts        Passive message/reaction logger; user topic profiling
│   ├── version-checker.ts    Polls claude --version; posts release notes on change
│   ├── api-server.ts         HTTP API on port 3456
│   ├── backfill.ts           One-shot script to backfill existing Discord history
│   └── prompts/
│       ├── context.ts        Shared system context, knowledge file mapping, MCP instructions
│       ├── daily-tip.ts      Daily tip prompt + day-of-week rotation
│       ├── discussion.ts     Discussion topic prompt
│       ├── weekly-roundup.ts Weekly roundup prompt
│       ├── release-news.ts   Version update announcement prompt
│       └── commander.ts      Natural language command parsing prompt
│
├── ui/                       React 19 + Tailwind web UI (Vite, port 5174)
│   ├── App.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx     Overview stats and quick-action buttons
│   │   ├── Commander.tsx     Natural language command center
│   │   ├── Schedule.tsx      Schedule management (enable/disable, edit cron)
│   │   ├── History.tsx       Post history viewer
│   │   └── Settings.tsx      Bot settings
│   └── components/
│       ├── StatusBar.tsx
│       ├── PostPreview.tsx
│       ├── ScheduleItem.tsx
│       └── CommandInput.tsx
│
├── electron/                 Electron 33 menubar app (macOS)
│   ├── main.ts               Main process
│   ├── preload.ts            IPC bridge (contextBridge)
│   ├── tray.ts               System tray setup
│   └── ipc-handlers.ts       IPC handlers → HTTP API calls
│
├── knowledge/                12 markdown knowledge files (see Knowledge Base section)
├── data/                     Runtime data (git-ignored)
│   ├── history.json          Post history
│   ├── chat-log.jsonl        Append-only message log
│   ├── users.json            User topic interest profiles
│   └── last-version.txt      Last known Claude Code version
├── .env                      Environment config (from .env.example)
└── .mcp.json                 MCP server config (from .mcp.json.example)
```

## API Endpoints

The API server runs on `http://localhost:3456`. All endpoints return JSON.

### Bot Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/status` | Bot connection status, today's post count, last post, and full schedule |

### Commander

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `POST` | `/api/commander/parse` | `{ input: string }` | Parse natural language; returns `{ intent, channel, content }` preview |
| `POST` | `/api/commander/execute` | `{ intent, channel, content }` | Post the previewed content to Discord |

### Schedule

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/api/schedule` | — | List all scheduled jobs with enabled state |
| `POST` | `/api/schedule/trigger` | `{ id: string }` | Trigger a job immediately |
| `POST` | `/api/schedule/update` | `{ id: string, updates: { cron?, channel?, enabled? } }` | Update a job and restart the scheduler |

### History and Channels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history` | Full post history array |
| `GET` | `/api/channels` | List of configured channel names |

### Chat Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/chat/recent` | Last 50 chat entries (newest first) |
| `GET` | `/api/chat/topics` | Top 10 community topics by mention count |
| `GET` | `/api/chat/users` | Top 20 most active users by message count |

## Knowledge Base

Twelve curated markdown files in `knowledge/` are injected into content-generation prompts. The day-of-week topic rotation selects the relevant subset for each job.

| File | Source | Contents |
|------|--------|---------|
| `claude-code-basics.md` | Claude Code docs | Core CLI usage, slash commands, flags |
| `claude-md-guide.md` | Claude Code docs | CLAUDE.md design and best practices |
| `mcp-guide.md` | Claude Code docs | MCP configuration and common servers |
| `hooks-guide.md` | Claude Code docs | Hooks system (PreToolUse, PostToolUse) |
| `agents-skills-guide.md` | Claude Code docs | Agents, skills, and commands format |
| `workflow-tips.md` | Community | Advanced workflow tips and patterns |
| `claude-world-tutorials.md` | claude-world.com | 24-session tutorial course reference |
| `claude-cookbooks.md` | Anthropic cookbooks | Official cookbook patterns |
| `official-skills-reference.md` | Anthropic skills | Official skills reference |
| `prompt-engineering.md` | Anthropic docs | Prompt engineering techniques |
| `tool-use-guide.md` | Anthropic docs | Tool use and function calling |
| `anthropic-api-fundamentals.md` | Anthropic docs | API fundamentals and SDK usage |

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Bot + API server | `npm run dev` | Start the bot and HTTP API (port 3456) |
| Web UI | `npm run dev:ui` | Start the Vite dev server (port 5174) |
| Backfill | `npm run backfill` | Fetch and log all existing Discord messages |
| Electron dev | `npm run electron:dev` | Vite + tsc watch + Electron (concurrent) |
| Package | `npm run package` | Build and package Electron app for macOS |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript 5 |
| Discord | discord.js v14 |
| Content generation | Claude CLI (`claude -p`) |
| MCP tools | trend-pulse, cf-browser |
| Scheduling | node-cron (Asia/Taipei) |
| Web UI | React 19 + Tailwind CSS + Vite 6 |
| Desktop | Electron 33 + menubar |
| Config validation | Zod |
| Data storage | JSONL + JSON flat files |

## License

MIT
