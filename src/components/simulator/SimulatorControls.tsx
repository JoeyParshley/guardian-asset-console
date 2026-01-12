import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RadarIcon from '@mui/icons-material/Radar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createScan, createIncident, listAssets, setClientConfig } from '../../api/client';
import { useSessionStore } from '../../store/useSessionStore';
import type { Asset, Severity } from '../../domain/types';

// Reader IDs for simulation
const READER_IDS = ['RDR-001', 'RDR-002', 'RDR-003', 'RDR-004', 'RDR-005'];

// Anomaly descriptions
const ANOMALY_DESCRIPTIONS = [
  'Asset detected in unauthorized location',
  'Asset signal interference detected',
  'Unexpected movement pattern observed',
  'Asset offline for extended period',
  'Reader communication failure',
  'Tamper alert triggered',
];

export interface SimulatorControlsProps {
  onEvent?: (type: 'scan' | 'anomaly', assetName: string) => void;
}

/**
 * SimulatorControls - auto-stream scans and anomaly injection
 */
export function SimulatorControls({ onEvent }: SimulatorControlsProps) {
  const role = useSessionStore((state) => state.role);
  const queryClient = useQueryClient();

  // Auto-stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const [intervalMs, setIntervalMs] = useState(2000);
  const [scanCount, setScanCount] = useState(0);

  // Anomaly injection state
  const [anomalyEnabled, setAnomalyEnabled] = useState(false);
  const [anomalyChance, setAnomalyChance] = useState(10); // percentage
  const [anomalyCount, setAnomalyCount] = useState(0);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Interval ref
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync API client with current role
  useEffect(() => {
    setClientConfig({ role });
  }, [role]);

  // Fetch assets
  const { data: assets = [] } = useQuery({
    queryKey: ['assets', role],
    queryFn: () => listAssets(),
  });

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: (asset: Asset) =>
      createScan({
        assetId: asset.id,
        site: asset.site,
        readerId: READER_IDS[Math.floor(Math.random() * READER_IDS.length)],
      }),
    onSuccess: (_, asset) => {
      setScanCount((c) => c + 1);
      onEvent?.('scan', asset.name);
      // Invalidate queries periodically (every 5 scans to avoid too many refreshes)
      if (scanCount % 5 === 0) {
        queryClient.invalidateQueries({ queryKey: ['assets'] });
      }
    },
    onError: (err: Error) => {
      setError(`Scan failed: ${err.message}`);
    },
  });

  // Anomaly mutation
  const anomalyMutation = useMutation({
    mutationFn: (asset: Asset) => {
      const severities: Severity[] = ['critical', 'high', 'medium'];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const description =
        ANOMALY_DESCRIPTIONS[Math.floor(Math.random() * ANOMALY_DESCRIPTIONS.length)];
      return createIncident({
        assetId: asset.id,
        severity,
        description,
      });
    },
    onSuccess: (_, asset) => {
      setAnomalyCount((c) => c + 1);
      onEvent?.('anomaly', asset.name);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset'] });
    },
    onError: (err: Error) => {
      setError(`Anomaly injection failed: ${err.message}`);
    },
  });

  // Generate a random event
  const generateEvent = useCallback(() => {
    if (assets.length === 0) return;

    const randomAsset = assets[Math.floor(Math.random() * assets.length)];

    // Check if we should inject an anomaly
    if (anomalyEnabled && Math.random() * 100 < anomalyChance) {
      anomalyMutation.mutate(randomAsset);
    } else {
      scanMutation.mutate(randomAsset);
    }
  }, [assets, anomalyEnabled, anomalyChance, scanMutation, anomalyMutation]);

  // Start/stop streaming
  useEffect(() => {
    if (isStreaming && assets.length > 0) {
      intervalRef.current = setInterval(generateEvent, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming, intervalMs, generateEvent, assets.length]);

  const handleStartStop = () => {
    if (isStreaming) {
      setIsStreaming(false);
    } else {
      setError(null);
      setIsStreaming(true);
    }
  };

  const handleReset = () => {
    setScanCount(0);
    setAnomalyCount(0);
    setError(null);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Auto-Stream
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Automatically generate scan events at regular intervals
      </Typography>

      {/* Stream Controls */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            color={isStreaming ? 'error' : 'success'}
            onClick={handleStartStop}
            startIcon={isStreaming ? <StopIcon /> : <PlayArrowIcon />}
            disabled={assets.length === 0}
          >
            {isStreaming ? 'Stop' : 'Start'}
          </Button>
          <Button variant="outlined" onClick={handleReset} disabled={isStreaming}>
            Reset Counters
          </Button>
        </Box>

        {isStreaming && <LinearProgress sx={{ mb: 2 }} />}

        {/* Interval slider */}
        <Typography variant="body2" gutterBottom>
          Interval: {(intervalMs / 1000).toFixed(1)}s
        </Typography>
        <Slider
          value={intervalMs}
          onChange={(_, value) => setIntervalMs(value as number)}
          min={500}
          max={5000}
          step={100}
          disabled={isStreaming}
          marks={[
            { value: 500, label: '0.5s' },
            { value: 2000, label: '2s' },
            { value: 5000, label: '5s' },
          ]}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Anomaly Injection */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={anomalyEnabled}
              onChange={(e) => setAnomalyEnabled(e.target.checked)}
              color="warning"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningAmberIcon fontSize="small" color="warning" />
              <Typography variant="body2">Enable Anomaly Injection</Typography>
            </Box>
          }
        />

        {anomalyEnabled && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Anomaly Chance: {anomalyChance}%
            </Typography>
            <Slider
              value={anomalyChance}
              onChange={(_, value) => setAnomalyChance(value as number)}
              min={1}
              max={50}
              disabled={isStreaming}
              marks={[
                { value: 1, label: '1%' },
                { value: 25, label: '25%' },
                { value: 50, label: '50%' },
              ]}
            />
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Statistics */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip
          icon={<RadarIcon />}
          label={`Scans: ${scanCount}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          icon={<WarningAmberIcon />}
          label={`Anomalies: ${anomalyCount}`}
          color="warning"
          variant="outlined"
        />
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {assets.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No assets available. Load the Assets page first.
        </Alert>
      )}
    </Paper>
  );
}
