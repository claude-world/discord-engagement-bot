/**
 * bot channels — list available channel names.
 * Offline: reads static CHANNEL_MAP (no env vars needed).
 */
import { getChannelNames } from '../../config.js';
import type { Formatter } from '../output.js';

export function runChannels(fmt: Formatter): void {
  const names = getChannelNames();

  if (fmt.json) {
    fmt.result(names);
    return;
  }

  fmt.table(names.map(n => ({ channel: '#' + n })));
}
