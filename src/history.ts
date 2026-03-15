import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

export interface PostRecord {
  id: string;
  timestamp: string;
  channel: string;
  content: string;
  type: 'tip' | 'discussion' | 'roundup' | 'command' | 'other';
  source: 'scheduled' | 'manual';
  messageId?: string;
}

const HISTORY_FILE = resolve(process.cwd(), 'data', 'history.json');
const MAX_RECORDS = 500;

let records: PostRecord[] | null = null;

function loadRecords(): PostRecord[] {
  if (records !== null) return records;
  try {
    if (existsSync(HISTORY_FILE)) {
      records = JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
      return records!;
    }
  } catch {
    console.error('[history] Failed to load history, starting fresh');
  }
  records = [];
  return records;
}

function saveRecords(): void {
  mkdirSync(dirname(HISTORY_FILE), { recursive: true });
  writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2));
}

export function addRecord(input: Omit<PostRecord, 'id' | 'timestamp'>): PostRecord {
  const recs = loadRecords();
  const record: PostRecord = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  recs.unshift(record);

  // Trim to max
  if (recs.length > MAX_RECORDS) {
    recs.length = MAX_RECORDS;
  }

  saveRecords();
  return record;
}

export function getRecords(opts?: {
  limit?: number;
  type?: PostRecord['type'];
  channel?: string;
}): PostRecord[] {
  const recs = loadRecords();
  let filtered = recs;

  if (opts?.type) {
    filtered = filtered.filter(r => r.type === opts.type);
  }
  if (opts?.channel) {
    filtered = filtered.filter(r => r.channel === opts.channel);
  }

  return filtered.slice(0, opts?.limit ?? 50);
}

export function getTodayCount(): number {
  const today = new Date().toISOString().slice(0, 10);
  return loadRecords().filter(r => r.timestamp.startsWith(today)).length;
}

export function getLastRecord(): PostRecord | undefined {
  return loadRecords()[0];
}
