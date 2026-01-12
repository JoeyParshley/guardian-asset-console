import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Button,
  InputAdornment,
  OutlinedInput,
  Chip,
  type SelectChangeEvent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import type { AssetStatus, Severity } from '../../domain/types';

// All possible status and severity values
const STATUS_OPTIONS: AssetStatus[] = ['active', 'missing', 'anomaly', 'resolved'];
const SEVERITY_OPTIONS: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];

export interface FiltersBarProps {
  search: string;
  status: AssetStatus[];
  severity: Severity[];
  site: string;
  sites: string[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: AssetStatus[]) => void;
  onSeverityChange: (value: Severity[]) => void;
  onSiteChange: (value: string) => void;
  onClear: () => void;
}

/**
 * FiltersBar component for filtering assets
 * Includes search, multi-select status/severity, and site dropdown
 */
export function FiltersBar({
  search,
  status,
  severity,
  site,
  sites,
  onSearchChange,
  onStatusChange,
  onSeverityChange,
  onSiteChange,
  onClear,
}: FiltersBarProps) {
  // Local state for debounced search input
  const [searchInput, setSearchInput] = useState(search);

  // Sync local search state when prop changes (e.g., on clear)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, onSearchChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleStatusChange = useCallback(
    (event: SelectChangeEvent<AssetStatus[]>) => {
      const value = event.target.value;
      onStatusChange(typeof value === 'string' ? (value.split(',') as AssetStatus[]) : value);
    },
    [onStatusChange]
  );

  const handleSeverityChange = useCallback(
    (event: SelectChangeEvent<Severity[]>) => {
      const value = event.target.value;
      onSeverityChange(typeof value === 'string' ? (value.split(',') as Severity[]) : value);
    },
    [onSeverityChange]
  );

  const handleSiteChange = useCallback(
    (event: SelectChangeEvent<string>) => {
      onSiteChange(event.target.value);
    },
    [onSiteChange]
  );

  // Check if any filters are active
  const hasActiveFilters = search || status.length > 0 || severity.length > 0 || site;

  // Capitalize helper for display
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
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
      {/* Search input */}
      <TextField
        size="small"
        placeholder="Search assets..."
        value={searchInput}
        onChange={handleSearchChange}
        sx={{ minWidth: 200, flex: '1 1 200px', maxWidth: 300 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Status multi-select */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="status-filter-label">Status</InputLabel>
        <Select
          labelId="status-filter-label"
          id="status-filter"
          multiple
          value={status}
          onChange={handleStatusChange}
          input={<OutlinedInput label="Status" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={capitalize(value)} size="small" />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: { maxHeight: 300 },
            },
          }}
        >
          {STATUS_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              <Checkbox checked={status.includes(s)} size="small" />
              <ListItemText primary={capitalize(s)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Severity multi-select */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="severity-filter-label">Severity</InputLabel>
        <Select
          labelId="severity-filter-label"
          id="severity-filter"
          multiple
          value={severity}
          onChange={handleSeverityChange}
          input={<OutlinedInput label="Severity" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={capitalize(value)} size="small" />
              ))}
            </Box>
          )}
          MenuProps={{
            PaperProps: {
              style: { maxHeight: 300 },
            },
          }}
        >
          {SEVERITY_OPTIONS.map((s) => (
            <MenuItem key={s} value={s}>
              <Checkbox checked={severity.includes(s)} size="small" />
              <ListItemText primary={capitalize(s)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Site dropdown */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="site-filter-label">Site</InputLabel>
        <Select
          labelId="site-filter-label"
          id="site-filter"
          value={site}
          onChange={handleSiteChange}
          input={<OutlinedInput label="Site" />}
        >
          <MenuItem value="">
            <em>All Sites</em>
          </MenuItem>
          {sites.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
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
          onClick={onClear}
          sx={{ flexShrink: 0 }}
        >
          Clear
        </Button>
      )}
    </Box>
  );
}
