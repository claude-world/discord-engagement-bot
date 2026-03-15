/**
 * bot pins — show pinned/bookmarked messages.
 * Offline: reads data/pinned.jsonl.
 */
import { getPinnedEntries } from '../../knowledge-engine.js';
import type { Formatter } from '../output.js';

export function runPins(fmt: Formatter): void {
  const pins = getPinnedEntries();

  if (fmt.json) {
    fmt.result(pins);
    return;
  }

  if (pins.length === 0) {
    fmt.info('No pinned messages found.');
    return;
  }

  fmt.table(pins.map(p => ({
    time: p.timestamp.slice(0, 16).replace('T', ' '),
    user: p.username,
    channel: '#' + p.channel,
    content: p.content.slice(0, 60).replace(/\n/g, ' '),
  })));
}
