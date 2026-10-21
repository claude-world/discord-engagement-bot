/**
 * HTTP API server for web UI (non-Electron mode).
 * Exposes the same operations as Electron IPC handlers.
 */
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { isConnected } from './bot.js';
import { parseCommand, executeCommand } from './commander.js';
import { getSchedule, updateJob, triggerJob } from './scheduler.js';
import { getRecords, getTodayCount, getLastRecord } from './history.js';
import { getChannelNames } from './config.js';
import { getRecentChats, getPopularTopics, getActiveUsers } from './chat-logger.js';
import { getPinnedEntries } from './knowledge-engine.js';

const PORT = 3456;
const MAX_BODY = 64 * 1024; // 64 KB
const ALLOWED_ORIGIN = 'http://localhost:5174'; // web UI dev server (vite.config.mts)
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1']);

function cors(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function hostnameOf(host: string | undefined): string {
  try {
    return new URL(`http://${host}`).hostname;
  } catch {
    return '';
  }
}

/**
 * Block requests another website could send through the operator's browser:
 * a non-loopback Host means DNS rebinding, a foreign Origin means a cross-site request,
 * and requiring JSON bodies forces a CORS preflight for any cross-site POST.
 */
function rejectRequest(req: IncomingMessage, method: string): [status: number, error: string] | null {
  if (!LOOPBACK_HOSTS.has(hostnameOf(req.headers.host))) return [403, 'Forbidden host'];
  if (req.headers.origin && req.headers.origin !== ALLOWED_ORIGIN) return [403, 'Forbidden origin'];
  if (method === 'POST' && !req.headers['content-type']?.startsWith('application/json')) {
    return [415, 'Content-Type must be application/json'];
  }
  return null;
}

function json(res: ServerResponse, data: unknown, status = 200) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function readBody(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new Error('Request body too large');
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    throw new Error('Invalid JSON body');
  }
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const url = req.url ?? '/';
  const method = req.method ?? 'GET';

  const rejected = rejectRequest(req, method);
  if (rejected) return json(res, { error: rejected[1] }, rejected[0]);

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

    // GET /api/chat/recent
    if (url === '/api/chat/recent' && method === 'GET') {
      return json(res, getRecentChats(50));
    }

    // GET /api/chat/topics
    if (url === '/api/chat/topics' && method === 'GET') {
      return json(res, getPopularTopics(10));
    }

    // GET /api/chat/users
    if (url === '/api/chat/users' && method === 'GET') {
      return json(res, getActiveUsers(20));
    }

    // GET /api/knowledge/pins
    if (url === '/api/knowledge/pins' && method === 'GET') {
      return json(res, getPinnedEntries());
    }

    json(res, { error: 'Not found' }, 404);
  } catch (err) {
    console.error('[api]', (err as Error).message);
    json(res, { error: (err as Error).message }, 500);
  }
}

export function createApiServer(): Server {
  return createServer(handleRequest);
}

export function startApiServer(): void {
  const server = createApiServer();
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[api] HTTP API running at http://localhost:${PORT}`);
  });
}
