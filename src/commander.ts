import { generateContent } from './content-generator.js';
import { buildCommanderPrompt, parseCommandResult, type CommandResult } from './prompts/commander.js';
import { buildDailyTipPrompt } from './prompts/daily-tip.js';
import { buildDiscussionPrompt } from './prompts/discussion.js';
import { buildWeeklyRoundupPrompt } from './prompts/weekly-roundup.js';
import { postToChannel } from './poster.js';

/**
 * Parse natural language input and generate content.
 * Returns preview; call executeCommand() to actually send.
 */
export async function parseCommand(input: string): Promise<CommandResult> {
  // Shortcut commands
  const lower = input.toLowerCase().trim();

  if (lower === '發技巧' || lower === 'tip') {
    const content = await generateContent(buildDailyTipPrompt());
    return { intent: 'tip', channel: 'daily-tips', content };
  }

  if (lower === '發討論' || lower === 'discussion') {
    const content = await generateContent(buildDiscussionPrompt());
    return { intent: 'discussion', channel: 'daily-tips', content };
  }

  if (lower === '發週報' || lower === 'roundup') {
    const content = await generateContent(buildWeeklyRoundupPrompt());
    return { intent: 'roundup', channel: 'announcements', content };
  }

  // Natural language → CLI parse
  const prompt = buildCommanderPrompt(input);
  const raw = await generateContent(prompt);
  return parseCommandResult(raw);
}

/**
 * Execute a command result: post to Discord.
 */
export async function executeCommand(cmd: CommandResult): Promise<void> {
  await postToChannel(cmd.channel, cmd.content, {
    type: cmd.intent,
    source: 'manual',
  });
}
