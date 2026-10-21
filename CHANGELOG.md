# Changelog

## [1.1.0] - 2026-10-21

First release since v1.0.0. It ships the CLI that landed on `main` in March 2026 (never tagged until now) together with a dependency, security, and Claude ecosystem refresh.

### Upgrade notes
- Requires **Node.js 22.12 or newer** (now declared in `engines`), and the Electron app requires **macOS 13 or newer** (Electron 44)
- The web UI dev server now runs on port **5174**, matching the API's allowed origin
- The local HTTP API rejects requests from other origins or hosts, and `POST` bodies must be `application/json`

### Security
- Resolved all 113 open Dependabot alerts (1 critical, 54 high, 46 medium, 12 low) by upgrading dependencies; `npm audit` reports 0 vulnerabilities
- An npm `overrides` entry pins `global-agent` to `^4.1.3`, which drops the unpatched `sprintf-js` that electron-builder's `@electron/get` pulled in
- The local HTTP API was open to cross-site requests: a page open in the operator's browser could post to Discord through `/api/commander/execute` (CSRF) or read data via DNS rebinding. It now checks `Host` and `Origin` and requires JSON bodies

### Fixed
- Electron menubar and Command Center windows were blank: the UI was loaded from `dist/ui/dist`, and the Vite build used absolute asset paths. Both now resolve in development and in the packaged app
- `vite build ui` never loaded `vite.config.ts` (no React plugin, wrong base path and port); the config is now `vite.config.mts` and is picked up
- `npm run package` failed because the 22x22 tray icon was used as the macOS app icon; the bundle now uses Electron's default app icon
- `npm ci` failed on npm 7+ because `menubar` 9.5.2 capped its Electron peer below 35 (fixed in menubar 9.5.3)
- The scheduler leaked a cron task on every restart (`updateJob`, pause/resume)
- The version checker ignored `CLAUDE_CLI_PATH`, and asked the model to recall release notes it could not know; it now posts the notes from the official Claude Code CHANGELOG and only falls back to asking Claude
- The Settings page showed `v1.0.0`; it now shows the real app version
- `engagement-bot` exited silently with status 1 when tsx could not be found at `node_modules/.bin/tsx`; it now resolves tsx through Node and says what to do when it is missing
- discord.js `ready` deprecation warning (now `clientReady`)

### Added
- Test suite on the Node test runner (via tsx) covering config validation, the scheduler lifecycle, the API request guard, CLI `--json` output, and content helpers
- GitHub Actions CI: lint, test, and build on Node 22.12, 24, and 26, plus an unsigned macOS packaging dry run
- Monthly Dependabot updates for npm and GitHub Actions, with minor and patch updates grouped
- Type checking for the web UI and the tests (`npm run lint`)
- `CHANNEL_SHARE_YOUR_PROJECT` in `.env.example`
- **Full CLI interface** (`engagement-bot <command> [options]`)
- Offline commands: `status`, `history`, `schedule list/update`, `chat recent/topics/users`, `pins`, `channels`, `help`
- Connected commands: `serve`, `post`, `forum`, `command`, `schedule trigger`
- `forum <channel> --title --body [--tag X]` creates Discord forum posts; `forum tags <channel>` lists a forum's tags
- `--json` global flag for machine-readable output (`{ ok, data, timestamp }` envelope)
- `--help` flag works at any position
- Human-readable aligned text tables for terminal output
- Input validation: `--limit` (positive number), `--type` (tip/discussion/roundup/command/other), `--enabled` (true/false), `--cron` (valid expression)
- Unknown flag detection (rejects typos like `--limite`)
- Non-TTY stdin handling (auto-cancels confirmation prompts in CI/pipes)
- `bin/bot.js` binary entry point (`npm install -g .` in a clone links the `engagement-bot` command)
- `npm run bot` and `npm run cli` scripts

### Changed
- Upgraded Electron 41 → 44, Vite 6 → 8 (`@vitejs/plugin-react` 6), Tailwind CSS 3 → 4 (`@tailwindcss/vite`), TypeScript 5 → 7, zod 3 → 4, node-cron 3 → 4, dotenv 16 → 18, concurrently 9 → 10, discord.js 14.27, menubar 9.5.3, electron-builder 26.15, React 19.3, tsx 4.23
- Tailwind 4 keeps the existing layout; colors follow Tailwind 4's updated palette
- Knowledge base: the retired `claude-3-5-sonnet-20241022` / `claude-3-5-haiku-20241022` examples now use `claude-sonnet-5-5` / `claude-haiku-5-5`; the model table, Claude Code version, effort levels, permission modes, and `/branch` are current; sampling-parameter guidance reflects the Python SDK 1.x; `tool_choice` examples use the object form; dead docs links point to platform.claude.com
- Fallback posts and the prompt's MCP instructions refer to the current models and blog URLs
- Missing and empty required `.env` variables are both reported as `X is required`
- `src/index.ts` now delegates to `src/cli.ts` (CLI entry point)
- `npm run dev` now runs `tsx src/cli.ts serve` (equivalent to previous behavior)
- `scheduler.ts`: `getSchedule()` returns `running` field alongside `enabled`
- `scheduler.ts`: new `getScheduleConfig()` for offline-safe schedule reading
- `scheduler.ts`: `updateJob()` only restarts scheduler in live server context (`schedulerStarted` flag)
- `scheduler.ts`: `updateJob()` returns a copy instead of live object reference
- `command --preview` no longer opens Discord WebSocket (only needs env vars for content generation)
- Added `dotenv` to `dependencies` (was phantom dep from transitive install)

### Removed
- Unused `electron-store` dependency
- `autoprefixer`, the direct `postcss` dependency, `postcss.config.js`, `tailwind.config.js`, and `@types/node-cron` (no longer needed)

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
