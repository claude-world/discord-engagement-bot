/**
 * Shared interactive prompt utility.
 * Uses stderr for the prompt so stdout stays clean for --json piping.
 */
import * as readline from 'readline';

export function confirm(question: string): Promise<boolean> {
  // Non-TTY stdin (piped, CI, /dev/null) — treat as "No"
  if (!process.stdin.isTTY) {
    return Promise.resolve(false);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return new Promise(resolve => {
    rl.question(`${question} (y/N) `, answer => {
      const result = answer.toLowerCase() === 'y';
      resolve(result);
      rl.close();
    });
  });
}
