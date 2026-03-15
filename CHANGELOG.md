# Changelog

## [1.1.0] - 2026-03-15

### Added
- **Full CLI interface** with 14 subcommands (`engagement-bot <command> [options]`)
- Offline commands: `status`, `history`, `schedule list`, `chat recent/topics/users`, `pins`, `channels`, `help`
- Connected commands: `serve`, `post`, `command`, `schedule trigger/update`
- `--json` global flag for machine-readable output (`{ ok, data, timestamp }` envelope)
- `--help` flag works at any position
- Human-readable aligned text tables for terminal output
- Input validation: `--limit` (positive number), `--type` (tip/discussion/roundup/command/other), `--enabled` (true/false), `--cron` (valid expression)
- Unknown flag detection (rejects typos like `--limite`)
- Non-TTY stdin handling (auto-cancels confirmation prompts in CI/pipes)
- `bin/bot.js` binary entry point for `npm install -g` usage
- `npm run bot` and `npm run cli` scripts

### Changed
- `src/index.ts` now delegates to `src/cli.ts` (CLI entry point)
- `npm run dev` now runs `tsx src/cli.ts serve` (equivalent to previous behavior)
- `scheduler.ts`: `getSchedule()` returns `running` field alongside `enabled`
- `scheduler.ts`: new `getScheduleConfig()` for offline-safe schedule reading
- `scheduler.ts`: `updateJob()` only restarts scheduler in live server context (`schedulerStarted` flag)
- `scheduler.ts`: `updateJob()` returns a copy instead of live object reference
- `command --preview` no longer opens Discord WebSocket (only needs env vars for content generation)
- Added `dotenv` to `dependencies` (was phantom dep from transitive install)

### Architecture
- `src/cli/output.ts` — Formatter interface with `json: boolean` discriminant
- `src/cli/connection.ts` — `withBot()` lazy connect/disconnect wrapper
- `src/cli/prompt.ts` — Shared `confirm()` with non-TTY guard
- `src/cli/commands/` — 12 command handlers (offline/connected separation)
- `src/cli/commands/serve.ts` — Refactored from original `index.ts` main()

## [1.0.0] - 2026-03-14

### Added
- Discord bot with engagement tracking (5 achievement types)
- Knowledge engine (auto-classify tech questions, 📌 pin collection)
- 6 scheduled content jobs (daily tips, discussions, weekly roundup, version check)
- Content generation via Claude CLI with MCP tools (trend-pulse, cf-browser)
- Chat logging with 16 topic keyword tracking
- New member welcome system (public + DM)
- HTTP API server (12 endpoints, port 3456)
- Electron menubar app with Command Center
- Interactive REPL mode
- Backfill utility for historical chat import
- 12 knowledge base files with day-of-week rotation
