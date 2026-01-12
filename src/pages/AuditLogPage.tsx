import { useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { AuditTable } from '../components/audit/AuditTable';
import { AuditDetailDrawer } from '../components/audit/AuditDetailDrawer';
import { useSessionStore } from '../store/useSessionStore';
import { can } from '../domain/permissions';
import type { AuditLog } from '../domain/types';

/**
 * AuditLogPage - displays audit logs with RBAC gating
 * Only accessible to Admins and Auditors
 */
export default function AuditLogPage() {
  const role = useSessionStore((state) => state.role);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Check permission
  const canViewAudit = can(role, 'view_audit');

  // Handle log selection
  const handleSelectLog = (log: AuditLog) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  // Handle drawer close
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  // RBAC gating - show access denied for unauthorized users
  if (!canViewAudit) {
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
          You do not have permission to view audit logs. This page is only accessible to Administrators and Auditors.
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
          Audit Log
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review system activity and compliance events
        </Typography>
      </Box>

      {/* Audit Table */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <AuditTable onSelectLog={handleSelectLog} />
      </Box>

      {/* Detail Drawer */}
      <AuditDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </Box>
  );
}
