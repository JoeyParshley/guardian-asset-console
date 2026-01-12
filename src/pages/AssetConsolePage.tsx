import { useCallback, useMemo, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { FiltersBar } from '../components/assets/FiltersBar';
import { AssetTable, type AssetTableFilters } from '../components/assets/AssetTable';
import { AssetDetailPanel } from '../components/assets/AssetDetailPanel';
import type { Asset, AssetStatus, Severity } from '../domain/types';
import { getUniqueSites } from '../utils/filterSort';

// Initial empty filter state
const INITIAL_FILTERS: AssetTableFilters = {
  search: '',
  status: [],
  severity: [],
  site: '',
};

export default function AssetConsolePage() {
  // Filter state - kept minimal
  const [filters, setFilters] = useState<AssetTableFilters>(INITIAL_FILTERS);

  // Track all loaded assets to derive sites list
  const [allAssets, setAllAssets] = useState<Asset[]>([]);

  // Selected asset for detail panel
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Derive sites list from assets
  const sites = useMemo(() => getUniqueSites(allAssets), [allAssets]);

  // Filter handlers - using useCallback to prevent unnecessary re-renders
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const handleStatusChange = useCallback((value: AssetStatus[]) => {
    setFilters((prev) => ({ ...prev, status: value }));
  }, []);

  const handleSeverityChange = useCallback((value: Severity[]) => {
    setFilters((prev) => ({ ...prev, severity: value }));
  }, []);

  const handleSiteChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, site: value }));
  }, []);

  const handleClear = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  // Handle assets loaded from table (for deriving sites)
  const handleAssetsLoaded = useCallback((assets: Asset[]) => {
    // Only update if we have no filters applied (to get the full sites list)
    if (
      !filters.search &&
      filters.status.length === 0 &&
      filters.severity.length === 0 &&
      !filters.site
    ) {
      setAllAssets(assets);
    }
  }, [filters]);

  // Handle asset selection
  const handleAssetSelect = useCallback((assetId: string | null) => {
    setSelectedAssetId(assetId);
  }, []);

  return (
    <MainLayout
      filters={
        <FiltersBar
          search={filters.search}
          status={filters.status}
          severity={filters.severity}
          site={filters.site}
          sites={sites}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onSeverityChange={handleSeverityChange}
          onSiteChange={handleSiteChange}
          onClear={handleClear}
        />
      }
      table={
        <AssetTable
          filters={filters}
          onAssetsLoaded={handleAssetsLoaded}
          selectedAssetId={selectedAssetId}
          onAssetSelect={handleAssetSelect}
        />
      }
      detail={<AssetDetailPanel assetId={selectedAssetId} />}
    />
  );
}
