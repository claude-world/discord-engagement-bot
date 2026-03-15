#!/usr/bin/env node
// Launch CLI via the local tsx binary to handle TypeScript + dynamic imports.
const { execFileSync } = require('child_process');
const { resolve } = require('path');

const tsx = resolve(__dirname, '..', 'node_modules', '.bin', 'tsx');
const cli = resolve(__dirname, '..', 'src', 'cli.ts');
try {
  execFileSync(tsx, [cli, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env,
  });
} catch (err) {
  process.exit(err.status ?? 1);
}
