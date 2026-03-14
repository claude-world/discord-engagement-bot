import { z } from 'zod';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(process.cwd(), '.env') });

const ConfigSchema = z.object({
  DISCORD_BOT_TOKEN: z.string().min(1, 'DISCORD_BOT_TOKEN is required'),
  DISCORD_GUILD_ID: z.string().min(1, 'DISCORD_GUILD_ID is required'),
  CHANNEL_DAILY_TIPS: z.string().min(1, 'CHANNEL_DAILY_TIPS is required'),
  CHANNEL_GENERAL: z.string().min(1, 'CHANNEL_GENERAL is required'),
  CHANNEL_ANNOUNCEMENTS: z.string().min(1, 'CHANNEL_ANNOUNCEMENTS is required'),
  CHANNEL_NEWS: z.string().default(''),
  CHANNEL_SHOWCASE: z.string().default(''),
  CHANNEL_BOT_LOGS: z.string().default(''),
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
