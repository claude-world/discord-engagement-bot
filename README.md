# Discord Engagement Bot

Automated Discord community engagement bot with Electron menubar UI. Generates and posts daily tips, discussions, and weekly roundups using Claude CLI.

Built for [Claude World Taiwan](https://discord.gg/claude-world) Discord community.

## Features

- **Scheduled Posts** — Daily tips, lunch discussions, cowork reminders, weekly roundups, weekend challenges
- **Claude-Powered Content** — Uses `claude -p` to generate fresh content for each post
- **Natural Language Commander** — Type commands like "發一篇關於 MCP 的技巧" to generate and post
- **Electron Menubar** — macOS menubar app with dashboard, commander, schedule manager
- **Web UI** — Standalone web dashboard (no Electron required)
- **HTTP API** — RESTful API for external integrations

## Quick Start

```bash
# Install
npm install

# Configure
cp .env.example .env
# Fill in your Discord bot token and channel IDs

# Run (CLI mode)
npm run dev

# Run (Web UI + Bot)
npm run dev:ui   # UI at http://localhost:5174
npm run dev      # Bot + API at http://localhost:3456

# Run (Electron menubar app)
npm run electron:dev
```

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_BOT_TOKEN` | Yes | Discord bot token |
| `DISCORD_GUILD_ID` | Yes | Discord server ID |
| `CHANNEL_DAILY_TIPS` | Yes | Channel for daily tips |
| `CHANNEL_GENERAL` | Yes | General discussion channel |
| `CHANNEL_ANNOUNCEMENTS` | Yes | Announcements channel |
| `CHANNEL_BOT_LOGS` | No | Bot log channel |
| `CLAUDE_CLI_PATH` | No | Path to Claude CLI (default: `claude`) |
| `CONTENT_TIMEOUT` | No | Content generation timeout in ms (default: `60000`) |

## Schedule

| Job | Cron | Channel | Description |
|-----|------|---------|-------------|
| Daily Tip | `0 9 * * 1-5` | #daily-tips | Claude Code tip of the day |
| Discussion | `0 12 * * 1-5` | #daily-tips | Lunch discussion topic |
| Cowork Reminder | `0 20 * * 3` | #general | Wednesday cowork reminder |
| Weekly Roundup | `0 18 * * 5` | #announcements | Friday weekly summary |
| Weekend Challenge | `0 9 * * 6` | #daily-tips | Weekend coding challenge |

## Architecture

```
src/
  index.ts              CLI entry point + interactive mode
  bot.ts                Discord.js client
  config.ts             Zod-validated environment config
  commander.ts          Natural language command parser
  content-generator.ts  Claude CLI content generation
  poster.ts             Discord message posting (with chunking)
  scheduler.ts          node-cron scheduled jobs
  history.ts            Post history tracking (JSON)
  api-server.ts         HTTP API for web UI
  prompts/              Prompt templates
    daily-tip.ts
    discussion.ts
    weekly-roundup.ts
    commander.ts
    release-news.ts

ui/                     React + Tailwind web UI
  App.tsx
  pages/
    Dashboard.tsx       Overview + quick actions
    Commander.tsx       Natural language command center
    Schedule.tsx        Schedule management
    History.tsx         Post history viewer
    Settings.tsx        Bot settings

electron/               Electron menubar app
  main.ts              Main process
  preload.ts           IPC bridge
  tray.ts              System tray
  ipc-handlers.ts      IPC → bot API handlers
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Bot status, today's count, schedule |
| POST | `/api/commander/parse` | Parse natural language command |
| POST | `/api/commander/execute` | Execute parsed command |
| GET | `/api/schedule` | List scheduled jobs |
| POST | `/api/schedule/trigger` | Trigger a job immediately |
| POST | `/api/schedule/update` | Update job settings |
| GET | `/api/history` | Post history |
| GET | `/api/channels` | Available channels |

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Discord**: discord.js v14
- **Content**: Claude CLI (`claude -p`)
- **Scheduling**: node-cron
- **UI**: React 19 + Tailwind CSS + Vite
- **Desktop**: Electron + menubar
- **Validation**: Zod

## License

MIT
