import path from 'node:path';
import os from 'node:os';

const home = os.homedir();

export const APP_PORT = 5077;
export const APP_HOST = '127.0.0.1';

export const OPENCLAW_HOME = path.join(home, '.openclaw');
export const OPENCLAW_CONFIG_PATH = path.join(OPENCLAW_HOME, 'openclaw.json');
export const SISTER_LOGS_ROOT = path.join(OPENCLAW_HOME, 'agents');
export const SUBAGENT_RUNS_PATH = path.join(OPENCLAW_HOME, 'subagents', 'runs.json');
export const GLOBAL_SKILL_ROOT_CANDIDATES = [
  '/opt/homebrew/lib/node_modules/openclaw/skills',
  '/usr/local/lib/node_modules/openclaw/skills',
  path.join(OPENCLAW_HOME, 'skills')
];

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

export const SAI_ONLINE_LINKS = [
  { name: 'Colosseum Dashboard', url: 'https://colosseum-dashboard.vercel.app' },
  { name: 'HITL Human Guide', url: 'https://hitl-human-guide.vercel.app' },
  { name: 'HITL Dashboard', url: 'https://hitl-dashboard-kappa.vercel.app' },
  { name: 'Zone Action Sprint', url: 'https://zone-action-sprint.vercel.app' },
  { name: 'Recovery Colosseum', url: 'https://recovery-colosseum.vercel.app' },
  { name: 'Recovery Pipeline', url: 'https://recovery-pipeline.vercel.app' },
  { name: 'Come Get Me', url: 'https://come-get-me.vercel.app' },
  { name: 'Marketing Report', url: 'https://reports-puce-tau.vercel.app' },
  { name: 'Genesis Forge', url: 'https://www.genesisforgeofheroes.ai' },
  { name: 'SAI Dashboards', url: 'https://sai-dashboards.vercel.app' },
  { name: 'ROI Calculator', url: 'https://roi-calculator-app-ashy.vercel.app' },
  { name: 'Genesis Admin', url: 'https://genesis-admin.vercel.app' },
  { name: 'Presentations', url: 'https://presentations-sable.vercel.app' },
  { name: 'New Athena Test', url: 'https://new-athena-test.vercel.app' }
];

export const SNAPSHOT_FALLBACK_PATH = path.join(
  OPENCLAW_HOME,
  'workspace',
  'colosseum-dashboard',
  'data',
  'main_colosseum.json'
);
