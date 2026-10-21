#!/usr/bin/env node
// Launch the CLI through tsx to handle TypeScript + dynamic imports.
// tsx is a dev dependency: run from a clone after `npm install` (`npm install -g .` links the command).
const { execFileSync } = require('child_process');
const { resolve } = require('path');

let tsx;
try {
  tsx = require.resolve('tsx/cli');
} catch {
  console.error('engagement-bot: tsx not found. Run `npm install` in the discord-engagement-bot folder first.');
  process.exit(1);
}

const cli = resolve(__dirname, '..', 'src', 'cli.ts');
try {
  execFileSync(process.execPath, [tsx, cli, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env,
  });
} catch (err) {
  process.exit(err.status ?? 1);
}
