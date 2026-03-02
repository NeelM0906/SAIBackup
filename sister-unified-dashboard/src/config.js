import path from 'node:path';
import os from 'node:os';

const home = os.homedir();

export const APP_PORT = 5077;
export const APP_HOST = '127.0.0.1';

export const OPENCLAW_HOME = path.join(home, '.openclaw');
export const OPENCLAW_CONFIG_PATH = path.join(OPENCLAW_HOME, 'openclaw.json');
export const SISTER_LOGS_ROOT = path.join(OPENCLAW_HOME, 'agents');

export const PROJECT_ROOT = path.resolve(path.join(import.meta.dirname, '..'));
export const DB_PATH = path.join(PROJECT_ROOT, 'data', 'dashboard.db');

export const LOOKBACK_DAYS_DEFAULT = 7;
export const INGEST_MIN_INTERVAL_MS = 5_000;
export const ONLINE_WINDOW_SECONDS = 10 * 60;
export const IDLE_WINDOW_SECONDS = 6 * 60 * 60;

export const COLOSSEUM_MAIN_DB = path.join(home, 'Projects', 'colosseum', 'colosseum.db');
export const COLOSSEUM_DOMAINS_ROOT = path.join(home, 'Projects', 'colosseum', 'domains');
export const COLOSSEUM_API_BASE = process.env.COLOSSEUM_API_BASE || 'http://127.0.0.1:5050/api';
export const COLOSSEUM_DOMAIN_LIST = [
  'strategy',
  'marketing',
  'sales',
  'tech',
  'ops',
  'cs',
  'finance',
  'hr',
  'legal',
  'product'
];

export const SNAPSHOT_FALLBACK_PATH = path.join(
  OPENCLAW_HOME,
  'workspace',
  'colosseum-dashboard',
  'data',
  'main_colosseum.json'
);
