import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { request, type IncomingHttpHeaders } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApiServer } from '../src/api-server.js';

const WEB_UI = 'http://localhost:5174';
const server = createApiServer();
let port = 0;

before(async () => {
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  port = (server.address() as AddressInfo).port;
});

after(() => server.close());

interface Reply {
  status: number;
  headers: IncomingHttpHeaders;
  body: string;
}

function send(path: string, opts: { method?: string; headers?: Record<string, string>; body?: string } = {}): Promise<Reply> {
  return new Promise((resolve, reject) => {
    const req = request({
      host: '127.0.0.1',
      port,
      path,
      method: opts.method ?? 'GET',
      headers: { host: `127.0.0.1:${port}`, ...opts.headers },
      agent: false,
    }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end(opts.body);
  });
}

test('serves the web UI origin', async () => {
  const res = await send('/api/channels', { headers: { origin: WEB_UI } });
  assert.equal(res.status, 200);
  assert.ok(JSON.parse(res.body).includes('general'));
  assert.equal(res.headers['access-control-allow-origin'], WEB_UI);
});

test('rejects a DNS-rebinding Host header', async () => {
  const res = await send('/api/channels', { headers: { host: `attacker.example:${port}` } });
  assert.equal(res.status, 403);
});

test('rejects requests from another origin', async () => {
  const res = await send('/api/channels', { headers: { origin: 'https://attacker.example' } });
  assert.equal(res.status, 403);
});

test('rejects cross-site simple POSTs before they reach Discord', async () => {
  const res = await send('/api/commander/execute', {
    method: 'POST',
    headers: { 'content-type': 'text/plain' },
    body: JSON.stringify({ intent: 'custom', channel: 'general', content: 'spam' }),
  });
  assert.equal(res.status, 415);
});

test('accepts JSON POSTs from the web UI', async () => {
  const res = await send('/api/schedule/update', {
    method: 'POST',
    headers: { origin: WEB_UI, 'content-type': 'application/json' },
    body: JSON.stringify({ id: 'weekendChallenge', updates: { enabled: false } }),
  });
  assert.equal(res.status, 200);

  const schedule: Array<{ id: string; enabled: boolean }> = JSON.parse((await send('/api/schedule')).body);
  assert.equal(schedule.find(j => j.id === 'weekendChallenge')?.enabled, false);
});
