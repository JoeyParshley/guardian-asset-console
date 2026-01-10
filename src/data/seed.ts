import type {
  Asset,
  AssetStatus,
  AuditLog,
  Incident,
  Scan,
  Severity,
  User,
} from '../domain/types';

/**
 * Seeded pseudo-random number generator (Mulberry32)
 * Produces deterministic sequences for stable tests
 */
function createRng(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Helper to pick a random item from an array using seeded RNG
 */
function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/**
 * Helper to generate a random integer in a range using seeded RNG
 */
function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Generate a deterministic UUID-like ID
 */
function generateId(rng: () => number, prefix: string): string {
  const hex = () =>
    Math.floor(rng() * 16)
      .toString(16)
      .toLowerCase();
  const segment = (len: number) =>
    Array.from({ length: len }, hex).join('');
  return `${prefix}-${segment(8)}-${segment(4)}-${segment(4)}-${segment(12)}`;
}

// Base date for seed data (fixed for determinism)
const BASE_DATE = new Date('2024-01-15T00:00:00.000Z');

/**
 * Generate a deterministic ISO timestamp offset from base date
 */
function generateTimestamp(rng: () => number, daysBack: number): string {
  const offsetMs =
    daysBack * 24 * 60 * 60 * 1000 +
    randomInt(rng, 0, 23) * 60 * 60 * 1000 +
    randomInt(rng, 0, 59) * 60 * 1000 +
    randomInt(rng, 0, 59) * 1000;
  return new Date(BASE_DATE.getTime() - offsetMs).toISOString();
}

// Static data for seed generation
const SITES = [
  'Site Alpha',
  'Site Bravo',
  'Site Charlie',
  'Site Delta',
  'Site Echo',
];

const ASSET_PREFIXES = [
  'Pallet',
  'Container',
  'Crate',
  'Drum',
  'Rack',
  'Carton',
  'Bin',
  'Tote',
];

const READER_IDS = [
  'READER-001',
  'READER-002',
  'READER-003',
  'READER-004',
  'READER-005',
];

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
const STATUSES: AssetStatus[] = ['active', 'missing', 'anomaly', 'resolved'];

const INCIDENT_DESCRIPTIONS = [
  'Asset not detected at expected location',
  'Unexpected movement detected outside business hours',
  'Signal anomaly detected on RFID tag',
  'Asset moved to restricted zone without authorization',
  'Multiple scans from different locations within short timeframe',
  'Tag signal strength below threshold',
  'Asset missing from scheduled inventory check',
  'Unauthorized zone transition detected',
];

const AUDIT_ACTIONS = [
  'asset.view',
  'asset.update',
  'incident.resolve',
  'incident.create',
  'scan.create',
  'user.login',
  'user.logout',
  'filter.apply',
];

/**
 * Seed users (static, not randomly generated)
 */
export const SEED_USERS: User[] = [
  { id: 'user-001', name: 'Alice Operator', role: 'operator' },
  { id: 'user-002', name: 'Bob Admin', role: 'admin' },
  { id: 'user-003', name: 'Carol Auditor', role: 'auditor' },
  { id: 'user-004', name: 'Dave Operator', role: 'operator' },
  { id: 'user-005', name: 'Eve Admin', role: 'admin' },
];

export interface SeedData {
  users: User[];
  assets: Asset[];
  scans: Scan[];
  incidents: Incident[];
  auditLogs: AuditLog[];
}

export interface SeedOptions {
  seed?: number;
  assetCount?: number;
  scansPerAsset?: number;
  incidentProbability?: number;
  auditLogCount?: number;
}

const DEFAULT_OPTIONS: Required<SeedOptions> = {
  seed: 12345,
  assetCount: 50,
  scansPerAsset: 5,
  incidentProbability: 0.3,
  auditLogCount: 100,
};

/**
 * Generate deterministic seed data for the application
 */
export function generateSeedData(options: SeedOptions = {}): SeedData {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const rng = createRng(opts.seed);

  const assets: Asset[] = [];
  const scans: Scan[] = [];
  const incidents: Incident[] = [];
  const auditLogs: AuditLog[] = [];

  // Generate assets
  for (let i = 0; i < opts.assetCount; i++) {
    const prefix = pick(rng, ASSET_PREFIXES);
    const site = pick(rng, SITES);
    const status = pick(rng, STATUSES);
    const severity =
      status === 'active' || status === 'resolved'
        ? pick(rng, ['low', 'info'] as Severity[])
        : pick(rng, SEVERITIES);
    const createdDaysBack = randomInt(rng, 30, 365);
    const lastSeenDaysBack = randomInt(rng, 0, 29);

    const asset: Asset = {
      id: generateId(rng, 'asset'),
      tagId: `RFID-${String(i + 1).padStart(6, '0')}`,
      name: `${prefix}-${String(i + 1).padStart(4, '0')}`,
      site,
      status,
      severity,
      lastSeenAt: generateTimestamp(rng, lastSeenDaysBack),
      createdAt: generateTimestamp(rng, createdDaysBack),
      metadata: {
        category: prefix.toLowerCase(),
        zone: `Zone-${pick(rng, ['A', 'B', 'C', 'D'])}`,
      },
    };

    assets.push(asset);

    // Generate scans for this asset
    for (let j = 0; j < opts.scansPerAsset; j++) {
      const scanDaysBack = randomInt(rng, 0, 29);
      const scan: Scan = {
        id: generateId(rng, 'scan'),
        assetId: asset.id,
        site: j === 0 ? asset.site : pick(rng, SITES), // First scan at asset's site
        scannedAt: generateTimestamp(rng, scanDaysBack),
        readerId: pick(rng, READER_IDS),
      };
      scans.push(scan);
    }

    // Maybe generate an incident for this asset
    if (
      (status === 'missing' || status === 'anomaly') &&
      rng() < opts.incidentProbability
    ) {
      const incidentDaysBack = randomInt(rng, 0, 14);
      const isResolved = status === 'resolved' || rng() < 0.2;

      const incident: Incident = {
        id: generateId(rng, 'incident'),
        assetId: asset.id,
        severity: asset.severity,
        description: pick(rng, INCIDENT_DESCRIPTIONS),
        createdAt: generateTimestamp(rng, incidentDaysBack),
        ...(isResolved
          ? {
              resolvedAt: generateTimestamp(rng, Math.max(0, incidentDaysBack - 1)),
              resolvedBy: pick(rng, SEED_USERS.filter((u) => u.role === 'admin')).id,
              resolutionReason: 'Issue investigated and resolved per SOP.',
            }
          : {}),
      };
      incidents.push(incident);
    }
  }

  // Generate audit logs
  for (let i = 0; i < opts.auditLogCount; i++) {
    const daysBack = randomInt(rng, 0, 30);
    const action = pick(rng, AUDIT_ACTIONS);
    const user = pick(rng, SEED_USERS);
    const asset = pick(rng, assets);

    const resourceType = action.startsWith('user')
      ? 'user'
      : action.startsWith('incident')
        ? 'incident'
        : action.startsWith('scan')
          ? 'scan'
          : 'asset';

    const auditLog: AuditLog = {
      id: generateId(rng, 'audit'),
      userId: user.id,
      action,
      resourceType,
      resourceId: resourceType === 'user' ? user.id : asset.id,
      details: {
        userName: user.name,
        assetName: resourceType !== 'user' ? asset.name : undefined,
      },
      timestamp: generateTimestamp(rng, daysBack),
    };
    auditLogs.push(auditLog);
  }

  // Sort audit logs by timestamp (most recent first)
  auditLogs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    users: SEED_USERS,
    assets,
    scans,
    incidents,
    auditLogs,
  };
}

/**
 * Default seed data instance (deterministic)
 */
export const DEFAULT_SEED_DATA = generateSeedData();
