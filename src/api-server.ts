/**
 * HTTP API server for web UI (non-Electron mode).
 * Exposes the same operations as Electron IPC handlers.
 */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { isConnected } from './bot.js';
import { parseCommand, executeCommand } from './commander.js';
import { getSchedule, updateJob, triggerJob } from './scheduler.js';
import { getRecords, getTodayCount, getLastRecord } from './history.js';
import { getChannelNames } from './config.js';

const PORT = 3456;

function cors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res: ServerResponse, data: unknown, status = 200) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function readBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString());
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const url = req.url ?? '/';
  const method = req.method ?? 'GET';

  // CORS preflight
  if (method === 'OPTIONS') { cors(res); res.writeHead(204); res.end(); return; }

  try {
    // GET /api/status
    if (url === '/api/status' && method === 'GET') {
      const last = getLastRecord();
      return json(res, {
        connected: isConnected(),
        todayCount: getTodayCount(),
        lastPost: last ? { timestamp: last.timestamp, channel: last.channel, content: last.content } : undefined,
        schedule: getSchedule(),
      });
    }

    // POST /api/commander/parse  { input: string }
    if (url === '/api/commander/parse' && method === 'POST') {
      const { input } = await readBody(req);
      const result = await parseCommand(input);
      return json(res, result);
    }

    // POST /api/commander/execute  { intent, channel, content }
    if (url === '/api/commander/execute' && method === 'POST') {
      const cmd = await readBody(req);
      await executeCommand(cmd);
      return json(res, { ok: true });
    }

    // GET /api/schedule
    if (url === '/api/schedule' && method === 'GET') {
      return json(res, getSchedule());
    }

    // POST /api/schedule/update  { id, updates }
    if (url === '/api/schedule/update' && method === 'POST') {
      const { id, updates } = await readBody(req);
      updateJob(id, updates);
      return json(res, { ok: true });
    }

    // POST /api/schedule/trigger  { id }
    if (url === '/api/schedule/trigger' && method === 'POST') {
      const { id } = await readBody(req);
      await triggerJob(id);
      return json(res, { ok: true });
    }

    // GET /api/history
    if (url.startsWith('/api/history') && method === 'GET') {
      return json(res, getRecords());
    }

    // GET /api/channels
    if (url === '/api/channels' && method === 'GET') {
      return json(res, getChannelNames());
    }

    json(res, { error: 'Not found' }, 404);
  } catch (err) {
    console.error('[api]', (err as Error).message);
    json(res, { error: (err as Error).message }, 500);
  }
}

export function startApiServer(): void {
  const server = createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`[api] HTTP API running at http://localhost:${PORT}`);
  });
}
