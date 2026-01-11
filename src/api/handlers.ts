import { http, HttpResponse } from 'msw';
import { db } from './db';
import { can } from '../domain/permissions';
import type { Role } from '../domain/types';

/**
 * Extract user role from request headers
 * Returns 'operator' as default if header is missing
 */
function getRoleFromRequest(request: Request): Role {
  const roleHeader = request.headers.get('x-guardian-role');
  if (roleHeader === 'admin' || roleHeader === 'operator' || roleHeader === 'auditor') {
    return roleHeader;
  }
  return 'operator';
}

/**
 * Extract user ID from request headers
 */
function getUserIdFromRequest(request: Request): string {
  return request.headers.get('x-guardian-user-id') || 'user-001';
}

// GET /api/assets - List all assets with optional filtering
const getAssetsHandler = http.get('/api/assets', ({ request }) => {
  const role = getRoleFromRequest(request);

  if (!can(role, 'view_assets')) {
    return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const site = url.searchParams.get('site');
  const status = url.searchParams.get('status');
  const severity = url.searchParams.get('severity');
  const search = url.searchParams.get('search');

  let assets = db.getAssets();

  if (site) {
    assets = assets.filter((a) => a.site === site);
  }
  if (status) {
    assets = assets.filter((a) => a.status === status);
  }
  if (severity) {
    assets = assets.filter((a) => a.severity === severity);
  }
  if (search) {
    const term = search.toLowerCase();
    assets = assets.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.tagId.toLowerCase().includes(term)
    );
  }

  return HttpResponse.json(assets);
});

// GET /api/assets/:id - Get single asset with related data
const getAssetByIdHandler = http.get('/api/assets/:id', ({ request, params }) => {
  const role = getRoleFromRequest(request);

  if (!can(role, 'view_asset_detail')) {
    return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;
  const asset = db.getAssetById(id as string);

  if (!asset) {
    return HttpResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const scans = db.getScansByAssetId(id as string);
  const incidents = db.getIncidentsByAssetId(id as string);

  return HttpResponse.json({
    asset,
    scans,
    incidents,
  });
});

// POST /api/scans - Create a new scan
const createScanHandler = http.post('/api/scans', async ({ request }) => {
  const role = getRoleFromRequest(request);

  if (!can(role, 'create_scan')) {
    return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json() as {
    assetId: string;
    site: string;
    readerId: string;
  };

  if (!body.assetId || !body.site || !body.readerId) {
    return HttpResponse.json(
      { error: 'Missing required fields: assetId, site, readerId' },
      { status: 400 }
    );
  }

  const asset = db.getAssetById(body.assetId);
  if (!asset) {
    return HttpResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const scan = db.createScan({
    assetId: body.assetId,
    site: body.site,
    readerId: body.readerId,
    scannedAt: new Date().toISOString(),
  });

  return HttpResponse.json(scan, { status: 201 });
});

// POST /api/incidents/:assetId/resolve - Resolve an incident (Admin only)
const resolveIncidentHandler = http.post(
  '/api/incidents/:assetId/resolve',
  async ({ request, params }) => {
    const role = getRoleFromRequest(request);
    const userId = getUserIdFromRequest(request);

    if (!can(role, 'resolve_incident')) {
      return HttpResponse.json(
        { error: 'Forbidden: Only admins can resolve incidents' },
        { status: 403 }
      );
    }

    const { assetId } = params;
    const body = await request.json() as { reason: string };

    if (!body.reason || body.reason.trim().length === 0) {
      return HttpResponse.json(
        { error: 'Resolution reason is required' },
        { status: 400 }
      );
    }

    try {
      const incident = db.resolveIncident(
        assetId as string,
        userId,
        body.reason.trim()
      );
      return HttpResponse.json(incident);
    } catch (error) {
      return HttpResponse.json(
        { error: (error as Error).message },
        { status: 404 }
      );
    }
  }
);

// GET /api/audit - Get audit logs (Auditor and Admin only)
const getAuditLogsHandler = http.get('/api/audit', ({ request }) => {
  const role = getRoleFromRequest(request);

  if (!can(role, 'view_audit')) {
    return HttpResponse.json(
      { error: 'Forbidden: Only auditors and admins can view audit logs' },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const userId = url.searchParams.get('userId');
  const resourceType = url.searchParams.get('resourceType');
  const limit = url.searchParams.get('limit');

  let logs = db.getAuditLogs();

  if (action) {
    logs = logs.filter((l) => l.action === action);
  }
  if (userId) {
    logs = logs.filter((l) => l.userId === userId);
  }
  if (resourceType) {
    logs = logs.filter((l) => l.resourceType === resourceType);
  }
  if (limit) {
    logs = logs.slice(0, parseInt(limit, 10));
  }

  return HttpResponse.json(logs);
});

// Export all handlers as an array for MSW
export const handlers = [
  getAssetsHandler,
  getAssetByIdHandler,
  createScanHandler,
  resolveIncidentHandler,
  getAuditLogsHandler,
];