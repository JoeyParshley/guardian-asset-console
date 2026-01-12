import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Chip,
  InputAdornment,
  OutlinedInput,
  type SelectChangeEvent,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import HistoryIcon from '@mui/icons-material/History';
import { listAuditLogs, setClientConfig, type ListAuditLogsParams } from '../../api/client';
import { useSessionStore } from '../../store/useSessionStore';
import type { AuditLog } from '../../domain/types';
import { formatRelative } from '../../utils/time';

// Known action types for filtering
const ACTION_OPTIONS = [
  'incident.resolve',
  'asset.create',
  'asset.update',
  'scan.create',
];

// Known resource types for filtering
const RESOURCE_TYPE_OPTIONS = [
  'incident',
  'asset',
  'scan',
];

export interface AuditTableProps {
  onSelectLog: (log: AuditLog) => void;
}

export interface AuditFilters {
  action: string;
  userId: string;
  resourceType: string;
}

const INITIAL_FILTERS: AuditFilters = {
  action: '',
  userId: '',
  resourceType: '',
};

/**
 * AuditTable - displays audit logs with filtering capabilities
 */
export function AuditTable({ onSelectLog }: AuditTableProps) {
  const role = useSessionStore((state) => state.role);
  const [filters, setFilters] = useState<AuditFilters>(INITIAL_FILTERS);
  const [userIdInput, setUserIdInput] = useState('');

  // Sync API client with current role
  useEffect(() => {
    setClientConfig({ role });
  }, [role]);

  // Debounce userId input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userIdInput !== filters.userId) {
        setFilters((prev) => ({ ...prev, userId: userIdInput }));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userIdInput, filters.userId]);

  // Build query params
  const queryParams: ListAuditLogsParams = {};
  if (filters.action) queryParams.action = filters.action;
  if (filters.userId) queryParams.userId = filters.userId;
  if (filters.resourceType) queryParams.resourceType = filters.resourceType;

  // Fetch audit logs
  const { data: logs, isLoading, error, isSuccess } = useQuery({
    queryKey: ['audit', role, filters],
    queryFn: () => listAuditLogs(queryParams),
  });

  const safeLogs = Array.isArray(logs) ? logs : [];

  // Handle row click
  const handleRowClick = useCallback(
    (params: GridRowParams<AuditLog>) => {
      onSelectLog(params.row);
    },
    [onSelectLog]
  );

  // Filter handlers
  const handleActionChange = useCallback((event: SelectChangeEvent<string>) => {
    setFilters((prev) => ({ ...prev, action: event.target.value }));
  }, []);

  const handleResourceTypeChange = useCallback((event: SelectChangeEvent<string>) => {
    setFilters((prev) => ({ ...prev, resourceType: event.target.value }));
  }, []);

  const handleClear = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setUserIdInput('');
  }, []);

  const hasActiveFilters = filters.action || filters.userId || filters.resourceType;

  // Get action display name
  const getActionLabel = (action: string): string => {
    const parts = action.split('.');
    if (parts.length === 2) {
      return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1]}`;
    }
    return action;
  };

  // Get action color
  const getActionColor = (action: string): 'success' | 'info' | 'warning' | 'default' => {
    if (action.includes('resolve')) return 'success';
    if (action.includes('create')) return 'info';
    if (action.includes('update')) return 'warning';
    return 'default';
  };

  // Define columns
  const columns: GridColDef<AuditLog>[] = [
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 180,
      valueFormatter: (value) => formatRelative(value as string),
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 160,
      renderCell: (params) => (
        <Chip
          label={getActionLabel(params.value)}
          size="small"
          color={getActionColor(params.value)}
          variant="outlined"
        />
      ),
    },
    {
      field: 'userId',
      headerName: 'User',
      width: 140,
    },
    {
      field: 'resourceType',
      headerName: 'Resource',
      width: 120,
      valueFormatter: (value) =>
        value ? String(value).charAt(0).toUpperCase() + String(value).slice(1) : '',
    },
    {
      field: 'resourceId',
      headerName: 'Resource ID',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
        >
          {params.value}
        </Typography>
      ),
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

  // Error state (including 403)
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isForbidden = errorMessage.includes('Forbidden') || errorMessage.includes('403');

    return (
      <Box sx={{ p: 2 }}>
        <Alert severity={isForbidden ? 'warning' : 'error'}>
          {isForbidden
            ? 'You do not have permission to view audit logs. Only administrators and auditors can access this page.'
            : `Failed to load audit logs: ${errorMessage}`}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      {/* Filters Bar */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        {/* User ID search */}
        <TextField
          size="small"
          placeholder="Filter by user ID..."
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          sx={{ minWidth: 180 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Action filter */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="action-filter-label">Action</InputLabel>
          <Select
            labelId="action-filter-label"
            value={filters.action}
            onChange={handleActionChange}
            input={<OutlinedInput label="Action" />}
          >
            <MenuItem value="">
              <em>All Actions</em>
            </MenuItem>
            {ACTION_OPTIONS.map((action) => (
              <MenuItem key={action} value={action}>
                {getActionLabel(action)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Resource Type filter */}
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="resource-filter-label">Resource</InputLabel>
          <Select
            labelId="resource-filter-label"
            value={filters.resourceType}
            onChange={handleResourceTypeChange}
            input={<OutlinedInput label="Resource" />}
          >
            <MenuItem value="">
              <em>All Resources</em>
            </MenuItem>
            {RESOURCE_TYPE_OPTIONS.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear button */}
        {hasActiveFilters && (
          <Button
            variant="text"
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </Box>

      {/* Empty state */}
      {isSuccess && safeLogs.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            color: 'text.secondary',
          }}
        >
          <HistoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            {hasActiveFilters ? 'No logs match your filters' : 'No audit logs yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasActiveFilters
              ? 'Try adjusting your filter criteria'
              : 'Audit logs will appear here as actions are performed'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 400 }}>
          <DataGrid
            rows={safeLogs}
            columns={columns}
            getRowId={(row) => row.id}
            onRowClick={handleRowClick}
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } },
              sorting: { sortModel: [{ field: 'timestamp', sort: 'desc' }] },
            }}
            sx={{
              border: 'none',
              bgcolor: 'background.paper',
              '& .MuiDataGrid-cell:focus': { outline: 'none' },
              '& .MuiDataGrid-row:hover': { cursor: 'pointer' },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
