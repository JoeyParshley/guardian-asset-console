import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CategoryIcon from '@mui/icons-material/Category';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import type { AuditLog } from '../../domain/types';
import { formatTimestamp } from '../../utils/time';

export interface AuditDetailDrawerProps {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}

/**
 * Get action display label
 */
function getActionLabel(action: string): string {
  const parts = action.split('.');
  if (parts.length === 2) {
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1]}`;
  }
  return action;
}

/**
 * Get action color
 */
function getActionColor(action: string): 'success' | 'info' | 'warning' | 'default' {
  if (action.includes('resolve')) return 'success';
  if (action.includes('create')) return 'info';
  if (action.includes('update')) return 'warning';
  return 'default';
}

/**
 * AuditDetailDrawer - displays detailed information about an audit log entry
 */
export function AuditDetailDrawer({ log, open, onClose }: AuditDetailDrawerProps) {
  if (!log) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 } },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">Audit Log Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {/* Action Badge */}
          <Box sx={{ mb: 3 }}>
            <Chip
              label={getActionLabel(log.action)}
              color={getActionColor(log.action)}
              size="medium"
            />
          </Box>

          {/* Details Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Timestamp */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <AccessTimeIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body2">{formatTimestamp(log.timestamp)}</Typography>
              </Box>
            </Box>

            {/* User */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <PersonIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  User ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {log.userId}
                </Typography>
              </Box>
            </Box>

            {/* Resource Type */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <CategoryIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Resource Type
                </Typography>
                <Typography variant="body2">
                  {log.resourceType.charAt(0).toUpperCase() + log.resourceType.slice(1)}
                </Typography>
              </Box>
            </Box>

            {/* Resource ID */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <FingerprintIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Resource ID
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                >
                  {log.resourceId}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Details Section */}
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Event Details
          </Typography>

          {log.details && Object.keys(log.details).length > 0 ? (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Box
                component="pre"
                sx={{
                  margin: 0,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(log.details, null, 2)}
              </Box>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No additional details recorded
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Log ID */}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Log ID
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}
            >
              {log.id}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
