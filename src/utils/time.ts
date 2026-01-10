import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

/**
 * Format an ISO8601 timestamp to a human-readable date/time
 */
export function formatTimestamp(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) {
    return 'Invalid date';
  }
  return format(date, 'MMM d, yyyy h:mm a');
}

/**
 * Format an ISO8601 timestamp to just the date
 */
export function formatDate(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) {
    return 'Invalid date';
  }
  return format(date, 'MMM d, yyyy');
}

/**
 * Format an ISO8601 timestamp to just the time
 */
export function formatTime(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) {
    return 'Invalid time';
  }
  return format(date, 'h:mm:ss a');
}

/**
 * Format an ISO8601 timestamp as relative time (e.g., "5 minutes ago")
 */
export function formatRelative(isoString: string): string {
  const date = parseISO(isoString);
  if (!isValid(date)) {
    return 'Invalid date';
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Get current time as ISO8601 UTC string
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Create an ISO8601 UTC string from a Date
 */
export function toISO(date: Date): string {
  return date.toISOString();
}

/**
 * Parse an ISO8601 string to a Date object
 */
export function fromISO(isoString: string): Date | null {
  const date = parseISO(isoString);
  return isValid(date) ? date : null;
}

/**
 * Check if an ISO string represents a date in the past
 */
export function isPast(isoString: string): boolean {
  const date = parseISO(isoString);
  if (!isValid(date)) {
    return false;
  }
  return date < new Date();
}

/**
 * Compare two ISO timestamps for sorting (ascending)
 */
export function compareTimestamps(a: string, b: string): number {
  const dateA = parseISO(a);
  const dateB = parseISO(b);
  return dateA.getTime() - dateB.getTime();
}

/**
 * Compare two ISO timestamps for sorting (descending - most recent first)
 */
export function compareTimestampsDesc(a: string, b: string): number {
  return -compareTimestamps(a, b);
}
