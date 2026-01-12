import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RadarIcon from '@mui/icons-material/Radar';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { getAsset } from '../../api/client';
import { SeverityBadge } from './SeverityBadge';
import { ResolveIncidentDialog } from './ResolveIncidentDialog';
import { useSessionStore } from '../../store/useSessionStore';
import { can } from '../../domain/permissions';
import type { Incident, Scan } from '../../domain/types';
import { formatTimestamp, formatRelative, compareTimestampsDesc } from '../../utils/time';

export interface AssetDetailPanelProps {
  assetId: string | null;
}

// Timeline event types
type TimelineEvent =
  | { type: 'scan'; data: Scan; timestamp: string }
  | { type: 'incident'; data: Incident; timestamp: string }
  | { type: 'resolution'; data: Incident; timestamp: string };

/**
 * Capitalize first letter of a string
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Get status chip color based on asset status
 */
function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'active':
      return 'success';
    case 'resolved':
      return 'default';
    case 'missing':
      return 'warning';
    case 'anomaly':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * AssetDetailPanel - displays detailed information about a selected asset
 * with a calm, investigation-focused layout
 */
export function AssetDetailPanel({ assetId }: AssetDetailPanelProps) {
  const role = useSessionStore((state) => state.role);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);

  // Check if user can resolve incidents (Admin only)
  const canResolve = can(role, 'resolve_incident');

  // Fetch asset details when assetId is provided
  const {
    data: assetDetail,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => getAsset(assetId!),
    enabled: !!assetId,
  });

  // Build timeline from scans and incidents
  const timeline = useMemo((): TimelineEvent[] => {
    if (!assetDetail) return [];

    const events: TimelineEvent[] = [];

    // Add scans
    for (const scan of assetDetail.scans) {
      events.push({
        type: 'scan',
        data: scan,
        timestamp: scan.scannedAt,
      });
    }

    // Add incidents (and resolutions if resolved)
    for (const incident of assetDetail.incidents) {
      events.push({
        type: 'incident',
        data: incident,
        timestamp: incident.createdAt,
      });

      if (incident.resolvedAt) {
        events.push({
          type: 'resolution',
          data: incident,
          timestamp: incident.resolvedAt,
        });
      }
    }

    // Sort by timestamp descending (most recent first)
    events.sort((a, b) => compareTimestampsDesc(a.timestamp, b.timestamp));

    return events;
  }, [assetDetail]);

  // Empty state - no asset selected
  if (!assetId) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          color: 'text.secondary',
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" gutterBottom>
          Select an asset to view details
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click on a row in the asset table to see its full history and information
        </Typography>
      </Box>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Failed to load asset details: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  // No data (shouldn't happen if query succeeded)
  if (!assetDetail) {
    return null;
  }

  const { asset, incidents } = assetDetail;
  const openIncidents = incidents.filter((i) => !i.resolvedAt);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* Header Section */}
      <Box sx={{ p: 3, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {asset.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {asset.tagId}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={capitalize(asset.status)}
              color={getStatusColor(asset.status)}
              size="small"
              variant="outlined"
            />
            <SeverityBadge severity={asset.severity} />
          </Box>
        </Box>

        {/* Quick Info Row */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PlaceIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {asset.site}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Last seen {formatRelative(asset.lastSeenAt)}
            </Typography>
          </Box>
          {openIncidents.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WarningAmberIcon fontSize="small" color="warning" />
              <Typography variant="body2" color="warning.main">
                {openIncidents.length} open incident{openIncidents.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Resolve Button - Admin only, when there are open incidents */}
        {openIncidents.length > 0 && canResolve && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<TaskAltIcon />}
              onClick={() => setResolveDialogOpen(true)}
            >
              Resolve Incident
            </Button>
          </Box>
        )}
      </Box>

      <Divider />

      {/* Timeline Section */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, px: 1 }}>
          Activity Timeline
        </Typography>

        {timeline.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
            No activity recorded yet
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 300, overflow: 'auto' }}>
            {timeline.slice(0, 20).map((event, index) => (
              <ListItem
                key={`${event.type}-${event.timestamp}-${index}`}
                sx={{
                  py: 1,
                  px: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {event.type === 'scan' && <RadarIcon fontSize="small" color="primary" />}
                  {event.type === 'incident' && <WarningAmberIcon fontSize="small" color="warning" />}
                  {event.type === 'resolution' && <CheckCircleOutlineIcon fontSize="small" color="success" />}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" component="span">
                        {event.type === 'scan' && `Scanned at ${event.data.site}`}
                        {event.type === 'incident' && event.data.description}
                        {event.type === 'resolution' && `Incident resolved`}
                      </Typography>
                      {event.type === 'scan' && (
                        <Typography variant="caption" color="text.secondary" component="span">
                          Reader: {event.data.readerId}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={formatTimestamp(event.timestamp)}
                  slotProps={{ secondary: { variant: 'caption' } }}
                />
              </ListItem>
            ))}
            {timeline.length > 20 && (
              <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block', textAlign: 'center' }}>
                Showing 20 of {timeline.length} events
              </Typography>
            )}
          </List>
        )}
      </Box>

      <Divider />

      {/* Related Info / Metadata Section */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, px: 1 }}>
          Asset Details
        </Typography>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">{formatTimestamp(asset.createdAt)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Scans
              </Typography>
              <Typography variant="body2">{assetDetail.scans.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Incidents
              </Typography>
              <Typography variant="body2">{incidents.length}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Resolved Incidents
              </Typography>
              <Typography variant="body2">{incidents.filter((i) => i.resolvedAt).length}</Typography>
            </Box>
          </Box>

          {/* Metadata Tags */}
          {asset.metadata && Object.keys(asset.metadata).length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                <LocalOfferIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Metadata
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(asset.metadata).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Resolve Incident Dialog */}
      {openIncidents.length > 0 && (
        <ResolveIncidentDialog
          open={resolveDialogOpen}
          onClose={() => setResolveDialogOpen(false)}
          assetId={asset.id}
          assetName={asset.name}
          incident={openIncidents[0]} // Most recent open incident
        />
      )}
    </Box>
  );
}
