/**
 * Lazy connection wrapper — only connects to Discord when needed.
 */
import { getConfig } from '../config.js';
import { initBot, destroyBot } from '../bot.js';

/**
 * Run a function that requires a live Discord connection.
 * Handles init/destroy lifecycle automatically.
 */
export async function withBot<T>(fn: () => Promise<T>): Promise<T> {
  getConfig(); // Validate env vars before connecting
  await initBot();
  try {
    return await fn();
  } finally {
    await destroyBot();
  }
}
