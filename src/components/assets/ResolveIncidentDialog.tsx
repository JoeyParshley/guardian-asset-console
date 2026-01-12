import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resolveIncident } from '../../api/client';
import type { Incident } from '../../domain/types';

export interface ResolveIncidentDialogProps {
  open: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
  incident: Incident;
}

/**
 * Dialog for resolving an incident with a required reason
 * Admin-only functionality with proper error handling
 */
export function ResolveIncidentDialog({
  open,
  onClose,
  assetId,
  assetName,
  incident,
}: ResolveIncidentDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Mutation for resolving the incident
  const mutation = useMutation({
    mutationFn: () => resolveIncident(assetId, { reason: reason.trim() }),
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      handleClose();
    },
    onError: (err: Error) => {
      // Handle 403 and other errors
      if (err.message.includes('Forbidden') || err.message.includes('403')) {
        setError('You do not have permission to resolve incidents. Only administrators can perform this action.');
      } else {
        setError(err.message || 'Failed to resolve incident. Please try again.');
      }
    },
  });

  const handleClose = () => {
    setReason('');
    setError(null);
    mutation.reset();
    onClose();
  };

  const handleSubmit = () => {
    setError(null);

    // Validate reason
    if (!reason.trim()) {
      setError('A resolution reason is required.');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Please provide a more detailed reason (at least 10 characters).');
      return;
    }

    mutation.mutate();
  };

  const isSubmitting = mutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Resolve Incident</DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            You are resolving an incident for:
          </Typography>
          <Typography variant="subtitle1" fontWeight={600}>
            {assetName}
          </Typography>
        </Box>

        <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Incident Description
          </Typography>
          <Typography variant="body2">{incident.description}</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          label="Resolution Reason"
          placeholder="Describe how this incident was resolved..."
          multiline
          rows={4}
          fullWidth
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isSubmitting}
          required
          error={!!error && !reason.trim()}
          helperText="Required. Provide a clear explanation of the resolution for audit purposes."
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !reason.trim()}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isSubmitting ? 'Resolving...' : 'Resolve Incident'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
