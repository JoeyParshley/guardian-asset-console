import { useEffect } from 'react';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSessionStore } from '../../store/useSessionStore';
import { listAssets, setClientConfig, type ListAssetsParams } from '../../api/client';
import type { Asset, AssetStatus, Severity } from '../../domain/types';
import { SeverityBadge } from './SeverityBadge';
import { formatRelative } from '../../utils/time';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export interface AssetTableFilters {
  search: string;
  status: AssetStatus[];
  severity: Severity[];
  site: string;
}

export interface AssetTableProps {
  filters: AssetTableFilters;
  onAssetsLoaded?: (assets: Asset[]) => void;
  selectedAssetId?: string | null;
  onAssetSelect?: (assetId: string | null) => void;
}

/**
 * AssetTable component displays assets in a DataGrid with React Query data fetching
 * Includes role-based API calls, filtering, and selection behavior
 */
export function AssetTable({
  filters,
  onAssetsLoaded,
  selectedAssetId,
  onAssetSelect,
}: AssetTableProps) {
  const role = useSessionStore((state) => state.role);

  // Sync API client with current role
  useEffect(() => {
    setClientConfig({ role });
  }, [role]);

  // Build query params from filters
  const queryParams: ListAssetsParams = {};
  if (filters.search) queryParams.search = filters.search;
  if (filters.status.length > 0) queryParams.status = filters.status.join(',');
  if (filters.severity.length > 0) queryParams.severity = filters.severity.join(',');
  if (filters.site) queryParams.site = filters.site;

  // Fetch assets with React Query
  const { data: assets, isLoading, error, isSuccess } = useQuery({
    queryKey: ['assets', role, filters], // Include filters in key for cache isolation
    queryFn: () => listAssets(queryParams),
  });

  // Ensure assets is always an array
  const safeAssets = Array.isArray(assets) ? assets : [];

  // Notify parent of loaded assets (for deriving sites list)
  useEffect(() => {
    if (isSuccess && onAssetsLoaded) {
      onAssetsLoaded(safeAssets);
    }
  }, [isSuccess, safeAssets, onAssetsLoaded]);

  // Handle row click for selection (single select for master/detail pattern)
  const handleRowClick = (params: GridRowParams<Asset>) => {
    const newId = params.id as string;
    if (onAssetSelect) {
      onAssetSelect(newId === selectedAssetId ? null : newId);
    }
  };

  // Define columns
  const columns: GridColDef<Asset>[] = [
    {
      field: 'tagId',
      headerName: 'Tag ID',
      width: 150,
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'site',
      headerName: 'Site',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      valueFormatter: (value) => {
        // Capitalize first letter
        return value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : '';
      },
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 130,
      renderCell: (params) => {
        // Defensive checks
        if (!params || params.value === undefined || params.value === null) {
          return null;
        }
        try {
          return <SeverityBadge severity={params.value as Severity} />;
        } catch (error) {
          console.error('Error rendering severity badge:', error, params);
          return null;
        }
      },
    },
    {
      field: 'lastSeenAt',
      headerName: 'Last Seen',
      width: 180,
      valueFormatter: (value) => {
        if (!value) return 'Never';
        return formatRelative(value as string);
      },
    },
  ];

  // Check if any filters are active
  const hasActiveFilters =
    filters.search || filters.status.length > 0 || filters.severity.length > 0 || filters.site;

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Failed to load assets: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  // Empty state - different message based on whether filters are active
  if (isSuccess && safeAssets.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          minHeight: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        <SearchOffIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" gutterBottom>
          {hasActiveFilters ? 'No assets match your filters' : 'No assets found'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {hasActiveFilters
            ? 'Try adjusting your search or filter criteria'
            : 'Assets will appear here once they are added to the system'}
        </Typography>
      </Box>
    );
  }

  // Only render DataGrid when we have successfully loaded data with assets
  if (!isSuccess || safeAssets.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', minHeight: 400 }}>
      <DataGrid
        rows={safeAssets}
        columns={columns}
        getRowId={(row) => row.id}
        onRowClick={handleRowClick}
        rowSelectionModel={selectedAssetId ? { type: 'include' as const, ids: new Set([selectedAssetId]) } : { type: 'include' as const, ids: new Set<string>() }}
        pageSizeOptions={[100]}
        hideFooter
        autoHeight
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        initialState={{
          sorting: {
            sortModel: [{ field: 'lastSeenAt', sort: 'desc' }],
          },
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            cursor: 'pointer',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: 'action.selected',
            },
          },
        }}
      />
    </Box>
  );
}
