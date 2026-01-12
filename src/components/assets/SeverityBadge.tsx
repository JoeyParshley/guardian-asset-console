import React from 'react';
import { Chip } from '@mui/material';
import type { Severity } from '../../domain/types';
import { getSeverityColor, getSeverityBgColor, getSeverityLabel } from '../../utils/severity';

interface SeverityBadgeProps {
  severity: Severity;
}

/**
 * SeverityBadge component displays a severity level with calm, trustworthy styling
 */
export function SeverityBadge({ severity }: SeverityBadgeProps) {
  // Defensive check
  if (!severity) {
    return null;
  }

  const color = getSeverityColor(severity);
  const bgColor = getSeverityBgColor(severity);
  const label = getSeverityLabel(severity);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        backgroundColor: bgColor,
        color: color,
        fontWeight: 500,
        fontSize: '0.75rem',
        height: 24,
        '& .MuiChip-label': {
          padding: '0 8px',
        },
      }}
    />
  );
}
