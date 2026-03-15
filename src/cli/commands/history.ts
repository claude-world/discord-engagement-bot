/**
 * bot history — show post history.
 * Offline: reads data/history.json.
 */
import { getRecords, type PostRecord } from '../../history.js';
import type { Formatter } from '../output.js';

interface HistoryOpts {
  limit?: number;
  type?: string;
}

const VALID_TYPES: PostRecord['type'][] = ['tip', 'discussion', 'roundup', 'command', 'other'];

export function runHistory(fmt: Formatter, opts: HistoryOpts): void {
  if (opts.type && !VALID_TYPES.includes(opts.type as PostRecord['type'])) {
    fmt.error(`Invalid type: ${opts.type}. Valid: ${VALID_TYPES.join(', ')}`);
    process.exit(1);
  }

  const records = getRecords({
    limit: opts.limit ?? 20,
    type: opts.type as PostRecord['type'] | undefined,
  });

  if (fmt.json) {
    fmt.result(records);
    return;
  }

  if (records.length === 0) {
    fmt.info('No post history found.');
    return;
  }

  fmt.table(records.map(r => ({
    time: r.timestamp.slice(0, 16).replace('T', ' '),
    channel: '#' + r.channel,
    type: r.type,
    source: r.source,
    preview: r.content.slice(0, 60).replace(/\n/g, ' '),
  })));
}
