import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Typography,
  Autocomplete,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createScan, listAssets, setClientConfig } from '../../api/client';
import { useSessionStore } from '../../store/useSessionStore';
import type { Asset } from '../../domain/types';

// Common reader IDs for simulation
const READER_IDS = ['RDR-001', 'RDR-002', 'RDR-003', 'RDR-004', 'RDR-005'];

export interface ScanFormProps {
  onScanCreated?: () => void;
}

/**
 * ScanForm - form for manually creating scan events
 */
export function ScanForm({ onScanCreated }: ScanFormProps) {
  const role = useSessionStore((state) => state.role);
  const queryClient = useQueryClient();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [site, setSite] = useState('');
  const [readerId, setReaderId] = useState(READER_IDS[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync API client with current role
  useEffect(() => {
    setClientConfig({ role });
  }, [role]);

  // Fetch assets for selection
  const { data: assets = [] } = useQuery({
    queryKey: ['assets', role],
    queryFn: () => listAssets(),
  });

  // Update site when asset is selected
  useEffect(() => {
    if (selectedAsset) {
      setSite(selectedAsset.site);
    }
  }, [selectedAsset]);

  // Mutation for creating scan
  const mutation = useMutation({
    mutationFn: () =>
      createScan({
        assetId: selectedAsset!.id,
        site,
        readerId,
      }),
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset'] });
      onScanCreated?.();
      // Clear success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: Error) => {
      setError(err.message || 'Failed to create scan');
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAsset) {
      setError('Please select an asset');
      return;
    }
    if (!site.trim()) {
      setError('Please enter a site');
      return;
    }

    mutation.mutate();
  };

  const isSubmitting = mutation.isPending;

  // Get unique sites from assets
  const sites = [...new Set(assets.map((a) => a.site))].sort();

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Manual Scan
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Simulate a scan event for an asset
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Asset selector */}
          <Autocomplete
            options={assets}
            getOptionLabel={(option) => `${option.name} (${option.tagId})`}
            value={selectedAsset}
            onChange={(_, value) => setSelectedAsset(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Asset"
                placeholder="Search assets..."
                required
              />
            )}
            size="small"
          />

          {/* Site selector */}
          <FormControl size="small" fullWidth>
            <InputLabel id="site-label">Site</InputLabel>
            <Select
              labelId="site-label"
              value={site}
              label="Site"
              onChange={(e) => setSite(e.target.value)}
            >
              {sites.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Reader ID selector */}
          <FormControl size="small" fullWidth>
            <InputLabel id="reader-label">Reader ID</InputLabel>
            <Select
              labelId="reader-label"
              value={readerId}
              label="Reader ID"
              onChange={(e) => setReaderId(e.target.value)}
            >
              {READER_IDS.map((id) => (
                <MenuItem key={id} value={id}>
                  {id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Error/Success messages */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success">Scan created successfully!</Alert>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting || !selectedAsset}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
          >
            {isSubmitting ? 'Creating...' : 'Create Scan'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
