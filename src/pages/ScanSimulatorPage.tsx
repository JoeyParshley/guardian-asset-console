import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import RadarIcon from '@mui/icons-material/Radar';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ScanForm } from '../components/simulator/ScanForm';
import { SimulatorControls } from '../components/simulator/SimulatorControls';
import { useSessionStore } from '../store/useSessionStore';
import { can } from '../domain/permissions';
import { formatRelative } from '../utils/time';

interface EventLogEntry {
  id: string;
  type: 'scan' | 'anomaly';
  assetName: string;
  timestamp: string;
}

/**
 * ScanSimulatorPage - simulate scan events and anomalies
 * Only accessible to Operators and Admins
 */
export default function ScanSimulatorPage() {
  const role = useSessionStore((state) => state.role);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);

  // Check permission (same as create_scan)
  const canSimulate = can(role, 'create_scan');

  // Handle new events
  const handleEvent = useCallback((type: 'scan' | 'anomaly', assetName: string) => {
    const entry: EventLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type,
      assetName,
      timestamp: new Date().toISOString(),
    };
    setEventLog((prev) => [entry, ...prev].slice(0, 50)); // Keep last 50 events
  }, []);

  // Handle scan created from manual form
  const handleScanCreated = useCallback(() => {
    // The ScanForm doesn't know which asset was scanned, so we don't add to event log here
    // The event log is primarily for auto-stream events
  }, []);

  // RBAC gating
  if (!canSimulate) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          p: 4,
        }}
      >
        <LockIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Access Restricted
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
          You do not have permission to use the scan simulator. This page is only accessible to
          Operators and Administrators.
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          Current role: <strong>{role.charAt(0).toUpperCase() + role.slice(1)}</strong>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Page Header */}
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Scan Simulator
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate scan events and inject anomalies for testing
        </Typography>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Left Column - Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ScanForm onScanCreated={handleScanCreated} />
          <SimulatorControls onEvent={handleEvent} />
        </Box>

        {/* Right Column - Event Log */}
        <Paper
          variant="outlined"
          sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 400 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Event Log</Typography>
            <Chip label={`${eventLog.length} events`} size="small" variant="outlined" />
          </Box>

          {eventLog.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                Events will appear here when auto-stream is running
              </Typography>
            </Box>
          ) : (
            <List
              dense
              sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              {eventLog.map((event) => (
                <ListItem
                  key={event.id}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 0 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {event.type === 'scan' ? (
                      <RadarIcon fontSize="small" color="primary" />
                    ) : (
                      <WarningAmberIcon fontSize="small" color="warning" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" component="span">
                          {event.assetName}
                        </Typography>
                        <Chip
                          label={event.type === 'scan' ? 'Scan' : 'Anomaly'}
                          size="small"
                          color={event.type === 'scan' ? 'primary' : 'warning'}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={formatRelative(event.timestamp)}
                    slotProps={{ secondary: { variant: 'caption' } }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
