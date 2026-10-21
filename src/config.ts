import { z } from 'zod';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

// quiet: dotenv >= 17 logs an "injected env" line on every load, which would pollute CLI output
loadEnv({ path: resolve(process.cwd(), '.env'), quiet: true });

// Same message whether the variable is missing or empty
const required = (name: string) => z.string({ error: `${name} is required` }).min(1, `${name} is required`);

export const ConfigSchema = z.object({
  DISCORD_BOT_TOKEN: required('DISCORD_BOT_TOKEN'),
  DISCORD_GUILD_ID: required('DISCORD_GUILD_ID'),
  CHANNEL_DAILY_TIPS: required('CHANNEL_DAILY_TIPS'),
  CHANNEL_GENERAL: required('CHANNEL_GENERAL'),
  CHANNEL_ANNOUNCEMENTS: required('CHANNEL_ANNOUNCEMENTS'),
  CHANNEL_NEWS: z.string().default(''),
  CHANNEL_SHOWCASE: z.string().default(''),
  CHANNEL_BOT_LOGS: z.string().default(''),
  CHANNEL_SHARE_YOUR_PROJECT: z.string().default(''),
  CLAUDE_CLI_PATH: z.string().default('claude'),
  CONTENT_TIMEOUT: z.string().default('60000').transform(Number).pipe(z.number().int().min(5000).max(300000)),
});

export type Config = z.infer<typeof ConfigSchema>;

let _config: Config | null = null;

export function getConfig(): Config {
  if (_config) return _config;

  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Config validation failed:\n${errors}`);
  }
  _config = result.data;
  return _config;
}

// Channel name → env key mapping
const CHANNEL_MAP: Record<string, keyof Config> = {
  'daily-tips': 'CHANNEL_DAILY_TIPS',
  'general': 'CHANNEL_GENERAL',
  'announcements': 'CHANNEL_ANNOUNCEMENTS',
  'news': 'CHANNEL_NEWS',
  'showcase': 'CHANNEL_SHOWCASE',
  'bot-logs': 'CHANNEL_BOT_LOGS',
  'share-your-project': 'CHANNEL_SHARE_YOUR_PROJECT',
};

export function getChannelId(name: string): string {
  const key = CHANNEL_MAP[name];
  if (!key) throw new Error(`Unknown channel: ${name}`);
  const id = getConfig()[key] as string;
  if (!id) throw new Error(`Channel ID not configured for: ${name}`);
  return id;
}

export function getChannelNames(): string[] {
  return Object.keys(CHANNEL_MAP);
}
