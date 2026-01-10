import type { Severity } from '../domain/types';

/**
 * Severity levels in order from most to least severe
 */
export const SEVERITY_ORDER: Severity[] = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
];

/**
 * Numeric weight for each severity level (higher = more severe)
 */
export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

/**
 * Color palette for severity levels (MUI-compatible)
 */
export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#d32f2f', // red
  high: '#f57c00',     // orange
  medium: '#fbc02d',   // amber
  low: '#1976d2',      // blue
  info: '#757575',     // grey
};

/**
 * Background colors for severity badges (lighter variants)
 */
export const SEVERITY_BG_COLORS: Record<Severity, string> = {
  critical: '#ffebee',
  high: '#fff3e0',
  medium: '#fffde7',
  low: '#e3f2fd',
  info: '#fafafa',
};

/**
 * Human-readable labels for severity levels
 */
export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

/**
 * Get the numeric weight of a severity level
 */
export function getSeverityWeight(severity: Severity): number {
  return SEVERITY_WEIGHT[severity];
}

/**
 * Compare two severity levels for sorting (most severe first)
 */
export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_WEIGHT[b] - SEVERITY_WEIGHT[a];
}

/**
 * Compare two severity levels for sorting (least severe first)
 */
export function compareSeverityAsc(a: Severity, b: Severity): number {
  return SEVERITY_WEIGHT[a] - SEVERITY_WEIGHT[b];
}

/**
 * Check if a severity level meets or exceeds a threshold
 */
export function isSeverityAtLeast(
  severity: Severity,
  threshold: Severity
): boolean {
  return SEVERITY_WEIGHT[severity] >= SEVERITY_WEIGHT[threshold];
}

/**
 * Get all severity levels at or above a threshold
 */
export function getSeveritiesAtLeast(threshold: Severity): Severity[] {
  const thresholdWeight = SEVERITY_WEIGHT[threshold];
  return SEVERITY_ORDER.filter((s) => SEVERITY_WEIGHT[s] >= thresholdWeight);
}

/**
 * Get the color for a severity level
 */
export function getSeverityColor(severity: Severity): string {
  return SEVERITY_COLORS[severity];
}

/**
 * Get the background color for a severity level
 */
export function getSeverityBgColor(severity: Severity): string {
  return SEVERITY_BG_COLORS[severity];
}

/**
 * Get the label for a severity level
 */
export function getSeverityLabel(severity: Severity): string {
  return SEVERITY_LABELS[severity];
}
