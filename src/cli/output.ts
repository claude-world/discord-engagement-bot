/**
 * CLI output formatter — JSON or human-readable.
 * JSON mode: stdout gets { ok, data, timestamp }, info/error go to stderr.
 * Human mode: aligned text tables, info/error to stderr.
 */

export interface Formatter {
  readonly json: boolean;
  result(data: unknown): void;
  table(rows: Record<string, unknown>[]): void;
  info(msg: string): void;
  error(msg: string): void;
}

function jsonFormatter(): Formatter {
  return {
    json: true,
    result(data: unknown) {
      process.stdout.write(JSON.stringify({ ok: true, data, timestamp: new Date().toISOString() }) + '\n');
    },
    table(rows: Record<string, unknown>[]) {
      process.stdout.write(JSON.stringify({ ok: true, data: rows, timestamp: new Date().toISOString() }) + '\n');
    },
    info(msg: string) {
      process.stderr.write(msg + '\n');
    },
    error(msg: string) {
      process.stderr.write(msg + '\n');
    },
  };
}

function humanFormatter(): Formatter {
  return {
    json: false,
    result(data: unknown) {
      if (typeof data === 'string') {
        console.log(data);
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
    },
    table(rows: Record<string, unknown>[]) {
      if (rows.length === 0) {
        console.log('(no data)');
        return;
      }
      printTable(rows);
    },
    info(msg: string) {
      console.error(msg);
    },
    error(msg: string) {
      console.error(msg);
    },
  };
}

/**
 * Print an aligned text table from an array of objects.
 */
function printTable(rows: Record<string, unknown>[]): void {
  const keys = Object.keys(rows[0]!);
  const widths = new Map<string, number>();

  for (const key of keys) {
    widths.set(key, key.length);
  }

  const stringRows = rows.map(row => {
    const out: Record<string, string> = {};
    for (const key of keys) {
      const val = row[key];
      const str = val === null || val === undefined ? '' : String(val);
      out[key] = str;
      widths.set(key, Math.max(widths.get(key)!, str.length));
    }
    return out;
  });

  // Header
  const header = keys.map(k => k.padEnd(widths.get(k)!)).join('  ');
  const separator = keys.map(k => '-'.repeat(widths.get(k)!)).join('  ');
  console.log(header);
  console.log(separator);

  // Rows
  for (const row of stringRows) {
    const line = keys.map(k => (row[k] ?? '').padEnd(widths.get(k)!)).join('  ');
    console.log(line);
  }
}

export function createFormatter(jsonMode: boolean): Formatter {
  return jsonMode ? jsonFormatter() : humanFormatter();
}

/**
 * Write a JSON error response to stdout (for --json mode).
 */
export function jsonError(message: string, code: string): void {
  process.stdout.write(JSON.stringify({ ok: false, error: message, code, timestamp: new Date().toISOString() }) + '\n');
}
