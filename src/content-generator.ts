import { execFile } from 'child_process';
import { resolve } from 'path';
import { getConfig } from './config.js';
import { DAILY_TIP_FALLBACKS } from './prompts/daily-tip.js';

const MCP_CONFIG = resolve(process.cwd(), '.mcp.json');

/**
 * Generate content using local CLI with MCP tools.
 * Uses `claude -p --mcp-config` to enable trend-pulse and cf-browser.
 * Falls back to static content on failure.
 */
export async function generateContent(
  prompt: string,
  opts?: {
    cli?: 'claude' | 'codex';
    timeout?: number;
    useMcp?: boolean;
  }
): Promise<string> {
  const config = getConfig();
  const cli = opts?.cli ?? 'claude';
  const timeout = opts?.timeout ?? config.CONTENT_TIMEOUT;
  const useMcp = opts?.useMcp ?? true;

  const cmd = cli === 'codex' ? 'codex' : config.CLAUDE_CLI_PATH;
  let args: string[];

  if (cli === 'codex') {
    args = ['exec', prompt];
  } else {
    args = ['-p'];
    if (useMcp) {
      args.push('--mcp-config', MCP_CONFIG);
    }
    args.push(prompt);
  }

  try {
    const result = await new Promise<string>((resolve, reject) => {
      execFile(cmd, args, {
        timeout,
        maxBuffer: 1024 * 1024,
        cwd: process.cwd(),
      }, (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`CLI failed: ${err.message}${stderr ? `\n${stderr}` : ''}`));
          return;
        }
        resolve(stdout.trim());
      });
    });

    if (!result || result.length < 20) {
      throw new Error('CLI returned empty or too-short response');
    }

    return result;
  } catch (err) {
    console.error(`[content-gen] CLI failed, using fallback:`, (err as Error).message);
    return getFallbackContent();
  }
}

function getFallbackContent(): string {
  const idx = Math.floor(Math.random() * DAILY_TIP_FALLBACKS.length);
  return DAILY_TIP_FALLBACKS[idx]!;
}
