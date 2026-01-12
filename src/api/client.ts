import type { Asset, AuditLog, Incident, Role, Scan } from '../domain/types';

/**
 * API client configuration
 */
interface ClientConfig {
  role: Role;
  userId: string;
}

let config: ClientConfig = {
  role: 'operator',
  userId: 'user-001',
};

/**
 * Set the current user context for API requests
 */
export function setClientConfig(newConfig: Partial<ClientConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Get the current client configuration
 */
export function getClientConfig(): ClientConfig {
  return { ...config };
}

/**
 * Build headers with role and user ID for RBAC
 */
function buildHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-guardian-role': config.role,
    'x-guardian-user-id': config.userId,
  };
}

/**
 * Generic error type for API responses
 */
export interface ApiError {
  error: string;
}

/**
 * Check if response is an error
 */
function isApiError(data: unknown): data is ApiError {
  return typeof data === 'object' && data !== null && 'error' in data;
}

/**
 * Fetch wrapper with error handling
 */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...options?.headers,
    },
  });

  // Check if response is JSON before parsing
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  let data: unknown;

  if (!isJson) {
    // If we get HTML, it likely means MSW isn't intercepting the request
    const text = await response.text();
    if (text.trim().startsWith('<!')) {
      throw new Error(
        'Received HTML instead of JSON. This usually means the API mock service (MSW) is not running. Please refresh the page or check the browser console for MSW initialization errors.'
      );
    }
    throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
  }

  // Try to parse as JSON, but handle cases where content-type is wrong
  try {
    const text = await response.text();
    if (text.trim().startsWith('<!')) {
      throw new Error(
        'Received HTML instead of JSON. This usually means the API mock service (MSW) is not running. Please refresh the page or check the browser console for MSW initialization errors.'
      );
    }
    data = JSON.parse(text);
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTML instead of JSON')) {
      throw error;
    }
    throw new Error(`Failed to parse JSON response: ${(error as Error).message}`);
  }

  if (!response.ok) {
    if (isApiError(data)) {
      throw new Error(data.error);
    }
    throw new Error(`API error: ${response.status}`);
  }

  return data as T;
}

// ============================================================
// Asset API
// ============================================================

export interface ListAssetsParams {
  site?: string;
  status?: string;
  severity?: string;
  search?: string;
}

/**
 * List all assets with optional filtering
 */
export async function listAssets(params?: ListAssetsParams): Promise<Asset[]> {
  const searchParams = new URLSearchParams();

  if (params?.site) searchParams.set('site', params.site);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.severity) searchParams.set('severity', params.severity);
  if (params?.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const url = query ? `/api/assets?${query}` : '/api/assets';

  return apiFetch<Asset[]>(url);
}

export interface AssetDetail {
  asset: Asset;
  scans: Scan[];
  incidents: Incident[];
}

/**
 * Get a single asset by ID with related scans and incidents
 */
export async function getAsset(id: string): Promise<AssetDetail> {
  return apiFetch<AssetDetail>(`/api/assets/${id}`);
}

// ============================================================
// Scan API
// ============================================================

export interface CreateScanInput {
  assetId: string;
  site: string;
  readerId: string;
}

/**
 * Create a new scan record
 */
export async function createScan(input: CreateScanInput): Promise<Scan> {
  return apiFetch<Scan>('/api/scans', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// ============================================================
// Incident API
// ============================================================

export interface CreateIncidentInput {
  assetId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
}

/**
 * Create a new incident (for simulator anomaly injection)
 */
export async function createIncident(input: CreateIncidentInput): Promise<Incident> {
  return apiFetch<Incident>('/api/incidents', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export interface ResolveIncidentInput {
  reason: string;
}

/**
 * Resolve an incident for an asset (Admin only)
 */
export async function resolveIncident(
  assetId: string,
  input: ResolveIncidentInput
): Promise<Incident> {
  return apiFetch<Incident>(`/api/incidents/${assetId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

// ============================================================
// Audit API
// ============================================================

export interface ListAuditLogsParams {
  action?: string;
  userId?: string;
  resourceType?: string;
  limit?: number;
}

/**
 * List audit logs with optional filtering (Auditor and Admin only)
 */
export async function listAuditLogs(
  params?: ListAuditLogsParams
): Promise<AuditLog[]> {
  const searchParams = new URLSearchParams();

  if (params?.action) searchParams.set('action', params.action);
  if (params?.userId) searchParams.set('userId', params.userId);
  if (params?.resourceType) searchParams.set('resourceType', params.resourceType);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  const url = query ? `/api/audit?${query}` : '/api/audit';

  return apiFetch<AuditLog[]>(url);
}
