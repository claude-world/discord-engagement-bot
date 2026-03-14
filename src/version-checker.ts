/**
 * Claude Code version checker.
 * Checks for new versions and posts release notes to Discord.
 */
import { execFile } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { generateContent } from './content-generator.js';
import { buildReleaseNewsPrompt } from './prompts/release-news.js';
import { postToChannel, logToBot } from './poster.js';

const VERSION_FILE = resolve(process.cwd(), 'data', 'last-version.txt');

function getLastKnownVersion(): string {
  try {
    if (existsSync(VERSION_FILE)) {
      return readFileSync(VERSION_FILE, 'utf-8').trim();
    }
  } catch {}
  return '';
}

function saveVersion(version: string): void {
  mkdirSync(dirname(VERSION_FILE), { recursive: true });
  writeFileSync(VERSION_FILE, version);
}

async function getCurrentVersion(): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile('claude', ['--version'], { timeout: 10_000 }, (err, stdout) => {
      if (err) return reject(err);
      // Output: "2.1.76 (Claude Code)"
      const match = stdout.trim().match(/^([\d.]+)/);
      resolve(match ? match[1]! : '');
    });
  });
}

async function getChangelog(version: string): Promise<string> {
  // Try to fetch changelog from npm or GitHub
  return new Promise((resolve) => {
    execFile('claude', ['-p', '--model', 'sonnet',
      `What are the key changes in Claude Code version ${version}? List the main new features, improvements, and fixes in bullet points. Be concise.`
    ], { timeout: 60_000 }, (err, stdout) => {
      if (err || !stdout.trim()) {
        resolve(`Claude Code ${version} has been released.`);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

/**
 * Check for new Claude Code version and post to Discord if updated.
 */
export async function checkVersion(): Promise<void> {
  try {
    const current = await getCurrentVersion();
    if (!current) {
      console.log('[version] Could not get current version');
      return;
    }

    const last = getLastKnownVersion();
    console.log(`[version] Current: ${current}, Last known: ${last || 'none'}`);

    if (!last) {
      // First run, just save current version
      saveVersion(current);
      console.log(`[version] Initialized with version ${current}`);
      return;
    }

    if (current === last) {
      console.log('[version] No update');
      return;
    }

    // New version detected!
    console.log(`[version] New version detected: ${last} → ${current}`);
    await logToBot(`🆕 Claude Code ${current} detected (was ${last})`);

    // Get changelog and generate post
    const changelog = await getChangelog(current);
    const content = await generateContent(
      buildReleaseNewsPrompt(current, changelog),
      { useMcp: false } // No need for trends in version updates
    );

    await postToChannel('news', content, {
      type: 'other',
      source: 'scheduled',
    });

    saveVersion(current);
    console.log(`[version] Posted update notification for ${current}`);
  } catch (err) {
    console.error('[version] Check failed:', (err as Error).message);
  }
}
