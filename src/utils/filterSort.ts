import type { Asset, AssetStatus, Severity } from '../domain/types';
import { compareSeverity } from './severity';
import { compareTimestampsDesc } from './time';

/**
 * Filter criteria for assets
 */
export interface AssetFilters {
  search?: string;
  status?: AssetStatus[];
  severity?: Severity[];
  site?: string[];
}

/**
 * Sort options for assets
 */
export type AssetSortField = 'name' | 'lastSeenAt' | 'severity' | 'site' | 'status';
export type SortDirection = 'asc' | 'desc';

export interface AssetSort {
  field: AssetSortField;
  direction: SortDirection;
}

/**
 * Filter assets by search term (matches name, tagId, or site)
 */
export function filterBySearch(assets: Asset[], search: string): Asset[] {
  if (!search.trim()) {
    return assets;
  }
  const term = search.toLowerCase().trim();
  return assets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(term) ||
      asset.tagId.toLowerCase().includes(term) ||
      asset.site.toLowerCase().includes(term)
  );
}

/**
 * Filter assets by status
 */
export function filterByStatus(assets: Asset[], statuses: AssetStatus[]): Asset[] {
  if (!statuses.length) {
    return assets;
  }
  return assets.filter((asset) => statuses.includes(asset.status));
}

/**
 * Filter assets by severity
 */
export function filterBySeverity(assets: Asset[], severities: Severity[]): Asset[] {
  if (!severities.length) {
    return assets;
  }
  return assets.filter((asset) => severities.includes(asset.severity));
}

/**
 * Filter assets by site
 */
export function filterBySite(assets: Asset[], sites: string[]): Asset[] {
  if (!sites.length) {
    return assets;
  }
  return assets.filter((asset) => sites.includes(asset.site));
}

/**
 * Apply all filters to an asset list
 */
export function applyFilters(assets: Asset[], filters: AssetFilters): Asset[] {
  let result = assets;

  if (filters.search) {
    result = filterBySearch(result, filters.search);
  }
  if (filters.status?.length) {
    result = filterByStatus(result, filters.status);
  }
  if (filters.severity?.length) {
    result = filterBySeverity(result, filters.severity);
  }
  if (filters.site?.length) {
    result = filterBySite(result, filters.site);
  }

  return result;
}

/**
 * Sort assets by a field
 */
export function sortAssets(assets: Asset[], sort: AssetSort): Asset[] {
  const sorted = [...assets];
  const multiplier = sort.direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (sort.field) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'site':
        return multiplier * a.site.localeCompare(b.site);
      case 'status':
        return multiplier * a.status.localeCompare(b.status);
      case 'severity':
        return multiplier * compareSeverity(a.severity, b.severity);
      case 'lastSeenAt':
        return multiplier * compareTimestampsDesc(a.lastSeenAt, b.lastSeenAt);
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Apply filters and sorting to an asset list
 */
export function filterAndSortAssets(
  assets: Asset[],
  filters: AssetFilters,
  sort?: AssetSort
): Asset[] {
  let result = applyFilters(assets, filters);

  if (sort) {
    result = sortAssets(result, sort);
  }

  return result;
}

/**
 * Get unique sites from an asset list
 */
export function getUniqueSites(assets: Asset[]): string[] {
  const sites = new Set(assets.map((a) => a.site));
  return Array.from(sites).sort();
}

/**
 * Count assets by status
 */
export function countByStatus(assets: Asset[]): Record<AssetStatus, number> {
  const counts: Record<AssetStatus, number> = {
    active: 0,
    missing: 0,
    anomaly: 0,
    resolved: 0,
  };

  for (const asset of assets) {
    counts[asset.status]++;
  }

  return counts;
}

/**
 * Count assets by severity
 */
export function countBySeverity(assets: Asset[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  for (const asset of assets) {
    counts[asset.severity]++;
  }

  return counts;
}
