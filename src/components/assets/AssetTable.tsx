import React, { useEffect, useState } from 'react';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useSessionStore } from '../../store/useSessionStore';
import { listAssets, setClientConfig } from '../../api/client';
import type { Asset, Severity } from '../../domain/types';
import { SeverityBadge } from './SeverityBadge';
import { formatRelative } from '../../utils/time';

/**
 * AssetTable component displays assets in a DataGrid with React Query data fetching
 * Includes role-based API calls and selection behavior
 */
export function AssetTable() {
  const role = useSessionStore((state) => state.role);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Sync API client with current role
  useEffect(() => {
    setClientConfig({ role });
  }, [role]);

  // Fetch assets with React Query
  const { data: assets, isLoading, error, isSuccess } = useQuery({
    queryKey: ['assets', role], // Include role in key (different roles might see different data)
    queryFn: () => listAssets(),
  });

  // Ensure assets is always an array
  const safeAssets = Array.isArray(assets) ? assets : [];

  // Handle row click for selection (single select for master/detail pattern)
  const handleRowClick = (params: GridRowParams<Asset>) => {
    setSelectedAssetId(params.id as string);
    // TODO: In Phase 7, lift this state to parent and pass to AssetDetailPanel
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

  // Empty state
  if (isSuccess && safeAssets.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="info">No assets found</Alert>
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
        pagination={false}
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