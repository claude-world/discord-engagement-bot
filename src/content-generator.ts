import { execFile } from 'child_process';
import { getConfig } from './config.js';
import { DAILY_TIP_FALLBACKS } from './prompts/daily-tip.js';

/**
 * Generate content using local CLI (claude -p / codex exec).
 * Falls back to static content on failure.
 */
export async function generateContent(
  prompt: string,
  opts?: {
    cli?: 'claude' | 'codex';
    timeout?: number;
  }
): Promise<string> {
  const config = getConfig();
  const cli = opts?.cli ?? 'claude';
  const timeout = opts?.timeout ?? config.CONTENT_TIMEOUT;

  const cmd = cli === 'codex' ? 'codex' : config.CLAUDE_CLI_PATH;
  const args = cli === 'codex' ? ['exec', prompt] : ['-p', prompt];

  try {
    const result = await new Promise<string>((resolve, reject) => {
      execFile(cmd, args, { timeout, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
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
