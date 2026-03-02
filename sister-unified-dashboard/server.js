import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { URL } from 'node:url';

import { APP_HOST, APP_PORT, LOOKBACK_DAYS_DEFAULT, PROJECT_ROOT } from './src/config.js';
import { initDb } from './src/db.js';
import {
  ApiError,
  createAssignment,
  getAssignment,
  getAssignmentEvents,
  listAssignments,
  updateAssignment
} from './src/repositories/assignments.js';
import {
  ensureIngested,
  getEvents,
  getHealth,
  getOverview,
  getSisterProfile,
  getSisterWorkboardDetail,
  getSisters,
  getWorkboard
} from './src/services.js';

const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');

function json(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function text(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(payload);
}

function jsonError(res, statusCode, code, message) {
  return json(res, statusCode, { ok: false, code, message });
}

async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must be valid JSON');
  }
}

async function serveStaticFile(res, filePath) {
  try {
    const data = await fsp.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type =
      ext === '.html'
        ? 'text/html; charset=utf-8'
        : ext === '.css'
          ? 'text/css; charset=utf-8'
          : ext === '.js'
            ? 'application/javascript; charset=utf-8'
            : 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  } catch {
    text(res, 404, 'Not Found');
  }
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

async function handleRequest(req, res) {
  const method = req.method || 'GET';
  const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

  if (url.pathname === '/api/health' && method === 'GET') {
    return json(res, 200, getHealth());
  }

  if (url.pathname === '/api/overview' && method === 'GET') {
    const days = toInt(url.searchParams.get('days'), LOOKBACK_DAYS_DEFAULT);
    return json(res, 200, getOverview(days));
  }

  if (url.pathname === '/api/sisters' && method === 'GET') {
    const days = toInt(url.searchParams.get('days'), LOOKBACK_DAYS_DEFAULT);
    return json(res, 200, getSisters(days));
  }

  const sisterProfileMatch = url.pathname.match(/^\/api\/sisters\/([^/]+)\/profile$/);
  if (sisterProfileMatch && method === 'GET') {
    const sisterId = decodeURIComponent(sisterProfileMatch[1]);
    const days = toInt(url.searchParams.get('days'), LOOKBACK_DAYS_DEFAULT);
    const profile = getSisterProfile(sisterId, days);
    if (!profile) {
      return jsonError(res, 404, 'SISTER_NOT_FOUND', `Sister not found: ${sisterId}`);
    }
    return json(res, 200, { ok: true, profile });
  }

  if (url.pathname === '/api/events' && method === 'GET') {
    const days = toInt(url.searchParams.get('days'), LOOKBACK_DAYS_DEFAULT);
    const limit = toInt(url.searchParams.get('limit'), 10);
    const sisterId = url.searchParams.get('sister_id') || null;
    return json(res, 200, getEvents({ days, limit, sisterId }));
  }

  if (url.pathname === '/api/workboard' && method === 'GET') {
    const days = toInt(url.searchParams.get('days'), LOOKBACK_DAYS_DEFAULT);
    return json(res, 200, getWorkboard(days));
  }

  const workboardDetailMatch = url.pathname.match(/^\/api\/workboard\/([^/]+)$/);
  if (workboardDetailMatch && method === 'GET') {
    const sisterId = decodeURIComponent(workboardDetailMatch[1]);
    const days = toInt(url.searchParams.get('days'), LOOKBACK_DAYS_DEFAULT);
    const limit = toInt(url.searchParams.get('limit'), 120);
    const detail = getSisterWorkboardDetail(sisterId, days, limit);
    if (!detail) {
      return jsonError(res, 404, 'SISTER_NOT_FOUND', `Sister not found: ${sisterId}`);
    }
    return json(res, 200, { ok: true, detail });
  }

  if (url.pathname === '/api/refresh' && method === 'POST') {
    return json(res, 200, ensureIngested(true));
  }

  if (url.pathname === '/api/assignments' && method === 'GET') {
    const days = toInt(url.searchParams.get('days'), LOOKBACK_DAYS_DEFAULT);
    const limit = toInt(url.searchParams.get('limit'), 100);
    const status = url.searchParams.get('status') || null;
    const ownerSisterId = url.searchParams.get('owner_sister_id') || null;

    const payload = listAssignments({ days, limit, status, ownerSisterId });
    return json(res, 200, payload);
  }

  if (url.pathname === '/api/assignments' && method === 'POST') {
    ensureIngested(false);
    const body = await parseJsonBody(req);
    const actor = String(body.actor || 'operator').trim() || 'operator';
    const created = createAssignment(body, actor);
    return json(res, 201, { ok: true, item: created });
  }

  const assignmentEventsMatch = url.pathname.match(/^\/api\/assignments\/([^/]+)\/events$/);
  if (assignmentEventsMatch && method === 'GET') {
    const assignmentId = decodeURIComponent(assignmentEventsMatch[1]);
    const exists = getAssignment(assignmentId);
    if (!exists) {
      return jsonError(res, 404, 'ASSIGNMENT_NOT_FOUND', `Assignment not found: ${assignmentId}`);
    }

    const limit = toInt(url.searchParams.get('limit'), 200);
    return json(res, 200, { ok: true, ...getAssignmentEvents(assignmentId, limit) });
  }

  const assignmentMatch = url.pathname.match(/^\/api\/assignments\/([^/]+)$/);
  if (assignmentMatch && method === 'GET') {
    const assignmentId = decodeURIComponent(assignmentMatch[1]);
    const item = getAssignment(assignmentId);
    if (!item) {
      return jsonError(res, 404, 'ASSIGNMENT_NOT_FOUND', `Assignment not found: ${assignmentId}`);
    }
    return json(res, 200, { ok: true, item });
  }

  if (assignmentMatch && method === 'PATCH') {
    const assignmentId = decodeURIComponent(assignmentMatch[1]);
    const body = await parseJsonBody(req);
    const actor = String(body.actor || 'operator').trim() || 'operator';
    const item = updateAssignment(assignmentId, body, actor);
    return json(res, 200, { ok: true, item });
  }

  if (method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    return serveStaticFile(res, path.join(PUBLIC_DIR, 'index.html'));
  }

  if (method === 'GET' && url.pathname.startsWith('/')) {
    const cleanPath = path.normalize(url.pathname).replace(/^\/+/, '');
    const filePath = path.join(PUBLIC_DIR, cleanPath);
    if (filePath.startsWith(PUBLIC_DIR) && fs.existsSync(filePath)) {
      return serveStaticFile(res, filePath);
    }
  }

  return text(res, 404, 'Not Found');
}

initDb();
ensureIngested(true);

const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(res, error.status, error.code, error.message);
    }

    // eslint-disable-next-line no-console
    console.error(error);
    return jsonError(res, 500, 'INTERNAL_ERROR', 'Unexpected server error');
  }
});

server.listen(APP_PORT, APP_HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Sister Unified Dashboard running at http://${APP_HOST}:${APP_PORT}`);
});
