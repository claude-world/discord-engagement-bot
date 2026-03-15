/**
 * bot help — print all available commands.
 */

export function runHelp(): void {
  console.log(`
Discord Engagement Bot CLI

Usage: engagement-bot <command> [options]
       npm run bot -- <command> [options]

Commands:
  serve                                Start bot + scheduler + API + REPL (default)
  status                               Connection status, today's posts, schedule
  history [--limit N] [--type X]       Post history
  schedule list                        Show scheduled jobs
  schedule trigger <id>                Run a job immediately  [connected]
  schedule update <id> [options]       Update job config
  post <channel> <text> [--yes]        Post to a channel      [connected]
  forum <channel> --title --body       Create forum post      [connected]
  forum tags <channel>                 List forum tags        [connected]
  command <text> [--preview] [--yes]   Natural language command [connected]
  chat recent [--limit N]              Recent chat messages
  chat topics                          Popular topics
  chat users                           Active users
  pins                                 Pinned/bookmarked messages
  channels                             Available channel names
  help                                 Show this help

Global flags:
  --json       Output as JSON (stdout)
  --help       Show help for a command

Schedule update options:
  --enabled true|false
  --cron "..."
  --channel <name>

Forum options:
  --title "..."          Post title (required)
  --body "..."           Post body (required)
  --tag X                Tag name (repeatable: --tag cli --tag open-source)

Examples:
  engagement-bot status --json
  engagement-bot history --limit 5 --type tip
  engagement-bot schedule list --json
  engagement-bot chat topics --json | jq .data
  engagement-bot post general "Hello!" --yes
  engagement-bot command "發一則 MCP 技巧" --yes
  engagement-bot forum tags share-your-project
  engagement-bot forum share-your-project --title "My Project" --body "Description" --tag cli --yes
`.trim());
}
